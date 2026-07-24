CREATE TABLE runtime_users (
  id TEXT PRIMARY KEY CHECK(length(id)=36),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL
) STRICT;
CREATE TABLE runtime_sessions (
  token_digest TEXT PRIMARY KEY CHECK(length(token_digest)=64),
  user_id TEXT NOT NULL REFERENCES runtime_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;
CREATE TABLE runtime_ai_provider_receipts (
  id TEXT PRIMARY KEY CHECK(length(id)=36),
  user_id TEXT NOT NULL REFERENCES runtime_users(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK(provider='openrouter'),
  provider_request_id TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(provider,provider_request_id)
) STRICT;
CREATE INDEX runtime_ai_receipts_identity_idx ON runtime_ai_provider_receipts(user_id,created_at DESC);
