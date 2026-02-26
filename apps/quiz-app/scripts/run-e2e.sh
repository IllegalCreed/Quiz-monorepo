#!/usr/bin/env bash
# run-e2e.sh (简化版)
# 本脚本用途：
#  1) 清理可能占用的端口（调用 cleanup-ports.sh）
#  2) 启动 preview-test.sh（负责启动前后端并记录日志）
#  3) 等待服务就绪
#  4) 运行 Cypress E2E 测试
#  5) 测试完成或中断时优雅停止服务并返回 Cypress 退出码
#
# 设计原则：复用现有脚本，保持简洁，易于维护

set -euo pipefail

# 路径设置：APP_DIR 指向 quiz-app，REPO_ROOT 指向仓库根
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$APP_DIR/../.." && pwd)"
cd "$APP_DIR"

# 日志函数
log() { printf "[run-e2e] %s\n" "$*"; }
log_error() { printf "[run-e2e] ERROR: %s\n" "$*" >&2; }

# 清理函数：优雅停止 preview-test（带重入保护）
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

# 主逻辑
# 1. 清理端口（复用现有脚本）
log "Cleaning up ports (10010, 10020)..."
sh "$REPO_ROOT/scripts/cleanup-ports.sh" "10010 10020" || true

# 2. 启动 preview-test（位于仓库根）
log "Starting preview-test ($REPO_ROOT/scripts/preview-test.sh)"
sh "$REPO_ROOT/scripts/preview-test.sh" &
PREVIEW_PID=$!

# 3. 等待服务就绪
log "Waiting for frontend (http://localhost:10010/) and backend (http://localhost:10020/api/test/hello)"
while true; do
  # 如果 preview-test 进程退出，说明启动失败（详见 $REPO_ROOT/.logs）
  if ! kill -0 "$PREVIEW_PID" 2>/dev/null; then
    log_error "preview-test process (PID $PREVIEW_PID) exited unexpectedly; see $REPO_ROOT/.logs for details"
    wait "$PREVIEW_PID" 2>/dev/null || true
    cleanup 1
  fi

  if curl -sSf "http://localhost:10010/" >/dev/null 2>&1 && \
     curl -sSf "http://localhost:10020/api/test/hello" >/dev/null 2>&1; then
    log "Servers ready"
    break
  fi
  sleep 1
done

# 4. 运行 Cypress（unset ELECTRON_RUN_AS_NODE 防止子进程继承导致 Electron 以 Node 模式启动）
log "Running Cypress..."
unset ELECTRON_RUN_AS_NODE
pnpm exec cypress run --e2e
CYP_EXIT=$?

# 5. 优雅停止服务并返回 Cypress 退出码
log "Cypress finished with exit code ${CYP_EXIT}; stopping preview-test"
cleanup "$CYP_EXIT"
