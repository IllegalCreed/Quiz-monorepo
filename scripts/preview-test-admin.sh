#!/usr/bin/env bash
# preview-test-admin.sh
# 启动 quiz-admin 前端（preview）与后端（test 模式），用于 E2E 测试
# 复用 preview-test.sh 的进程管理模式，但针对 admin 的端口和路径
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# 启动命令
FRONTEND_CMD_RAW="pnpm -C apps/quiz-admin run preview"
BACKEND_CMD_RAW="pnpm -C apps/quiz-backend run start:test"

# 包装信号处理，避免 pnpm ELIFECYCLE 噪音
FRONTEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${FRONTEND_CMD_RAW}\""
BACKEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${BACKEND_CMD_RAW}\""

mkdir -p .logs

# 端口配置（admin: 10060，backend: 10020）
FRONTEND_PORT=${FRONTEND_PORT:-10060}
BACKEND_PORT=${BACKEND_PORT:-10020}
BACKEND_HEALTH_PATH=${BACKEND_HEALTH_PATH:-/api/test/hello}
GRACEFUL_SHUTDOWN_TIMEOUT=${GRACEFUL_SHUTDOWN_TIMEOUT:-5}
PREVIEW_TIMEOUT=${PREVIEW_TIMEOUT:-10}

# 日志函数
log() { printf "[preview-test-admin] %s\n" "$*"; }
log_error() { printf "[preview-test-admin] ERROR: %s\n" "$*" >&2; }

is_process_alive() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# 启动服务（兼容 setsid/nohup/普通后台）
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

  echo "$pid"
}

# 递归终止进程树
kill_process_tree() {
  local _pid="$1"
  local children
  children=$(pgrep -P "${_pid}" 2>/dev/null || true)
  for c in $children; do
    kill_process_tree "$c"
  done
  kill -TERM "${_pid}" 2>/dev/null || true
}

force_kill_process_tree() {
  local pid="$1"
  log "Forcing kill process tree (PID: $pid)"
  for c in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill -KILL "$c" 2>/dev/null || true
  done
  kill -KILL "$pid" 2>/dev/null || true
}

# 清理函数（优雅退出）
cleanup() {
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    return
  fi
  CLEANUP_STARTED=1
  trap - INT TERM EXIT
  local code="${1:-0}"
  log "Shutdown requested — terminating servers (code=${code})"

  if is_process_alive "${FRONTEND_PID:-}"; then
    log "Terminating frontend process tree (root PID: $FRONTEND_PID)"
    kill_process_tree "$FRONTEND_PID"
  fi
  if is_process_alive "${BACKEND_PID:-}"; then
    log "Terminating backend process tree (root PID: $BACKEND_PID)"
    kill_process_tree "$BACKEND_PID"
  fi

  local i=0
  while [ "$i" -lt "$GRACEFUL_SHUTDOWN_TIMEOUT" ]; do
    sleep 1
    i=$((i + 1))
    local any=0
    if is_process_alive "${FRONTEND_PID:-}"; then any=1; fi
    if is_process_alive "${BACKEND_PID:-}"; then any=1; fi
    [ $any -eq 0 ] && break
  done

  if is_process_alive "${FRONTEND_PID:-}"; then
    force_kill_process_tree "$FRONTEND_PID"
  fi
  if is_process_alive "${BACKEND_PID:-}"; then
    force_kill_process_tree "$BACKEND_PID"
  fi

  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$code"
}

trap 'cleanup 0' INT TERM EXIT

# 清理可能占用的端口
log "Cleaning up ports before starting services..."
sh "$(dirname "$0")/cleanup-ports.sh" "10060 10020" || true

# 启动后端与前端
BACKEND_PID=$(start_service "backend" "$BACKEND_CMD" ".logs/backend-admin.log")
log "Backend PID: ${BACKEND_PID}"
FRONTEND_PID=$(start_service "frontend-admin" "$FRONTEND_CMD" ".logs/frontend-admin.log")
log "Frontend PID: ${FRONTEND_PID}"

# 等待服务就绪
wait_for() {
  local url="$1"; local timeout="$2"; local end=$((SECONDS + timeout))
  while [ $SECONDS -le $end ]; do
    if curl -sSf "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

log "Waiting up to ${PREVIEW_TIMEOUT}s for frontend (http://localhost:${FRONTEND_PORT}/)..."
if ! wait_for "http://localhost:${FRONTEND_PORT}/" "$PREVIEW_TIMEOUT"; then
  log_error "Frontend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/frontend-admin.log"
  cleanup 2
fi
log "Frontend is up."

log "Waiting up to ${PREVIEW_TIMEOUT}s for backend (http://localhost:${BACKEND_PORT}${BACKEND_HEALTH_PATH})..."
if ! wait_for "http://localhost:${BACKEND_PORT}${BACKEND_HEALTH_PATH}" "$PREVIEW_TIMEOUT"; then
  log_error "Backend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/backend-admin.log"
  cleanup 3
fi
log "Backend is up. Servers ready."

# 监控进程
while true; do
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    break
  fi
  if ! is_process_alive "$FRONTEND_PID"; then
    log_error "Frontend process exited unexpectedly; see .logs/frontend-admin.log"
    cleanup 1
  fi
  if ! is_process_alive "$BACKEND_PID"; then
    log_error "Backend process exited unexpectedly; see .logs/backend-admin.log"
    cleanup 1
  fi
  sleep 1
done
