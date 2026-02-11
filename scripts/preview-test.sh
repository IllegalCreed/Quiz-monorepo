#!/usr/bin/env bash
# preview-test.sh — 启动所有前端（preview）与后端（test 模式）服务
#
# 启动的服务：
#   - quiz-app    preview → http://localhost:10010
#   - quiz-admin  preview → http://localhost:10060
#   - quiz-backend test   → http://localhost:10020
#
# 本脚本的作用：
#  1) 启动三个服务，分别将 stdout/stderr 保存到 .logs 目录
#  2) 通过 HTTP 请求检测服务是否就绪
#  3) 若任一服务退出或超时未就绪，脚本以非 0 退出
#  4) 收到中断信号时优雅终止所有进程树并退出
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# --------------------- 服务配置 ---------------------
APP_CMD_RAW="pnpm -C apps/quiz-app run preview"
ADMIN_CMD_RAW="pnpm -C apps/quiz-admin run preview"
BACKEND_CMD_RAW="pnpm -C apps/quiz-backend run start:test"

# 包装信号处理，避免 pnpm ELIFECYCLE 噪音
APP_CMD="sh -c \"trap 'exit 0' TERM; exec ${APP_CMD_RAW}\""
ADMIN_CMD="sh -c \"trap 'exit 0' TERM; exec ${ADMIN_CMD_RAW}\""
BACKEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${BACKEND_CMD_RAW}\""

# 端口配置
APP_PORT=${APP_PORT:-10010}
ADMIN_PORT=${ADMIN_PORT:-10060}
BACKEND_PORT=${BACKEND_PORT:-10020}
BACKEND_HEALTH_PATH=${BACKEND_HEALTH_PATH:-/api/test/hello}
GRACEFUL_SHUTDOWN_TIMEOUT=${GRACEFUL_SHUTDOWN_TIMEOUT:-5}
PREVIEW_TIMEOUT=${PREVIEW_TIMEOUT:-15}

mkdir -p .logs

# --------------------- 日志与工具函数 ---------------------
log() { printf "[preview-test] %s\n" "$*"; }
log_error() { printf "[preview-test] ERROR: %s\n" "$*" >&2; }

is_process_alive() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

start_service() {
  local name="$1"; local cmd="$2"; local logfile="$3"; local pid

  if command -v setsid >/dev/null 2>&1; then
    log "Starting ${name} (setsid)" >&2
    setsid sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  elif command -v nohup >/dev/null 2>&1; then
    log "Starting ${name} (nohup)" >&2
    nohup sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  else
    log "Starting ${name} (background)" >&2
    sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  fi

  echo "$pid"
}

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

# --------------------- 清理与信号处理 ---------------------
cleanup() {
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    return
  fi
  CLEANUP_STARTED=1
  trap - INT TERM EXIT
  local code="${1:-0}"
  log "Shutdown requested — terminating servers (code=${code})"

  # 终止所有服务进程树
  for pid_var in APP_PID ADMIN_PID BACKEND_PID; do
    eval "local pid=\${${pid_var}:-}"
    if is_process_alive "$pid"; then
      log "Terminating ${pid_var} process tree (PID: $pid)"
      kill_process_tree "$pid"
    fi
  done

  # 等待优雅退出
  local i=0
  while [ "$i" -lt "$GRACEFUL_SHUTDOWN_TIMEOUT" ]; do
    sleep 1
    i=$((i + 1))
    local any=0
    for pid_var in APP_PID ADMIN_PID BACKEND_PID; do
      eval "local pid=\${${pid_var}:-}"
      if is_process_alive "$pid"; then any=1; fi
    done
    [ $any -eq 0 ] && break
  done

  # 强制终止仍然存活的进程
  for pid_var in APP_PID ADMIN_PID BACKEND_PID; do
    eval "local pid=\${${pid_var}:-}"
    if is_process_alive "$pid"; then
      force_kill_process_tree "$pid"
    fi
  done

  wait "${APP_PID:-}" "${ADMIN_PID:-}" "${BACKEND_PID:-}" 2>/dev/null || true
  exit "$code"
}

trap 'cleanup 0' INT TERM EXIT

# --------------------- 清理端口 → 启动 → 就绪检测 ---------------------
log "Starting all services: quiz-app (${APP_PORT}) + quiz-admin (${ADMIN_PORT}) + backend (${BACKEND_PORT})"
log "Cleaning up ports..."
sh "$(dirname "$0")/cleanup-ports.sh" "${APP_PORT} ${ADMIN_PORT} ${BACKEND_PORT}" || true

BACKEND_PID=$(start_service "backend" "$BACKEND_CMD" ".logs/backend.log")
log "Backend PID: ${BACKEND_PID}"
APP_PID=$(start_service "quiz-app" "$APP_CMD" ".logs/frontend.log")
log "quiz-app PID: ${APP_PID}"
ADMIN_PID=$(start_service "quiz-admin" "$ADMIN_CMD" ".logs/frontend-admin.log")
log "quiz-admin PID: ${ADMIN_PID}"

wait_for() {
  local url="$1"; local timeout="$2"; local end=$((SECONDS + timeout))
  while [ $SECONDS -le $end ]; do
    if curl -sSf "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

# 等待后端
log "Waiting up to ${PREVIEW_TIMEOUT}s for backend (http://localhost:${BACKEND_PORT}${BACKEND_HEALTH_PATH})..."
if ! wait_for "http://localhost:${BACKEND_PORT}${BACKEND_HEALTH_PATH}" "$PREVIEW_TIMEOUT"; then
  log_error "Backend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/backend.log"
  cleanup 3
fi
log "Backend is up."

# 等待 quiz-app
log "Waiting up to ${PREVIEW_TIMEOUT}s for quiz-app (http://localhost:${APP_PORT}/)..."
if ! wait_for "http://localhost:${APP_PORT}/" "$PREVIEW_TIMEOUT"; then
  log_error "quiz-app did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/frontend.log"
  cleanup 2
fi
log "quiz-app is up."

# 等待 quiz-admin
log "Waiting up to ${PREVIEW_TIMEOUT}s for quiz-admin (http://localhost:${ADMIN_PORT}/)..."
if ! wait_for "http://localhost:${ADMIN_PORT}/" "$PREVIEW_TIMEOUT"; then
  log_error "quiz-admin did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/frontend-admin.log"
  cleanup 2
fi
log "quiz-admin is up. All servers ready."

# 监控进程
while true; do
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    break
  fi
  if ! is_process_alive "$APP_PID"; then
    log_error "quiz-app process exited unexpectedly; see .logs/frontend.log"
    cleanup 1
  fi
  if ! is_process_alive "$ADMIN_PID"; then
    log_error "quiz-admin process exited unexpectedly; see .logs/frontend-admin.log"
    cleanup 1
  fi
  if ! is_process_alive "$BACKEND_PID"; then
    log_error "Backend process exited unexpectedly; see .logs/backend.log"
    cleanup 1
  fi
  sleep 1
done
