import assert from "node:assert/strict";
import test from "node:test";
import { deployWithRetry } from "../../src/provider.mjs";

const config = {
  deploymentWebhookUrl: "https://deploy.example.test/v1",
  deploymentWebhookSecret: "provider-secret-longer-than-thirty-two-characters",
  deploymentTimeoutMs: 1000,
  deploymentMaxAttempts: 3,
};

test("provider adapter retries bounded failures and validates its receipt", async () => {
  const calls = [];
  const fakeFetch = async (_url, init) => {
    calls.push(init);
    if (calls.length < 3) return new Response("unavailable", { status: 503 });
    return new Response(JSON.stringify({ receiptId: "receipt-123" }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const result = await deployWithRetry(config, { releaseId: "release-1" }, "provider-idempotency-key", fakeFetch);
  assert.equal(result.ok, true);
  assert.equal(result.receiptId, "receipt-123");
  assert.equal(result.attempts.length, 3);
  assert.equal(calls[0].headers["Idempotency-Key"], "provider-idempotency-key");
  assert.match(calls[0].headers["X-Livo-Signature-SHA256"], /^[a-f0-9]{64}$/);
});

test("provider adapter returns a typed failure after its attempt budget", async () => {
  const result = await deployWithRetry(
    { ...config, deploymentMaxAttempts: 2 },
    { releaseId: "release-2" },
    "provider-idempotency-key-2",
    async () => new Response(JSON.stringify({ wrong: true }), { status: 200 }),
  );
  assert.equal(result.ok, false);
  assert.deepEqual(result.attempts.map((attempt) => attempt.errorCode), ["INVALID_PROVIDER_RESPONSE", "INVALID_PROVIDER_RESPONSE"]);
});
