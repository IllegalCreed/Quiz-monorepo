#!/usr/bin/env bash
# run-e2e.sh — Quiz Admin E2E 测试入口
# 流程：
#  1) 清理占用端口（10060/10020）
#  2) 启动 preview-test.sh（app + admin preview + 后端 test 模式）
#  3) 等待服务就绪
#  4) 运行 Cypress E2E 测试
#  5) 优雅停止服务并返回 Cypress 退出码
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$APP_DIR/../.." && pwd)"
cd "$APP_DIR"

log() { printf "[run-e2e-admin] %s\n" "$*"; }
log_error() { printf "[run-e2e-admin] ERROR: %s\n" "$*" >&2; }

# 清理函数（带重入保护）
cleanup() {
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    return
  fi
  CLEANUP_STARTED=1

  local code="${1:-0}"
  log "Shutdown requested — terminating preview (code=${code})"
  if [ -n "${PREVIEW_PID:-}" ] && kill -0 "$PREVIEW_PID" 2>/dev/null; then
    log "Terminating preview-test process (PID: $PREVIEW_PID)"
    kill -TERM "$PREVIEW_PID" 2>/dev/null || true
    wait "$PREVIEW_PID" 2>/dev/null || true
  fi
  exit "$code"
}

trap 'cleanup 1' INT TERM

# 1. 清理端口
log "Cleaning up ports (10060, 10020)..."
sh "$REPO_ROOT/scripts/cleanup-ports.sh" "10060 10020" || true

# 2. 启动 preview-test（同时启动 app + admin + backend）
log "Starting preview-test.sh"
sh "$REPO_ROOT/scripts/preview-test.sh" &
PREVIEW_PID=$!

# 3. 等待服务就绪
log "Waiting for frontend (http://localhost:10060/) and backend (http://localhost:10020/api/test/hello)"
while true; do
  if ! kill -0 "$PREVIEW_PID" 2>/dev/null; then
    log_error "preview-test process (PID $PREVIEW_PID) exited unexpectedly; see $REPO_ROOT/.logs for details"
    wait "$PREVIEW_PID" 2>/dev/null || true
    cleanup 1
  fi

  if curl -sSf "http://localhost:10060/" >/dev/null 2>&1 && \
     curl -sSf "http://localhost:10020/api/test/hello" >/dev/null 2>&1; then
    log "Servers ready"
    break
  fi
  sleep 1
done

# 4. 运行 Cypress
log "Running Cypress..."
cross-env NODE_ENV=production cypress run --e2e
CYP_EXIT=$?

# 5. 优雅停止并返回退出码
log "Cypress finished with exit code ${CYP_EXIT}; stopping preview-test"
cleanup "$CYP_EXIT"
