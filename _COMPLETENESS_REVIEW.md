# Completeness Review: livomlivo

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 1248 project files (505 source files), 43 manifest(s), 24 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Functional but incomplete**

This is a substantive but unfinished application workflow application, not just an empty scaffold. Inspection found 505 source files across `web-ui/`, `analytics-cassandra/`, `management-jmx/`, `analytics-spi/` using Next.js, Express, JVM; however, the checked-in workflow and delivery controls do not yet demonstrate a complete, production-operable product.

## Why it is not complete

- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.
- No environment template documents required configuration and secret boundaries.
- No clear deployment/container configuration demonstrates a reproducible production topology.

## Needed features

1. Define the primary user and acceptance criteria, then complete one end-to-end workflow against persistent data instead of demo fixtures.
2. Replace mocks, placeholders, and generic AI responses with validated domain services and explicit failure/retry behavior.
3. Implement secure identity, role/tenant boundaries, input validation, secrets handling, and auditable state changes.
4. Add representative automated tests, CI quality gates, environment documentation, migrations, observability, backup, and deployment configuration.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- No CI evidence prevents broken or insecure changes from reaching a release.

## Evidence inspected

- `web-ui/src/main/webapp/plugins/ckeditor/plugins/scayt/README.md`
- `pom.xml:201`
- `web-ui/src/main/webapp/js/Chart.js`
- `web-ui/src/main/webapp/js/Chart.min.js`
- `analytics-cassandra/src/test/resources/dataSet.cql`
- `pom.xml`

## Recommended next action

Choose one real application workflow journey, define acceptance criteria and external contracts, then close its persistence, permission, integration, failure, and test gaps before expanding features.

## Implementation progress (2026-07-20)

The recommendation is implemented as an isolated supported boundary under `governed-release/`: a tenant-scoped mobile artifact release journey from application registration through developer submission, independent review, signed provider deployment, durable receipt, and audit verification. The 2020 Java 7/OSGi/Cassandra graph remains historical source and is explicitly excluded from the supported image and CI runtime; dummy authentication, installation-time Cassandra writes, Thrift, legacy service objects, and the old web UI are not exposed by the new service.

Implemented workflow and controls:

- High-entropy bearer tokens are stored only as SHA-256 digests and revalidated for active state, expiry, role, and organization on every request. DEVELOPER, REVIEWER, OPERATOR, and AUDITOR permissions are distinct; clients cannot select a tenant, and composite foreign keys prevent cross-tenant application/release/actor relationships.
- Developers register an application, record an HTTPS artifact URI and exact SHA-256 digest, and submit a versioned DRAFT. A different REVIEWER must approve or reject the submitted digest with review evidence. Database constraints and API checks prevent creator self-review.
- Operators may deploy only APPROVED or previously failed releases. Every mutation requires a bounded idempotency key; state changes require an expected version. The deployment adapter sends exact signed JSON, a stable provider idempotency key, an HMAC-SHA256 signature, and bounded timeouts/retries. Non-2xx, timeout, network, malformed-JSON, and invalid-receipt paths are typed and recorded without storing provider response bodies.
- Provider exhaustion ends in durable `DEPLOYMENT_FAILED`; a new expected-version/idempotency operation can retry. A deployment lease binds an in-progress call to its operator and key, and the same operation can resume after interruption without accepting a competing operator. Successful responses require a validated non-secret provider receipt.
- Checksummed, repeat-safe migrations create strict SQLite tables, foreign keys, uniqueness controls, optimistic versions, attempt evidence, idempotency records, and append-only per-tenant SHA-256 audit chains. Runtime uses WAL, full synchronization, a busy timeout, integrity and foreign-key checks, and verified online backup/restore. The supported topology is one writer on a durable encrypted volume.
- Strict input/body bounds, exact Origin policy, security headers, redacted structured logging, live/ready probes, one-time mode-0600 token output, a non-root/read-only container topology, environment template, CI, provider contract, security model, and operations/recovery runbook are checked in. No default token or provider secret is stored.

Verification completed on 2026-07-20:

- A clean `npm ci` completed. Six unit tests passed for configuration, HTTPS enforcement, token handling, keyed hashes, provider signature/retry, invalid provider responses, and attempt exhaustion. Two full HTTP/database integration journeys passed, covering authentication, roles, tenant isolation, duplicate/idempotency conflict, artifact validation, independent review, stale/state controls, three-attempt provider success, replay without another provider call, provider exhaustion, durable failure, versioned retry, token revocation, and audit verification.
- A fresh disposable database applied the migration and a repeat deploy as a no-op. One-time token bootstrap wrote only to a mode-0600 file; migration, SQLite integrity, foreign-key, trigger, and tenant audit checks passed.
- An online backup and restore into a nonexistent disposable path both passed the same migration/control/integrity/audit verification.
- Full and production npm audits reported zero known vulnerabilities at the low-severity threshold. Syntax checks, Compose rendering, and `git diff --check` passed. Live runtime checks returned liveness/readiness 200, authenticated list 200, unauthenticated 401, disallowed Origin 403, and retired legacy route 404. CI generates its idempotency and provider-signing credentials per run.
- Current-source Gitleaks reports no findings. A raw scan of the sole historical commit still reports six credentials in two legacy files (two REST-test API keys and four Twitter OAuth values). Both files were removed from the current tree. The checked-in baseline is limited to those exact deleted paths, CI asserts they remain absent, and the configured current/history scan passes while all other findings remain blocking.

Java and Maven are unavailable on this host, and the obsolete legacy dependency graph was neither built nor represented as supported. The local Docker/Colima daemon is stopped, so the new image could not be built locally; CI retains the image-build gate. Before launch, the owner must rotate/revoke the six historical credentials and decide coordinated Git-history remediation; certify the real deployment provider contract and artifact repository; configure managed TLS, encrypted durable storage, egress restrictions, monitoring/alert ownership, token lifecycle, retention and immutable audit export where required; and complete accessibility/API usability, load, penetration, disaster-recovery, and incident-response exercises. Multi-writer scale requires a planned server-database migration rather than sharing the SQLite volume.

## Runtime and login acceptance — 2026-07-20

- **Status:** VERIFIED
- **Startup safety:** the new root `start.sh` launches only the supported `governed-release` service and performs no dependency installation, migration, token creation, data reset, or process killing.
- **Startup:** after an explicit disposable-database migration and one-time token bootstrap, `./start.sh` launched without error on isolated port `5809`.
- **Readiness:** `/health/ready` returned `200` with verified migrations and an active token.
- **Login:** N/A; this is an API-only service with expiring bearer-token authentication, not an interactive login form. A valid project-issued token returned `200`; a missing token returned `401`.
- **Primary journey:** the authenticated operator created a durable application through `/v1/applications` and received `201`.
- **Browser/server evidence:** browser UI is N/A for this API-only runtime; HTTP behavior was exercised against the real listener and the server log contained no error, exception, unhandled rejection, or fatal event.
- **Cleanup:** the service and disposable SQLite database/token directory were stopped and removed.
- **Residual issue:** none for local startup/authentication acceptance; deployment and historical-secret owner gates remain as documented above.
