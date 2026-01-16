#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Pre-clean: free ports if something is listening (helps avoid EADDRINUSE from prior runs)
for port in 3000 4173; do
  pids=$(lsof -ti tcp:${port} || true)
  if [ -n "$pids" ]; then
    echo "Killing processes on port ${port}: $pids"
    kill -TERM $pids 2>/dev/null || true
    sleep 1
  fi
done

# Start the preview/test server in background
sh ./scripts/preview-test.sh &
PREVIEW_PID=$!

# Wait for readiness (frontend + backend)
WAIT_TIMEOUT=${PREVIEW_TEST_TIMEOUT:-60}
for i in $(seq 1 "$WAIT_TIMEOUT"); do
  if curl -sSf "http://localhost:4173/" >/dev/null 2>&1 && curl -sSf "http://localhost:3000/api/questions" >/dev/null 2>&1; then
    echo "Servers ready"
    ready=1
    break
  fi
  sleep 1
done

if [ -z "${ready-}" ]; then
  echo "Servers failed to start within ${WAIT_TIMEOUT}s; see .logs for details" >&2
  kill -TERM "$PREVIEW_PID" 2>/dev/null || true
  wait "$PREVIEW_PID" 2>/dev/null || true
  exit 2
fi

# Run Cypress (propagate its exit code)
# Run from apps/quiz-app so Cypress finds its config
pushd apps/quiz-app >/dev/null
cross-env NODE_ENV=production cypress run --e2e
CYP_EXIT=$?
popd >/dev/null

# Stop preview/test server (graceful)
kill -TERM "$PREVIEW_PID" 2>/dev/null || true
wait "$PREVIEW_PID" 2>/dev/null || true

exit "$CYP_EXIT"
