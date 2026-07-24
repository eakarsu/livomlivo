#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$script_dir/governed-release"
set -a
source "$script_dir/.env"
set +a
cd "$app_dir"

[ -d node_modules ] || { printf 'Dependencies are missing; run npm ci in governed-release.\n' >&2; exit 1; }
export PORT="${BACKEND_PORT:?BACKEND_PORT is required}"
export FRONTEND_PORT="${FRONTEND_PORT:?FRONTEND_PORT is required}"
[[ "$PORT" != "$FRONTEND_PORT" ]] || { echo 'API and UI ports must be distinct' >&2; exit 1; }
export DATABASE_PATH="${DATABASE_PATH:-${DB_PATH:-$app_dir/runtime.sqlite}}"
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

for assigned_port in "$PORT" "$FRONTEND_PORT"; do
  if lsof -nP -iTCP:"$assigned_port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $assigned_port is occupied" >&2; exit 1; fi
done

npm start & api_pid=$!
node src/ui.mjs & ui_pid=$!
cleanup() {
  kill -TERM "${api_pid:-}" "${ui_pid:-}" 2>/dev/null || true
  wait "${api_pid:-}" "${ui_pid:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
while kill -0 "$api_pid" 2>/dev/null && kill -0 "$ui_pid" 2>/dev/null; do sleep 1; done
exit 1
