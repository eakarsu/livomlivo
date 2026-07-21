import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../../src/config.mjs";

const valid = (overrides = {}) => ({
  NODE_ENV: "test",
  DATABASE_PATH: ":memory:",
  IDEMPOTENCY_SECRET: "test-idempotency-secret-longer-than-thirty-two",
  DEPLOYMENT_WEBHOOK_URL: "http://127.0.0.1:3999/deploy",
  DEPLOYMENT_WEBHOOK_SECRET: "test-provider-secret-longer-than-thirty-two",
  ...overrides,
});

test("configuration requires absolute persistence and exact origins", () => {
  assert.throws(() => loadConfig(valid({ DATABASE_PATH: "relative.sqlite" })), /absolute/);
  assert.throws(() => loadConfig(valid({ ALLOWED_ORIGINS: "https://example.test/path" })), /Invalid ALLOWED/);
});

test("production deployment providers must use HTTPS", () => {
  assert.throws(() => loadConfig(valid({ NODE_ENV: "production" })), /HTTPS/);
  assert.equal(loadConfig(valid({ NODE_ENV: "production", DEPLOYMENT_WEBHOOK_URL: "https://deploy.example.test/v1" })).nodeEnv, "production");
});
