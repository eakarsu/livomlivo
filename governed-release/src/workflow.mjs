import { randomUUID } from "node:crypto";
import { z } from "zod";
import { appendAudit } from "./audit.mjs";
import { HttpError } from "./errors.mjs";
import { prepareOperation, recordOperation } from "./idempotency.mjs";
import { deployWithRetry } from "./provider.mjs";
import { transaction } from "./database.mjs";

const applicationSchema = z.object({
  applicationKey: z.string().regex(/^[a-z0-9][a-z0-9._-]{1,79}$/),
  name: z.string().trim().min(2).max(160),
}).strict();

const releaseSchema = z.object({
  versionLabel: z.string().trim().min(1).max(80),
  artifactUri: z.string().url().refine((value) => new URL(value).protocol === "https:", "Artifact URI must use HTTPS"),
  artifactSha256: z.string().regex(/^[a-f0-9]{64}$/),
  notes: z.string().trim().max(2000).optional().transform((value) => value || null),
}).strict();

const versionSchema = z.object({ expectedVersion: z.number().int().positive() }).strict();
const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  expectedVersion: z.number().int().positive(),
  note: z.string().trim().min(4).max(1000),
}).strict();
const deploySchema = z.object({
  expectedVersion: z.number().int().positive(),
  environment: z.string().regex(/^[a-z0-9][a-z0-9._-]{1,79}$/),
}).strict();

function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "VALIDATION_FAILED", "The request body is invalid",
      result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
  }
  return result.data;
}

function releaseResponse(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    versionLabel: row.version_label,
    artifactUri: row.artifact_uri,
    artifactSha256: row.artifact_sha256,
    notes: row.notes,
    state: row.state,
    version: row.version,
    createdBy: row.created_by,
    reviewerId: row.reviewer_id,
    reviewNote: row.review_note,
    environment: row.environment,
    providerReceipt: row.provider_receipt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function operationResult(context, callback) {
  if (context.replay) return { ...context.replay, replayed: true };
  return callback();
}

function isUniqueConstraint(error) {
  return error?.message?.includes("UNIQUE") && (
    error.code?.startsWith("SQLITE_CONSTRAINT") ||
    (error.code === "ERR_SQLITE_ERROR" && error.errcode === 2067)
  );
}

export function createApplication({ database, config, principal, key, body, now = new Date() }) {
  const input = parse(applicationSchema, body);
  const context = prepareOperation(database, config, principal, key, { action: "create-application", input });
  return operationResult(context, () => transaction(database, () => {
    const id = randomUUID();
    const timestamp = now.toISOString();
    try {
      database.prepare(`INSERT INTO applications
        (id, organization_id, application_key, name, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, principal.organizationId, input.applicationKey, input.name, principal.tokenId, timestamp, timestamp);
    } catch (error) {
      if (isUniqueConstraint(error)) {
        throw new HttpError(409, "APPLICATION_EXISTS", "That application key already exists");
      }
      throw error;
    }
    appendAudit(database, {
      organizationId: principal.organizationId,
      applicationId: id,
      actorTokenId: principal.tokenId,
      eventType: "APPLICATION_CREATED",
      payload: { applicationKey: input.applicationKey },
      createdAt: now,
    });
    const response = { application: { id, applicationKey: input.applicationKey, name: input.name, version: 1, createdAt: timestamp } };
    recordOperation(database, principal, context, 201, response, now);
    return { status: 201, body: response, replayed: false };
  }));
}

export function createRelease({ database, config, principal, key, applicationId, body, now = new Date() }) {
  const input = parse(releaseSchema, body);
  const context = prepareOperation(database, config, principal, key, { action: "create-release", applicationId, input });
  return operationResult(context, () => transaction(database, () => {
    const application = database.prepare("SELECT id FROM applications WHERE id = ? AND organization_id = ?")
      .get(applicationId, principal.organizationId);
    if (!application) throw new HttpError(404, "NOT_FOUND", "Application not found");
    const id = randomUUID();
    const timestamp = now.toISOString();
    try {
      database.prepare(`INSERT INTO releases
        (id, organization_id, application_id, version_label, artifact_uri, artifact_sha256, notes,
         created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, principal.organizationId, applicationId, input.versionLabel, input.artifactUri,
          input.artifactSha256, input.notes, principal.tokenId, timestamp, timestamp);
    } catch (error) {
      if (isUniqueConstraint(error)) {
        throw new HttpError(409, "RELEASE_EXISTS", "That application version already exists");
      }
      throw error;
    }
    appendAudit(database, {
      organizationId: principal.organizationId,
      applicationId,
      releaseId: id,
      actorTokenId: principal.tokenId,
      eventType: "RELEASE_CREATED",
      fromState: null,
      toState: "DRAFT",
      payload: { artifactSha256: input.artifactSha256, versionLabel: input.versionLabel },
      createdAt: now,
    });
    const row = database.prepare("SELECT * FROM releases WHERE id = ?").get(id);
    const response = { release: releaseResponse(row) };
    recordOperation(database, principal, context, 201, response, now);
    return { status: 201, body: response, replayed: false };
  }));
}

export function submitRelease({ database, config, principal, key, releaseId, body, now = new Date() }) {
  const input = parse(versionSchema, body);
  const context = prepareOperation(database, config, principal, key, { action: "submit-release", releaseId, input });
  return operationResult(context, () => transaction(database, () => {
    const current = database.prepare("SELECT * FROM releases WHERE id = ? AND organization_id = ?")
      .get(releaseId, principal.organizationId);
    if (!current) throw new HttpError(404, "NOT_FOUND", "Release not found");
    if (current.created_by !== principal.tokenId) throw new HttpError(403, "FORBIDDEN", "Only the creating developer can submit this release");
    if (current.version !== input.expectedVersion) throw new HttpError(409, "VERSION_CONFLICT", "Reload the release before retrying");
    if (current.state !== "DRAFT") throw new HttpError(422, "INVALID_TRANSITION", `Cannot submit a ${current.state} release`);
    database.prepare("UPDATE releases SET state = 'SUBMITTED', version = version + 1, updated_at = ? WHERE id = ?")
      .run(now.toISOString(), releaseId);
    appendAudit(database, {
      organizationId: principal.organizationId, applicationId: current.application_id, releaseId,
      actorTokenId: principal.tokenId, eventType: "RELEASE_SUBMITTED", fromState: "DRAFT", toState: "SUBMITTED", createdAt: now,
    });
    const response = { release: releaseResponse(database.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId)) };
    recordOperation(database, principal, context, 200, response, now);
    return { status: 200, body: response, replayed: false };
  }));
}

export function reviewRelease({ database, config, principal, key, releaseId, body, now = new Date() }) {
  const input = parse(reviewSchema, body);
  const context = prepareOperation(database, config, principal, key, { action: "review-release", releaseId, input });
  return operationResult(context, () => transaction(database, () => {
    const current = database.prepare("SELECT * FROM releases WHERE id = ? AND organization_id = ?")
      .get(releaseId, principal.organizationId);
    if (!current) throw new HttpError(404, "NOT_FOUND", "Release not found");
    if (current.created_by === principal.tokenId) throw new HttpError(403, "INDEPENDENCE_REQUIRED", "The creator cannot review this release");
    if (current.version !== input.expectedVersion) throw new HttpError(409, "VERSION_CONFLICT", "Reload the release before retrying");
    if (current.state !== "SUBMITTED") throw new HttpError(422, "INVALID_TRANSITION", `Cannot review a ${current.state} release`);
    const state = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";
    const eventType = input.decision === "APPROVE" ? "RELEASE_APPROVED" : "RELEASE_REJECTED";
    database.prepare("UPDATE releases SET state = ?, version = version + 1, reviewer_id = ?, review_note = ?, updated_at = ? WHERE id = ?")
      .run(state, principal.tokenId, input.note, now.toISOString(), releaseId);
    appendAudit(database, {
      organizationId: principal.organizationId, applicationId: current.application_id, releaseId,
      actorTokenId: principal.tokenId, eventType, fromState: "SUBMITTED", toState: state,
      payload: { note: input.note }, createdAt: now,
    });
    const response = { release: releaseResponse(database.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId)) };
    recordOperation(database, principal, context, 200, response, now);
    return { status: 200, body: response, replayed: false };
  }));
}

export async function deployRelease({ database, config, principal, key, releaseId, body, fetchImplementation, now = new Date() }) {
  const input = parse(deploySchema, body);
  const operationRequest = { action: "deploy-release", releaseId, input };
  const context = prepareOperation(database, config, principal, key, operationRequest);
  if (context.replay) return { ...context.replay, replayed: true };

  const release = transaction(database, () => {
    const current = database.prepare(`SELECT releases.*, applications.application_key
      FROM releases JOIN applications ON applications.id = releases.application_id
      WHERE releases.id = ? AND releases.organization_id = ?`).get(releaseId, principal.organizationId);
    if (!current) throw new HttpError(404, "NOT_FOUND", "Release not found");
    if (current.state === "DEPLOYING") {
      if (
        current.deployment_key_hash !== context.keyHash ||
        current.deployment_actor_id !== principal.tokenId ||
        current.version !== input.expectedVersion + 1
      ) {
        throw new HttpError(409, "DEPLOYMENT_IN_PROGRESS", "Another deployment operation owns this release");
      }
      return current;
    }
    if (current.version !== input.expectedVersion) throw new HttpError(409, "VERSION_CONFLICT", "Reload the release before retrying");
    if (!["APPROVED", "DEPLOYMENT_FAILED"].includes(current.state)) {
      throw new HttpError(422, "INVALID_TRANSITION", `Cannot deploy a ${current.state} release`);
    }
    database.prepare(`UPDATE releases SET state = 'DEPLOYING', version = version + 1,
      environment = ?, deployment_key_hash = ?, deployment_actor_id = ?, provider_receipt = NULL, updated_at = ? WHERE id = ?`)
      .run(input.environment, context.keyHash, principal.tokenId, now.toISOString(), releaseId);
    appendAudit(database, {
      organizationId: principal.organizationId, applicationId: current.application_id, releaseId,
      actorTokenId: principal.tokenId, eventType: "DEPLOYMENT_STARTED", fromState: current.state,
      toState: "DEPLOYING", payload: { environment: input.environment }, createdAt: now,
    });
    return current;
  });

  const provider = await deployWithRetry(config, {
    releaseId,
    applicationKey: release.application_key,
    versionLabel: release.version_label,
    artifactUri: release.artifact_uri,
    artifactSha256: release.artifact_sha256,
    environment: input.environment,
  }, key, fetchImplementation);

  const completedWhileCallingProvider = prepareOperation(database, config, principal, key, operationRequest);
  if (completedWhileCallingProvider.replay) return { ...completedWhileCallingProvider.replay, replayed: true };

  return transaction(database, () => {
    for (const attempt of provider.attempts) {
      database.prepare(`INSERT INTO deployment_attempts
        (id, organization_id, release_id, attempt_number, outcome, error_code, provider_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), principal.organizationId, releaseId, attempt.attempt, attempt.outcome,
          attempt.errorCode, attempt.providerStatus, new Date(now.getTime() + attempt.attempt).toISOString());
    }
    const current = database.prepare("SELECT * FROM releases WHERE id = ? AND organization_id = ?")
      .get(releaseId, principal.organizationId);
    if (current.state !== "DEPLOYING" || current.deployment_key_hash !== context.keyHash) {
      throw new HttpError(409, "DEPLOYMENT_LEASE_LOST", "The deployment operation no longer owns this release");
    }
    const state = provider.ok ? "DEPLOYED" : "DEPLOYMENT_FAILED";
    database.prepare("UPDATE releases SET state = ?, version = version + 1, provider_receipt = ?, updated_at = ? WHERE id = ?")
      .run(state, provider.ok ? provider.receiptId : null, new Date().toISOString(), releaseId);
    appendAudit(database, {
      organizationId: principal.organizationId, applicationId: current.application_id, releaseId,
      actorTokenId: principal.tokenId, eventType: provider.ok ? "RELEASE_DEPLOYED" : "DEPLOYMENT_FAILED",
      fromState: "DEPLOYING", toState: state,
      payload: provider.ok ? { receiptId: provider.receiptId, attempts: provider.attempts.length } : { attempts: provider.attempts.length },
    });
    const response = provider.ok
      ? { release: releaseResponse(database.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId)) }
      : { error: { code: "DEPLOYMENT_PROVIDER_FAILED", message: "The deployment provider did not accept the release" } };
    const status = provider.ok ? 200 : 502;
    recordOperation(database, principal, context, status, response);
    return { status, body: response, replayed: false };
  });
}

export function listReleases(database, principal) {
  return database.prepare("SELECT * FROM releases WHERE organization_id = ? ORDER BY updated_at DESC, id DESC")
    .all(principal.organizationId).map(releaseResponse);
}

export { applicationSchema, releaseSchema, reviewSchema, deploySchema };
