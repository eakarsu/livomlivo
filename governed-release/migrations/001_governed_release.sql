PRAGMA foreign_keys = ON;

CREATE TABLE organizations (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug) AND length(slug) BETWEEN 2 AND 63),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 160),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE api_tokens (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  label TEXT NOT NULL CHECK (length(label) BETWEEN 2 AND 120),
  role TEXT NOT NULL CHECK (role IN ('DEVELOPER', 'REVIEWER', 'OPERATOR', 'AUDITOR')),
  token_digest TEXT NOT NULL UNIQUE CHECK (length(token_digest) = 64),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, organization_id)
) STRICT;

CREATE TABLE applications (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  application_key TEXT NOT NULL CHECK (application_key = lower(application_key) AND length(application_key) BETWEEN 2 AND 80),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 160),
  created_by TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, application_key),
  UNIQUE (id, organization_id),
  FOREIGN KEY (created_by, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE releases (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  application_id TEXT NOT NULL,
  version_label TEXT NOT NULL CHECK (length(version_label) BETWEEN 1 AND 80),
  artifact_uri TEXT NOT NULL CHECK (length(artifact_uri) BETWEEN 10 AND 2048),
  artifact_sha256 TEXT NOT NULL CHECK (length(artifact_sha256) = 64),
  notes TEXT CHECK (notes IS NULL OR length(notes) <= 2000),
  state TEXT NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DEPLOYING', 'DEPLOYMENT_FAILED', 'DEPLOYED')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by TEXT NOT NULL,
  reviewer_id TEXT,
  review_note TEXT CHECK (review_note IS NULL OR length(review_note) <= 1000),
  environment TEXT CHECK (environment IS NULL OR length(environment) BETWEEN 2 AND 80),
  deployment_key_hash TEXT CHECK (deployment_key_hash IS NULL OR length(deployment_key_hash) = 64),
  deployment_actor_id TEXT,
  provider_receipt TEXT CHECK (provider_receipt IS NULL OR length(provider_receipt) <= 200),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (application_id, version_label),
  UNIQUE (id, organization_id),
  FOREIGN KEY (application_id, organization_id) REFERENCES applications(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewer_id, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (deployment_actor_id, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT,
  CHECK (reviewer_id IS NULL OR reviewer_id <> created_by)
) STRICT;

CREATE INDEX releases_queue_idx ON releases (organization_id, state, updated_at DESC);

CREATE TABLE deployment_attempts (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  organization_id TEXT NOT NULL,
  release_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 10),
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCEEDED', 'FAILED')),
  error_code TEXT CHECK (error_code IS NULL OR length(error_code) <= 80),
  provider_status INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (release_id, organization_id) REFERENCES releases(id, organization_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE idempotency_operations (
  id TEXT PRIMARY KEY CHECK (length(id) = 36),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  actor_token_id TEXT NOT NULL,
  key_hash TEXT NOT NULL CHECK (length(key_hash) = 64),
  request_hash TEXT NOT NULL CHECK (length(request_hash) = 64),
  status_code INTEGER NOT NULL CHECK (status_code BETWEEN 200 AND 599),
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (organization_id, actor_token_id, key_hash),
  FOREIGN KEY (actor_token_id, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE audit_events (
  sequence INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE CHECK (length(id) = 36),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  application_id TEXT,
  release_id TEXT,
  actor_token_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('APPLICATION_CREATED', 'RELEASE_CREATED', 'RELEASE_SUBMITTED', 'RELEASE_APPROVED', 'RELEASE_REJECTED', 'DEPLOYMENT_STARTED', 'DEPLOYMENT_FAILED', 'RELEASE_DEPLOYED')),
  from_state TEXT,
  to_state TEXT,
  payload_json TEXT NOT NULL,
  previous_hash TEXT CHECK (previous_hash IS NULL OR length(previous_hash) = 64),
  row_hash TEXT NOT NULL CHECK (length(row_hash) = 64),
  created_at TEXT NOT NULL,
  FOREIGN KEY (application_id, organization_id) REFERENCES applications(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (release_id, organization_id) REFERENCES releases(id, organization_id) ON DELETE RESTRICT,
  FOREIGN KEY (actor_token_id, organization_id) REFERENCES api_tokens(id, organization_id) ON DELETE RESTRICT
) STRICT;

CREATE INDEX audit_events_chain_idx ON audit_events (organization_id, sequence);

CREATE TRIGGER audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;

CREATE TRIGGER audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;
