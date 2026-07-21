import { createHash, randomUUID } from "node:crypto";
import { canonicalJson } from "./audit.mjs";
import { HttpError, idempotencyKey } from "./errors.mjs";
import { keyedHash } from "./security.mjs";

export function prepareOperation(database, config, principal, key, request) {
  idempotencyKey(key);
  const keyHash = keyedHash(key, config.idempotencySecret);
  const requestHash = createHash("sha256").update(canonicalJson(request)).digest("hex");
  const existing = database.prepare(`SELECT request_hash, status_code, response_json
    FROM idempotency_operations WHERE organization_id = ? AND actor_token_id = ? AND key_hash = ?`)
    .get(principal.organizationId, principal.tokenId, keyHash);
  if (existing && existing.request_hash !== requestHash) {
    throw new HttpError(409, "IDEMPOTENCY_CONFLICT", "That idempotency key was used for a different operation");
  }
  return {
    keyHash,
    requestHash,
    replay: existing ? { status: existing.status_code, body: JSON.parse(existing.response_json) } : null,
  };
}

export function recordOperation(database, principal, context, status, body, now = new Date()) {
  database.prepare(`INSERT INTO idempotency_operations
    (id, organization_id, actor_token_id, key_hash, request_hash, status_code, response_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(randomUUID(), principal.organizationId, principal.tokenId, context.keyHash, context.requestHash,
      status, JSON.stringify(body), now.toISOString());
}
