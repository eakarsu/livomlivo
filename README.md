# Livomlivo: supported release-governance boundary

The checked-in Java 7/OSGi/Cassandra platform is retained as historical source, not presented as a supported production runtime. It depends on obsolete build repositories and libraries, includes dummy authentication in its distribution, couples installation to Cassandra schema/seed writes, and cannot be built on this host because Java and Maven are absent.

The supported executable boundary is [`governed-release/`](governed-release/): an authenticated, tenant-scoped workflow for registering a mobile application, creating an artifact release, submitting it for independent review, and deploying an approved digest through a signed provider contract.

## Acceptance criteria

- A DEVELOPER creates an application and immutable artifact digest, then submits the DRAFT with an expected version.
- A different REVIEWER approves or rejects the exact digest. Database constraints and API checks prevent creator self-review.
- An OPERATOR deploys only an APPROVED or previously failed release. The provider receives a signed, idempotent request and returns a validated receipt.
- Provider HTTP, timeout, and malformed-response failures are retried within a bounded budget, recorded without provider response bodies, and end in durable `DEPLOYMENT_FAILED`; a new versioned operation can retry.
- Every mutation is idempotent, every query is token-tenant scoped, token revocation/expiry is checked on every request, and workflow changes append to a verifiable tenant hash chain.

## Local validation

```sh
cd governed-release
npm ci
cp .env.example .env
# Set absolute DATABASE_PATH and replace all secret/provider placeholders.
set -a; source .env; set +a
npm run db:migrate
npm run token:create
npm run db:verify
npm test
npm run test:integration
npm audit --omit=dev --audit-level=high
npm start
```

`token:create` writes the one-time bearer token to `TOKEN_OUTPUT_PATH` with mode 0600; only its SHA-256 digest is stored. Create separate DEVELOPER, REVIEWER, OPERATOR, and AUDITOR tokens, distribute them through the deployment secret manager, and remove bootstrap variables afterward.

See [operations](docs/OPERATIONS.md), [security](docs/SECURITY.md), and the [deployment-provider contract](docs/DEPLOYMENT_PROVIDER.md). The legacy modules are not copied into the container or included in the supported CI build.
