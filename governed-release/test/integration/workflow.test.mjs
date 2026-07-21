import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { createApp } from "../../src/app.mjs";
import { openDatabase } from "../../src/database.mjs";
import { migrate } from "../../src/migrations.mjs";
import { generateApiToken, tokenDigest } from "../../src/security.mjs";

const directory = mkdtempSync(path.join(tmpdir(), "livomlivo-release-test-"));
const config = {
  nodeEnv: "test",
  port: 0,
  databasePath: path.join(directory, "workflow.sqlite"),
  migrateOnStart: false,
  allowedOrigins: ["http://localhost:8080"],
  idempotencySecret: "integration-idempotency-secret-longer-than-thirty-two",
  deploymentWebhookUrl: "http://provider.invalid/deploy",
  deploymentWebhookSecret: "integration-provider-secret-longer-than-thirty-two",
  deploymentTimeoutMs: 1000,
  deploymentMaxAttempts: 3,
};
const credentials = {};
let database;
let server;
let baseUrl;
let providerCalls = 0;
let providerMode = "retry-success";

function addToken(organizationId, role, label) {
  const token = generateApiToken();
  const id = randomUUID();
  database.prepare(`INSERT INTO api_tokens
    (id, organization_id, label, role, token_digest, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, organizationId, label, role, tokenDigest(token), "2099-01-01T00:00:00.000Z", "2026-07-20T00:00:00.000Z");
  credentials[label] = { id, token };
}

async function fakeProvider(_url, init) {
  providerCalls += 1;
  if (providerMode === "fail") return new Response("unavailable", { status: 503 });
  if (providerMode === "retry-success" && providerCalls % 3 !== 0) return new Response("unavailable", { status: 503 });
  const payload = JSON.parse(init.body);
  return new Response(JSON.stringify({ receiptId: `receipt-${payload.versionLabel}` }), { status: 200 });
}

async function api(pathname, { token, key, body, origin } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (key) headers["Idempotency-Key"] = key;
  if (origin) headers.Origin = origin;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: body === undefined ? "GET" : "POST",
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json() };
}

before(async () => {
  database = openDatabase(config.databasePath);
  migrate(database);
  const primary = randomUUID();
  const other = randomUUID();
  database.prepare("INSERT INTO organizations (id, slug, name, created_at) VALUES (?, ?, ?, ?), (?, ?, ?, ?)")
    .run(primary, "tenant-one", "Tenant One", "2026-07-20T00:00:00.000Z", other, "tenant-two", "Tenant Two", "2026-07-20T00:00:00.000Z");
  addToken(primary, "DEVELOPER", "developer");
  addToken(primary, "REVIEWER", "reviewer");
  addToken(primary, "OPERATOR", "operator");
  addToken(primary, "AUDITOR", "auditor");
  addToken(other, "OPERATOR", "other-operator");
  const app = createApp({ database, config, fetchImplementation: fakeProvider, logger: { info() {}, error() {} } });
  await new Promise((resolve) => { server = app.listen(0, "127.0.0.1", resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (database) database.close();
  rmSync(directory, { recursive: true, force: true });
});

test("governed release journey enforces identity, tenant, independence, state, retry, and audit", async () => {
  assert.equal((await api("/health/live")).response.status, 200);
  assert.equal((await api("/health/ready")).response.status, 200);
  assert.equal((await api("/v1/releases")).response.status, 401);
  assert.equal((await api("/health/live", { origin: "https://evil.example" })).response.status, 403);

  const applicationKey = randomUUID();
  const createdApplication = await api("/v1/applications", {
    token: credentials.developer.token,
    key: applicationKey,
    body: { applicationKey: "customer-mobile", name: "Customer Mobile" },
  });
  assert.equal(createdApplication.response.status, 201);
  const applicationId = createdApplication.body.application.id;

  const replay = await api("/v1/applications", {
    token: credentials.developer.token,
    key: applicationKey,
    body: { applicationKey: "customer-mobile", name: "Customer Mobile" },
  });
  assert.equal(replay.response.status, 201);
  assert.equal(replay.response.headers.get("idempotent-replay"), "true");
  const conflict = await api("/v1/applications", {
    token: credentials.developer.token,
    key: applicationKey,
    body: { applicationKey: "different", name: "Different" },
  });
  assert.equal(conflict.response.status, 409);
  const duplicateApplication = await api("/v1/applications", {
    token: credentials.developer.token,
    key: randomUUID(),
    body: { applicationKey: "customer-mobile", name: "Customer Mobile Duplicate" },
  });
  assert.equal(duplicateApplication.response.status, 409);
  assert.equal(duplicateApplication.body.error.code, "APPLICATION_EXISTS");

  const invalidArtifact = await api(`/v1/applications/${applicationId}/releases`, {
    token: credentials.developer.token,
    key: randomUUID(),
    body: { versionLabel: "0.0.0", artifactUri: "http://unsafe.test/app.zip", artifactSha256: "a".repeat(64) },
  });
  assert.equal(invalidArtifact.response.status, 400);

  const createdRelease = await api(`/v1/applications/${applicationId}/releases`, {
    token: credentials.developer.token,
    key: randomUUID(),
    body: { versionLabel: "1.0.0", artifactUri: "https://artifacts.example.test/app-1.zip", artifactSha256: "a".repeat(64), notes: "First governed release" },
  });
  assert.equal(createdRelease.response.status, 201);
  const releaseId = createdRelease.body.release.id;

  const submitted = await api(`/v1/releases/${releaseId}/submit`, {
    token: credentials.developer.token, key: randomUUID(), body: { expectedVersion: 1 },
  });
  assert.equal(submitted.body.release.state, "SUBMITTED");
  const wrongRole = await api(`/v1/releases/${releaseId}/review`, {
    token: credentials.developer.token, key: randomUUID(), body: { decision: "APPROVE", expectedVersion: 2, note: "Self approval" },
  });
  assert.equal(wrongRole.response.status, 403);
  const approved = await api(`/v1/releases/${releaseId}/review`, {
    token: credentials.reviewer.token, key: randomUUID(), body: { decision: "APPROVE", expectedVersion: 2, note: "Artifact digest and release evidence verified" },
  });
  assert.equal(approved.body.release.state, "APPROVED");

  providerCalls = 0;
  providerMode = "retry-success";
  const deployKey = randomUUID();
  const deployed = await api(`/v1/releases/${releaseId}/deploy`, {
    token: credentials.operator.token, key: deployKey, body: { expectedVersion: 3, environment: "production" },
  });
  assert.equal(deployed.response.status, 200);
  assert.equal(deployed.body.release.state, "DEPLOYED");
  assert.equal(deployed.body.release.providerReceipt, "receipt-1.0.0");
  assert.equal(providerCalls, 3);
  const deployReplay = await api(`/v1/releases/${releaseId}/deploy`, {
    token: credentials.operator.token, key: deployKey, body: { expectedVersion: 3, environment: "production" },
  });
  assert.equal(deployReplay.response.headers.get("idempotent-replay"), "true");
  assert.equal(providerCalls, 3);

  const tenantList = await api("/v1/releases", { token: credentials["other-operator"].token });
  assert.deepEqual(tenantList.body.releases, []);
  const forbiddenDeploy = await api(`/v1/releases/${releaseId}/deploy`, {
    token: credentials.auditor.token, key: randomUUID(), body: { expectedVersion: 5, environment: "production" },
  });
  assert.equal(forbiddenDeploy.response.status, 403);
  const audit = await api("/v1/audit/verify", { token: credentials.auditor.token });
  assert.equal(audit.response.status, 200);
  assert.equal(audit.body.ok, true);
  assert.equal(audit.body.checked, 6);

  database.prepare("UPDATE api_tokens SET active = 0 WHERE id = ?").run(credentials.developer.id);
  assert.equal((await api("/v1/releases", { token: credentials.developer.token })).response.status, 401);
});

test("provider exhaustion is durable and a versioned retry can succeed", async () => {
  database.prepare("UPDATE api_tokens SET active = 1 WHERE id = ?").run(credentials.developer.id);
  const app = await api("/v1/applications", {
    token: credentials.developer.token, key: randomUUID(), body: { applicationKey: "failure-path", name: "Failure Path" },
  });
  const release = await api(`/v1/applications/${app.body.application.id}/releases`, {
    token: credentials.developer.token,
    key: randomUUID(),
    body: { versionLabel: "2.0.0", artifactUri: "https://artifacts.example.test/app-2.zip", artifactSha256: "b".repeat(64) },
  });
  const id = release.body.release.id;
  await api(`/v1/releases/${id}/submit`, { token: credentials.developer.token, key: randomUUID(), body: { expectedVersion: 1 } });
  await api(`/v1/releases/${id}/review`, {
    token: credentials.reviewer.token, key: randomUUID(), body: { decision: "APPROVE", expectedVersion: 2, note: "Release evidence is complete" },
  });
  providerMode = "fail";
  const failed = await api(`/v1/releases/${id}/deploy`, {
    token: credentials.operator.token, key: randomUUID(), body: { expectedVersion: 3, environment: "staging" },
  });
  assert.equal(failed.response.status, 502);
  assert.equal(database.prepare("SELECT state, version FROM releases WHERE id = ?").get(id).state, "DEPLOYMENT_FAILED");
  providerMode = "success";
  const retried = await api(`/v1/releases/${id}/deploy`, {
    token: credentials.operator.token, key: randomUUID(), body: { expectedVersion: 5, environment: "staging" },
  });
  assert.equal(retried.response.status, 200);
  assert.equal(retried.body.release.state, "DEPLOYED");
});
