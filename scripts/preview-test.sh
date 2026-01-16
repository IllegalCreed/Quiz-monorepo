#!/usr/bin/env bash
# 这行是 "shebang"，指定用哪个解释器来运行脚本（使用系统环境中的 bash）
set -euo pipefail
# set -euo pipefail 的含义：
#  - -e：遇到任意命令返回非 0 就退出（防止误以为执行成功）
#  - -u：使用未定义变量时报错（避免因拼写错误导致静默失败）
#  - -o pipefail：管道命令中任一段失败都会导致整个管道失败（更可靠的错误传播）

# 将脚本目录的上一级（仓库根）保存到 ROOT_DIR，并切换到该目录
# 目的：保证脚本内部使用相对路径（例如 .logs 或 apps/）时一致、可预测
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# -----------------------------------------------------------------------------
# 本脚本用于：同时启动前端与后端服务、做就绪检测、保存日志与清理。
# 已重构：添加了辅助函数（start_service、kill_process_tree）、统一日志前缀（[preview-test]）
# 并尽量减少 shell 的 job-control 噪声（使用 disown），以便让日志更清晰、行为更可维护。
# 我们把注释尽可能写得很详细，方便新手理解每一步的目的与原理。
# -----------------------------------------------------------------------------

# 定义前端启动的原始命令（未经过 TERM 包装）
# 解释：使用 env npm_config_loglevel=silent 来抑制 pnpm 的日志噪音，-s 使 pnpm 更安静
FRONTEND_CMD_RAW="pnpm -C apps/quiz-app run preview"
# 定义后端启动的原始命令（未经过 TERM 包装）
BACKEND_CMD_RAW="pnpm -C apps/quiz-backend run start:test"

# 为了避免 pnpm 在被 TERM 信号中断时打印 ELIFECYCLE 错误提示，我们把命令包装为：
#  sh -c "trap 'exit 0' TERM; exec <原始命令>"
# 这样子进程收到 TERM 时会以 exit 0 退出（被视为正常结束），减少噪音
FRONTEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${FRONTEND_CMD_RAW}\""
BACKEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${BACKEND_CMD_RAW}\""

# 创建日志目录，用来保存前后端的 stdout/stderr，便于后续查看与调试
mkdir -p .logs

# ---------------------
# Logging helpers and service starter
# ---------------------
# 简单的日志前缀，方便在 CI/终端中快速定位来自 preview-test 的输出
log() { printf "[preview-test] %s\n" "$*"; }
log_error() { printf "[preview-test] ERROR: %s\n" "$*" >&2; }

# start_service <name> <cmd> <logfile>
# - 优先尝试 setsid（在 Linux 上），回退到 nohup，再回退到普通后台
# - 把 stdout/stderr 重定向到指定的 logfile
# - 在后台运行并尝试 disown 以减少 shell job-control 的噪声（避免终止时打印 'Terminated'）
start_service() {
  local name="$1"; local cmd="$2"; local logfile="$3"; local pid
  if command -v setsid >/dev/null 2>&1; then
    log "Starting ${name} (setsid): ${cmd}" >&2
    setsid sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  elif command -v nohup >/dev/null 2>&1; then
    log "Starting ${name} (nohup): ${cmd}" >&2
    nohup sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  else
    log "Starting ${name} (background): ${cmd}" >&2
    sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  fi
  # 返回启动的 root PID
  echo "$pid"
}

# 递归杀掉进程树（重命名以更清晰表达用途）
kill_process_tree() {
  local _pid="$1"
  local children
  children=$(pgrep -P "${_pid}" 2>/dev/null || true)
  for c in $children; do
    kill_process_tree "$c"
  done
  kill -TERM "${_pid}" 2>/dev/null || true
}

# ---------------------
# Cleanup & signal handling (ensure graceful shutdown and proper exit codes)
# ---------------------
SHUTTING_DOWN=0
cleanup() {
  trap - INT TERM EXIT
  SHUTTING_DOWN=1
  local code="${1:-0}"
  log "Shutdown requested — terminating servers (code=${code})"
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Terminating frontend process tree (root PID: $FRONTEND_PID)"
    kill_process_tree "$FRONTEND_PID"
  fi
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Terminating backend process tree (root PID: $BACKEND_PID)"
    kill_process_tree "$BACKEND_PID"
  fi
  # wait a short grace period
  local grace=5
  for i in $(seq 1 $grace); do
    sleep 1
    local any=0
    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then any=1; fi
    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then any=1; fi
    [ $any -eq 0 ] && break
  done
  # force kill if still alive
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Forcing kill frontend process tree"
    for c in $(pgrep -P "$FRONTEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Forcing kill backend process tree"
    for c in $(pgrep -P "$BACKEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$BACKEND_PID" 2>/dev/null || true
  fi
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$code"
}

# trap signals and ensure cleanup runs
trap 'cleanup 0' INT TERM

# ---------------------
# 简化版：统一启动并以 10s 超时检查前端与后端就绪；失败即退出非 0 以便 turbo 识别
# ---------------------
# start backend & frontend
BACKEND_PID=$(start_service "backend" "$BACKEND_CMD" ".logs/backend.log")
log "Backend PID: ${BACKEND_PID}"
FRONTEND_PID=$(start_service "frontend" "$FRONTEND_CMD" ".logs/frontend.log")
log "Frontend PID: ${FRONTEND_PID}"

# short timeout (seconds), can be overridden by PREVIEW_TIMEOUT env var
PREVIEW_TIMEOUT=${PREVIEW_TIMEOUT:-10}

wait_for() {
  local url="$1"; local timeout="$2"; local end=$((SECONDS + timeout))
  while [ $SECONDS -le $end ]; do
    if curl -sSf "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

# wait for frontend
log "Waiting up to ${PREVIEW_TIMEOUT}s for frontend (http://localhost:4173/)..."
if ! wait_for "http://localhost:4173/" "$PREVIEW_TIMEOUT"; then
  log_error "Frontend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/frontend.log"
  cleanup 2
fi
log "Frontend is up."

# wait for backend using test/hello
log "Waiting up to ${PREVIEW_TIMEOUT}s for backend (http://localhost:3000/api/test/hello)..."
if ! wait_for "http://localhost:3000/api/test/hello" "$PREVIEW_TIMEOUT"; then
  log_error "Backend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/backend.log"
  cleanup 3
fi
log "Backend is up. Servers ready."

# monitor processes and fail fast if either exits
while true; do
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log_error "Frontend process exited unexpectedly; see .logs/frontend.log"
    cleanup 1
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    log_error "Backend process exited unexpectedly; see .logs/backend.log"
    cleanup 1
  fi
  sleep 1
done
