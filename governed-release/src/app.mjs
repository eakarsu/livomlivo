import { randomUUID } from "node:crypto";
import express from "express";
import helmet from "helmet";
import { verifyAudit } from "./audit.mjs";
import { HttpError } from "./errors.mjs";
import { verifyMigrations } from "./migrations.mjs";
import { parseBearer, tokenDigest } from "./security.mjs";
import { createApplication, createRelease, deployRelease, listReleases, reviewRelease, submitRelease } from "./workflow.mjs";

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export function createApp({ database, config, fetchImplementation = fetch, logger = console }) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    req.requestId = /^[A-Za-z0-9._:-]{8,100}$/.test(req.get("X-Request-Id") ?? "") ? req.get("X-Request-Id") : randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    const started = Date.now();
    res.on("finish", () => logger.info?.(JSON.stringify({
      event: "http_request", requestId: req.requestId, method: req.method, path: req.path,
      status: res.statusCode, durationMs: Date.now() - started, actorTokenId: req.principal?.tokenId ?? null,
    })));
    next();
  });
  app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (origin && !config.allowedOrigins.includes(origin)) return next(new HttpError(403, "ORIGIN_REJECTED", "This origin is not allowed"));
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Idempotency-Key,X-Request-Id");
      return res.status(204).end();
    }
    next();
  });
  app.use(helmet());
  app.use(express.json({ limit: "64kb", strict: true }));

  app.get("/health/live", (_req, res) => res.json({ status: "live" }));
  app.get("/health/ready", (_req, res) => {
    const migrations = verifyMigrations(database);
    const activeTokens = database.prepare("SELECT count(*) AS count FROM api_tokens WHERE active = 1 AND expires_at > ?")
      .get(new Date().toISOString()).count;
    const ready = migrations.ok && activeTokens > 0;
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", migrations, activeTokens: Number(activeTokens) });
  });

  function authenticate(req, _res, next) {
    const token = parseBearer(req.get("Authorization"));
    const row = token ? database.prepare(`SELECT id, organization_id, label, role, active, expires_at
      FROM api_tokens WHERE token_digest = ?`).get(tokenDigest(token)) : null;
    if (!row || row.active !== 1 || row.expires_at <= new Date().toISOString()) {
      return next(new HttpError(401, "UNAUTHENTICATED", "A valid API token is required"));
    }
    req.principal = { tokenId: row.id, organizationId: row.organization_id, label: row.label, role: row.role };
    next();
  }

  const roles = (...allowed) => (req, _res, next) => allowed.includes(req.principal.role)
    ? next()
    : next(new HttpError(403, "FORBIDDEN", "This token role cannot perform that action"));

  app.use("/v1", authenticate);
  app.post("/v1/applications", roles("DEVELOPER", "OPERATOR"), (req, res, next) => {
    try {
      const result = createApplication({ database, config, principal: req.principal, key: req.get("Idempotency-Key"), body: req.body });
      if (result.replayed) res.setHeader("Idempotent-Replay", "true");
      res.status(result.status).json(result.body);
    } catch (error) { next(error); }
  });
  app.post("/v1/applications/:applicationId/releases", roles("DEVELOPER"), (req, res, next) => {
    try {
      const result = createRelease({ database, config, principal: req.principal, key: req.get("Idempotency-Key"), applicationId: req.params.applicationId, body: req.body });
      if (result.replayed) res.setHeader("Idempotent-Replay", "true");
      res.status(result.status).json(result.body);
    } catch (error) { next(error); }
  });
  app.post("/v1/releases/:releaseId/submit", roles("DEVELOPER"), (req, res, next) => {
    try {
      const result = submitRelease({ database, config, principal: req.principal, key: req.get("Idempotency-Key"), releaseId: req.params.releaseId, body: req.body });
      if (result.replayed) res.setHeader("Idempotent-Replay", "true");
      res.status(result.status).json(result.body);
    } catch (error) { next(error); }
  });
  app.post("/v1/releases/:releaseId/review", roles("REVIEWER"), (req, res, next) => {
    try {
      const result = reviewRelease({ database, config, principal: req.principal, key: req.get("Idempotency-Key"), releaseId: req.params.releaseId, body: req.body });
      if (result.replayed) res.setHeader("Idempotent-Replay", "true");
      res.status(result.status).json(result.body);
    } catch (error) { next(error); }
  });
  app.post("/v1/releases/:releaseId/deploy", roles("OPERATOR"), asyncRoute(async (req, res) => {
    const result = await deployRelease({ database, config, principal: req.principal, key: req.get("Idempotency-Key"), releaseId: req.params.releaseId, body: req.body, fetchImplementation });
    if (result.replayed) res.setHeader("Idempotent-Replay", "true");
    res.status(result.status).json(result.body);
  }));
  app.get("/v1/releases", (req, res) => res.json({ releases: listReleases(database, req.principal) }));
  app.get("/v1/audit/verify", roles("OPERATOR", "AUDITOR"), (req, res) => {
    const result = verifyAudit(database, req.principal.organizationId);
    res.status(result.ok ? 200 : 409).json(result);
  });

  app.use((req, _res, next) => next(new HttpError(404, "NOT_FOUND", `No route for ${req.method} ${req.path}`)));
  app.use((error, req, res, _next) => {
    const status = error instanceof HttpError ? error.status : error?.type === "entity.parse.failed" ? 400 : 500;
    if (status >= 500) logger.error?.(JSON.stringify({ event: "request_failed", requestId: req.requestId, message: error.message }));
    res.status(status).json({ error: {
      code: error instanceof HttpError ? error.code : status === 400 ? "INVALID_JSON" : "INTERNAL_ERROR",
      message: error instanceof HttpError ? error.message : status === 400 ? "The JSON body is invalid" : "The request failed",
      ...(error instanceof HttpError && error.details ? { details: error.details } : {}),
      requestId: req.requestId,
    } });
  });
  return app;
}
