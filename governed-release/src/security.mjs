import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

export function tokenDigest(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateApiToken() {
  return `lvr_${randomUUID()}_${randomBytes(32).toString("base64url")}`;
}

export function keyedHash(value, secret) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function parseBearer(header) {
  if (typeof header !== "string") return null;
  const match = /^Bearer ([A-Za-z0-9_-]{60,160})$/.exec(header);
  return match?.[1] ?? null;
}
