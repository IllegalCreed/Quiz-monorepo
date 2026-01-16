#!/usr/bin/env bash
set -euo pipefail

# start-test.sh
# - 检查是否存在 .env.test.local 或外部提供了 TEST_RESET_SECRET
# - 如果都没有，给出清晰提示并退出
# - 否则使用 NODE_ENV=test 和 ENABLE_TEST_ENDPOINT 启动 Nest 应用

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "[start-test] %s\n" "$*"; }
log_error() { printf "[start-test] ERROR: %s\n" "$*" >&2; }

# If TEST_RESET_SECRET is not provided via env and .env.test.local doesn't exist, fail fast with instruction
if [ -z "${TEST_RESET_SECRET-}" ] && [ ! -f ".env.test.local" ]; then
  log_error "TEST_RESET_SECRET not provided and apps/quiz-backend/.env.test.local not found."
  log "Generate one by running from repo root:"
  log "  pnpm -w run pretest"
  log "or run:"
  log "  sh ./scripts/regenerate-test-secret.sh"
  exit 1
fi

# Use provided ENABLE_TEST_ENDPOINT or default to true
ENABLE_TEST_ENDPOINT=${ENABLE_TEST_ENDPOINT:-true}

# Start the Nest app in test mode. If TEST_RESET_SECRET is present in env it will be used, otherwise
# dotenv will load it from .env.test.local when Nest starts.
log "Starting backend in test mode (ENABLE_TEST_ENDPOINT=${ENABLE_TEST_ENDPOINT})"
TEST_RESET_SECRET="${TEST_RESET_SECRET-}" ENABLE_TEST_ENDPOINT="${ENABLE_TEST_ENDPOINT}" NODE_ENV=test nest start
