# Operations runbook

## Deploy and bootstrap

Use Node.js 22 or 24. Set an absolute database path on a durable, encrypted volume; unique 32+ character idempotency/provider secrets; an exact HTTPS provider URL; and no browser origins unless an approved client requires one. Run migrations as a release step twice (the second is a no-op), then create distinct role tokens. Production startup refuses missing or modified migrations.

`/health/live` reports process liveness. `/health/ready` also requires the exact migration set and at least one unexpired active token. Logs are structured JSON and intentionally redact request/provider bodies and credentials. Alert on readiness failure, 5xx/provider failure, sustained 401/403, deployment retry exhaustion, and audit verification failure.

## Backup and recovery

Create a consistent online backup and verify it:

```sh
npm run backup -- /secure/backups/releases-YYYYMMDD.sqlite
```

Restore into a nonexistent disposable path:

```sh
npm run restore:verify -- /secure/backups/releases-YYYYMMDD.sqlite /tmp/releases-restored.sqlite
```

Both commands run migration-checksum, SQLite integrity, foreign-key, trigger, and tenant audit-chain checks. Store backups encrypted outside the primary failure domain. Test recovery at least quarterly and set owner-approved RPO/RTO values before launch.

To revoke access, set `api_tokens.active = 0`; do not delete actor rows referenced by releases or audit events. Rotate deployment secrets with a coordinated provider cutover. Retain artifact digests and provider receipts according to the approved release-evidence policy.

## Legacy boundary

Do not package or expose the old `distribution`, `web-ui`, dummy authentication, Cassandra installation bean, Thrift, notification, or service-object modules as part of this release. Any attempt to revive them requires a separate Java/runtime modernization, dependency and secret audit, data migration, authentication redesign, and full test/operational review.
