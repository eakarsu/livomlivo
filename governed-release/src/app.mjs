import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
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
  app.get("/api/auth/demo-credentials", (_req, res, next) => {
    if (config.nodeEnv === "production") return next(new HttpError(404, "NOT_FOUND", "Not found"));
    const email = process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "";
    const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
    if (!email || !password) return next(new HttpError(503, "DEMO_CREDENTIALS_UNAVAILABLE", "Demo credentials unavailable"));
    res.setHeader("Cache-Control", "no-store");
    return res.json({ email, password });
  });
  app.get("/health/ready", (_req, res) => {
    const migrations = verifyMigrations(database);
    const activeTokens = database.prepare("SELECT count(*) AS count FROM api_tokens WHERE active = 1 AND expires_at > ?")
      .get(new Date().toISOString()).count;
    const ready = migrations.ok && activeTokens > 0;
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", migrations, activeTokens: Number(activeTokens) });
  });

  const digest = (value) => createHash("sha256").update(value).digest("hex");
  const verifyPassword = (password, encoded) => {
    const [algorithm, salt, expected] = String(encoded || "").split("$");
    if (algorithm !== "scrypt" || !salt || !expected) return false;
    const actual = scryptSync(password, salt, 64);
    const target = Buffer.from(expected, "hex");
    return target.length === actual.length && timingSafeEqual(target, actual);
  };
  const runtimeAuthenticate = (req, _res, next) => {
    const token = parseBearer(req.get("Authorization"));
    const session = token ? database.prepare(`SELECT s.user_id,u.email,u.name,u.role,u.active
      FROM runtime_sessions s JOIN runtime_users u ON u.id=s.user_id
      WHERE s.token_digest=? AND s.expires_at>?`).get(digest(token), new Date().toISOString()) : null;
    if (!session || session.active !== 1) return next(new HttpError(401, "UNAUTHENTICATED", "A valid runtime session is required"));
    req.runtimeUser = session;
    next();
  };

  app.post("/api/auth/login", (req, res, next) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const user = email ? database.prepare("SELECT * FROM runtime_users WHERE email=?").get(email) : null;
      if (!user || user.active !== 1 || !verifyPassword(password, user.password_hash)) throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
      const token = randomBytes(32).toString("hex");
      const now = new Date(); const expires = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      database.prepare("INSERT INTO runtime_sessions(token_digest,user_id,expires_at,created_at) VALUES(?,?,?,?)")
        .run(digest(token), user.id, expires.toISOString(), now.toISOString());
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) { next(error); }
  });
  app.get("/api/auth/me", runtimeAuthenticate, (req, res) => res.json({ user: req.runtimeUser }));
  app.post("/api/runtime-ai/recommendation", runtimeAuthenticate, asyncRoute(async (req, res) => {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt || prompt.length > 4000) throw new HttpError(400, "INVALID_PROMPT", "Prompt must contain 1-4000 characters");
    const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
    const model = String(process.env.OPENROUTER_MODEL || "").trim();
    const baseUrl = String(process.env.OPENROUTER_BASE_URL || "").replace(/\/$/, "");
    if (!apiKey || !model || !baseUrl) throw new HttpError(503, "AI_NOT_CONFIGURED", "AI provider is not configured");
    const providerResponse = await fetchImplementation(`${baseUrl}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [
        { role: "system", content: "Give concise software-release governance guidance. Preserve separation of duties and require human approval for deployment decisions." },
        { role: "user", content: prompt },
      ], max_tokens: 180 }), signal: AbortSignal.timeout(45000),
    });
    const payload = await providerResponse.json().catch(() => ({}));
    const content = String(payload?.choices?.[0]?.message?.content || "").trim();
    if (!providerResponse.ok || !payload.id || !content) throw new HttpError(502, "AI_PROVIDER_FAILURE", `OpenRouter request failed with HTTP ${providerResponse.status}`);
    const receiptId = randomUUID();
    database.prepare(`INSERT INTO runtime_ai_provider_receipts
      (id,user_id,provider,provider_request_id,model,prompt,content,created_at) VALUES(?,?,'openrouter',?,?,?,?,?)`)
      .run(receiptId, req.runtimeUser.user_id, String(payload.id), String(payload.model || model), prompt, content, new Date().toISOString());
    res.json({ content, receipt: { id: receiptId, provider: "openrouter", providerRequestId: String(payload.id), model: String(payload.model || model) } });
  }));

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
