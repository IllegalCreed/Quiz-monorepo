#!/usr/bin/env bash
# 本脚本用于在本地或 CI 中运行 E2E 测试：
#  1) 清理可能占用端口的旧进程；
#  2) 启动仓库根的 `scripts/preview-test.sh`（负责同时启动前后端并记录日志）；
#  3) 等待前后端就绪；
#  4) 运行 Cypress 测试；
#  5) 测试完成或收到中断时优雅停止 preview 服务并返回 Cypress 的退出码。
#
# 注：脚本使用详尽中文注释并实现了清理逻辑（包含重入保护），以便在收到信号时能优雅退出。

set -euo pipefail
# -e：命令失败时立即退出
# -u：引用未定义变量时报错
# -o pipefail：管道中任一命令失败时把整个管道视为失败

# -------------------------------
# 工作目录（保证相对路径正确）
# -------------------------------
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# -------------------------------
# 工具函数与日志
# -------------------------------
log() { printf "[run-e2e] %s\n" "$*"; }
log_error() { printf "[run-e2e] ERROR: %s\n" "$*" >&2; }

# kill_port <port>
# - 终止占用指定 TCP 端口的进程（优雅 TERM 后等待），用于避免端口冲突
kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti tcp:${port} 2>/dev/null || true)
  if [ -n "$pids" ]; then
    log "Killing processes on port ${port}: ${pids}"
    kill -TERM $pids 2>/dev/null || true
    sleep 1
  fi
}

# -------------------------------
# Cleanup（优雅停止 preview-test）
# - 带重入保护：CLEANUP_STARTED 防止重复执行
# - 接受一个可选的退出码作为参数，最后会以该码退出（便于在 CI 中判断失败原因）
# -------------------------------
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

# 捕获中断与终止信号，触发 cleanup（使用非 0 退出码表示被外部中断）
trap 'cleanup 1' INT TERM

# -------------------------------
# 主逻辑：清理端口 -> 启动 preview -> 等待就绪 -> 运行 Cypress -> 停止 preview
# -------------------------------

# 清理端口（避免残留进程占用）
kill_port 3000
kill_port 4173

# 启动共享的 preview-test（位于仓库根），并把其 PID 保存在 PREVIEW_PID
log "Starting preview-test (scripts/preview-test.sh)"
sh ../../scripts/preview-test.sh &
PREVIEW_PID=$!

# 等待服务就绪（持续轮询，直至就绪或 preview 进程退出）
log "Waiting for frontend (http://localhost:4173/) and backend (http://localhost:3000/api/test/hello) to become available"
while true; do
  # 如果 preview-test 进程已经退出，说明启动失败或超时（preview-test 本身会记录原因到 .logs），中止并返回非 0
  if ! kill -0 "$PREVIEW_PID" 2>/dev/null; then
    log_error "preview-test process (PID $PREVIEW_PID) exited unexpectedly; see ../../.logs for details"
    wait "$PREVIEW_PID" 2>/dev/null || true
    cleanup 1
  fi

  if curl -sSf "http://localhost:4173/" >/dev/null 2>&1 && curl -sSf "http://localhost:3000/api/test/hello" >/dev/null 2>&1; then
    log "Servers ready"
    break
  fi
  sleep 1
done

# 运行 Cypress（headless）
log "Running Cypress..."
cross-env NODE_ENV=production cypress run --e2e
CYP_EXIT=$?

# 测试结束后优雅停服务并以 Cypress 的退出码结束脚本
log "Cypress finished with exit code ${CYP_EXIT}; stopping preview-test"
cleanup "$CYP_EXIT"
