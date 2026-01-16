#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

FRONTEND_CMD_RAW="env npm_config_loglevel=silent pnpm -s -C apps/quiz-app run preview"
BACKEND_CMD_RAW="env npm_config_loglevel=silent pnpm -s -C apps/quiz-backend run start:test"
# wrap so that TERM causes process to exit 0 (prevents pnpm ELIFECYCLE noise)
FRONTEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${FRONTEND_CMD_RAW}\""
BACKEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${BACKEND_CMD_RAW}\""

mkdir -p .logs

# helper: kill process tree (recursive)
kill_tree() {
  local _pid="$1"
  # get direct children and recurse
  local children
  children=$(pgrep -P "${_pid}" 2>/dev/null || true)
  for c in $children; do
    kill_tree "$c"
  done
  kill -TERM "${_pid}" 2>/dev/null || true
}

# start backend (prefer setsid; fallback to nohup; final fallback to normal start)
if command -v setsid >/dev/null 2>&1; then
  echo "Starting backend (setsid): $BACKEND_CMD"
  setsid sh -c "$BACKEND_CMD" > .logs/backend.log 2>&1 &
elif command -v nohup >/dev/null 2>&1; then
  echo "setsid not found; starting backend with nohup: $BACKEND_CMD"
  nohup sh -c "$BACKEND_CMD" > .logs/backend.log 2>&1 &
else
  echo "No setsid/nohup found; starting backend normally: $BACKEND_CMD"
  sh -c "$BACKEND_CMD" > .logs/backend.log 2>&1 &
fi
BACKEND_PID=$!

# start frontend (prefer setsid; fallback to nohup; final fallback to normal start)
if command -v setsid >/dev/null 2>&1; then
  echo "Starting frontend (setsid): $FRONTEND_CMD"
  setsid sh -c "$FRONTEND_CMD" > .logs/frontend.log 2>&1 &
elif command -v nohup >/dev/null 2>&1; then
  echo "setsid not found; starting frontend with nohup: $FRONTEND_CMD"
  nohup sh -c "$FRONTEND_CMD" > .logs/frontend.log 2>&1 &
else
  echo "No setsid/nohup found; starting frontend normally: $FRONTEND_CMD"
  sh -c "$FRONTEND_CMD" > .logs/frontend.log 2>&1 &
fi
FRONTEND_PID=$!


SHUTTING_DOWN=0
TIMER_PID=""

cleanup() {
  # prevent recursive traps
  trap - INT TERM EXIT
  SHUTTING_DOWN=1
  local code="${1:-0}"
  echo "Shutdown requested — terminating servers..."

  # terminate frontend process tree
  if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Terminating frontend process tree (root PID: $FRONTEND_PID)"
    kill_tree "$FRONTEND_PID"
  fi

  # terminate backend process tree
  if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Terminating backend process tree (root PID: $BACKEND_PID)"
    kill_tree "$BACKEND_PID"
  fi

  # cancel timeout watcher if running
  [ -n "${TIMER_PID}" ] && kill -TERM "$TIMER_PID" 2>/dev/null || true

  # wait a grace period for clean exit
  local grace=8
  echo "Waiting up to ${grace}s for processes to exit..."
  for i in $(seq 1 $grace); do
    sleep 1
    local any=0
    if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then any=1; fi
    if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then any=1; fi
    [ $any -eq 0 ] && break
  done

  # force kill process trees if still alive
  if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Forcing kill frontend process tree"
    # kill children first
    for c in $(pgrep -P "$FRONTEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Forcing kill backend process tree"
    for c in $(pgrep -P "$BACKEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$BACKEND_PID" 2>/dev/null || true
  fi

  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$code"
}

trap 'cleanup 0' INT TERM

check_url() {
  local url="$1"
  local timeout_secs="$2"
  local end=$((SECONDS + timeout_secs))
  while [ $SECONDS -le $end ]; do
    if curl -sSf "$url" > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# wait for frontend
echo "Waiting for frontend to respond on http://localhost:4173/..."
if ! check_url "http://localhost:4173/" 60; then
  echo "Frontend did not start in time; see .logs/frontend.log" >&2
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit 2
fi

echo "Frontend is up."

# wait for backend
echo "Waiting for backend to respond on http://localhost:3000/api/questions..."
if ! check_url "http://localhost:3000/api/questions" 60; then
  echo "Backend did not start in time; see .logs/backend.log" >&2
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit 2
fi

echo "Backend is up."

# start a timeout watcher (default 300s) to catch hung test runs
PREVIEW_TEST_TIMEOUT=${PREVIEW_TEST_TIMEOUT:-300}
(
  sleep "$PREVIEW_TEST_TIMEOUT"
  if [ "$SHUTTING_DOWN" -eq 0 ]; then
    echo "No test activity within ${PREVIEW_TEST_TIMEOUT}s; shutting down." >&2
    cleanup 2
  fi
) &
TIMER_PID=$!

# monitor: if either process exits unexpectedly, fail fast; if shutdown in progress, exit 0
while true; do
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    if [ "$SHUTTING_DOWN" -eq 1 ]; then
      exit 0
    fi
    echo "Frontend process exited unexpectedly; see .logs/frontend.log" >&2
    cat .logs/frontend.log >&2 || true
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    exit 1
  fi

  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    if [ "$SHUTTING_DOWN" -eq 1 ]; then
      exit 0
    fi
    echo "Backend process exited unexpectedly; see .logs/backend.log" >&2
    cat .logs/backend.log >&2 || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
    exit 1
  fi

  sleep 1
done
