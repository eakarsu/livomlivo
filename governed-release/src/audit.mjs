import { createHash, randomUUID } from "node:crypto";

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function hashEvent(event) {
  return createHash("sha256").update(canonicalJson(event)).digest("hex");
}

export function appendAudit(database, input) {
  const previous = database.prepare("SELECT row_hash FROM audit_events WHERE organization_id = ? ORDER BY sequence DESC LIMIT 1")
    .get(input.organizationId);
  const event = {
    id: randomUUID(),
    organizationId: input.organizationId,
    applicationId: input.applicationId ?? null,
    releaseId: input.releaseId ?? null,
    actorTokenId: input.actorTokenId ?? null,
    eventType: input.eventType,
    fromState: input.fromState ?? null,
    toState: input.toState ?? null,
    payload: input.payload ?? {},
    previousHash: previous?.row_hash ?? null,
    createdAt: (input.createdAt ?? new Date()).toISOString(),
  };
  const rowHash = hashEvent(event);
  database.prepare(`INSERT INTO audit_events
    (id, organization_id, application_id, release_id, actor_token_id, event_type, from_state, to_state,
     payload_json, previous_hash, row_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(event.id, event.organizationId, event.applicationId, event.releaseId, event.actorTokenId, event.eventType,
      event.fromState, event.toState, JSON.stringify(event.payload), event.previousHash, rowHash, event.createdAt);
  return { ...event, rowHash };
}

export function verifyAudit(database, organizationId) {
  const rows = database.prepare("SELECT * FROM audit_events WHERE organization_id = ? ORDER BY sequence").all(organizationId);
  let previousHash = null;
  for (const row of rows) {
    const event = {
      id: row.id,
      organizationId: row.organization_id,
      applicationId: row.application_id,
      releaseId: row.release_id,
      actorTokenId: row.actor_token_id,
      eventType: row.event_type,
      fromState: row.from_state,
      toState: row.to_state,
      payload: JSON.parse(row.payload_json),
      previousHash: row.previous_hash,
      createdAt: row.created_at,
    };
    if (row.previous_hash !== previousHash || row.row_hash !== hashEvent(event)) {
      return { ok: false, checked: rows.length, failedEventId: row.id };
    }
    previousHash = row.row_hash;
  }
  return { ok: true, checked: rows.length, head: previousHash };
}
