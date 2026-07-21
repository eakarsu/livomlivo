import assert from "node:assert/strict";
import test from "node:test";
import { generateApiToken, keyedHash, parseBearer, tokenDigest } from "../../src/security.mjs";

test("API tokens are high entropy and only stable digests need persistence", () => {
  const first = generateApiToken();
  const second = generateApiToken();
  assert.match(first, /^lvr_[0-9a-f-]{36}_[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.match(tokenDigest(first), /^[a-f0-9]{64}$/);
  assert.equal(parseBearer(`Bearer ${first}`), first);
  assert.equal(parseBearer(`Basic ${first}`), null);
});

test("keyed hashes change with their secret", () => {
  assert.notEqual(
    keyedHash("same", "first-secret-longer-than-thirty-two-characters"),
    keyedHash("same", "second-secret-longer-than-thirty-two-characters"),
  );
});
