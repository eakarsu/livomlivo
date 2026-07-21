# Security model

- Bearer credentials are high-entropy random values; only digests are persisted. Active state, expiry, role, and tenant are reloaded per request. Tokens are scoped to DEVELOPER, REVIEWER, OPERATOR, or AUDITOR and can be revoked immediately.
- Clients never provide a tenant ID. All reads and writes use the authenticated organization, and composite foreign keys prevent cross-tenant application, release, reviewer, and audit relationships.
- Mutations require idempotency keys and expected workflow versions. Strict schemas bound names, notes, URLs, hashes, and bodies. Artifacts require HTTPS and SHA-256 digests.
- The deployment provider requires HTTPS in production, HMAC-signed exact bytes, bounded timeouts/retries, a stable idempotency key, and a validated receipt.
- Audit events are database-append-only and hash-linked per tenant. Structured logs contain route/status/latency/request ID and actor token ID, not authorization headers, artifact notes, idempotency keys, provider bodies, signing secrets, or tokens.

SQLite is configured with foreign keys, WAL, full synchronization, a busy timeout, integrity checks, and online backups. The supported topology is one application writer on a durable encrypted volume. Horizontal multi-writer scale requires a planned migration to a server database while preserving idempotency and audit semantics.

Before launch, the owner must configure managed TLS and encrypted storage, rotate any historic legacy credentials, approve token lifetime/rotation and artifact retention, restrict provider network egress, export audit material to independent immutable storage where required, and complete dependency, penetration, load, recovery, and incident-response exercises.

The current tree removes an old REST test containing two API keys and an executable Twitter template containing four OAuth values. An unallowlisted scan of the sole historical commit still reports those six findings. `.gitleaks.toml` baselines only those two deleted paths, CI asserts that both remain absent, and all other current/history findings still fail the gate. The owner must rotate/revoke the values and choose coordinated history remediation; the baseline is not evidence that the old values are safe.
