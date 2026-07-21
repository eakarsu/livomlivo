#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$script_dir/governed-release"
cd "$app_dir"

[ -d node_modules ] || { printf 'Dependencies are missing; run npm ci in governed-release.\n' >&2; exit 1; }
export PORT="${PORT:-3020}"
export DATABASE_PATH="${DATABASE_PATH:-${DB_PATH:-}}"
export IDEMPOTENCY_SECRET="${IDEMPOTENCY_SECRET:-${JWT_SECRET:-}}"
export DEPLOYMENT_WEBHOOK_URL="${DEPLOYMENT_WEBHOOK_URL:-http://127.0.0.1:9/v1/releases}"
export DEPLOYMENT_WEBHOOK_SECRET="${DEPLOYMENT_WEBHOOK_SECRET:-${JWT_REFRESH_SECRET:-}}"
# Disposable test databases are created empty by acceptance and local
# integration runners. Permit migration there only; production continues to
# require the explicit reviewed migration command.
if [[ "${NODE_ENV:-development}" == "test" ]]; then
  export MIGRATE_ON_START=true
else
  export MIGRATE_ON_START=false
fi
: "${DATABASE_PATH:?DATABASE_PATH or DB_PATH is required}"
: "${IDEMPOTENCY_SECRET:?IDEMPOTENCY_SECRET or JWT_SECRET is required}"
: "${DEPLOYMENT_WEBHOOK_SECRET:?DEPLOYMENT_WEBHOOK_SECRET or JWT_REFRESH_SECRET is required}"

exec npm start
