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
# 启动后端服务（通过 start_service helper，返回 PID）
# ---------------------
# 使用 start_service 统一处理 setsid/nohup/background 并写日志
BACKEND_PID=$(start_service "backend" "$BACKEND_CMD" ".logs/backend.log")
log "Backend PID: ${BACKEND_PID}"

# ---------------------
# 启动前端服务（通过 start_service helper，返回 PID）
# ---------------------
FRONTEND_PID=$(start_service "frontend" "$FRONTEND_CMD" ".logs/frontend.log")
log "Frontend PID: ${FRONTEND_PID}"


# ---------------------
# 初始化控制变量：用于跟踪是否正在关闭
# ---------------------
SHUTTING_DOWN=0    # 0 表示正常运行，1 表示正在关闭（避免重复执行 cleanup）

# ---------------------
# cleanup 函数：优雅地停止服务并在必要时强制终止
# ---------------------
cleanup() {
  # 取消信号 trap，避免递归调用
  trap - INT TERM EXIT
  SHUTTING_DOWN=1
  # code 用于最终以特定退出码退出脚本（默认 0）
  local code="${1:-0}"
  log "Shutdown requested — terminating servers..."

  # 如果前端进程还活着，则递归杀掉它的进程树
  if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Terminating frontend process tree (root PID: $FRONTEND_PID)"
    kill_process_tree "$FRONTEND_PID"
  fi

  # 如果后端进程还活着，则递归杀掉它的进程树
  if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Terminating backend process tree (root PID: $BACKEND_PID)"
    kill_process_tree "$BACKEND_PID"
  fi


  # 给被杀进程一个宽限期以便优雅退出（grace 秒）
  local grace=8
  log "Waiting up to ${grace}s for processes to exit..."
  for i in $(seq 1 $grace); do
    sleep 1
    local any=0
    # 检查任一进程还在运行，则标记 any=1
    if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then any=1; fi
    if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then any=1; fi
    # 如果两者都退出了，则提前结束等待
    [ $any -eq 0 ] && break
  done

  # 如果在宽限期后进程仍然存在，则强制 kill（先杀子进程，再杀父进程）
  if [ -n "${FRONTEND_PID}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Forcing kill frontend process tree"
    for c in $(pgrep -P "$FRONTEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "${BACKEND_PID}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Forcing kill backend process tree"
    for c in $(pgrep -P "$BACKEND_PID" 2>/dev/null || true); do kill -KILL "$c" 2>/dev/null || true; done
    kill -KILL "$BACKEND_PID" 2>/dev/null || true
  fi

  # 等待所有被杀的子进程退出，然后以指定退出码结束脚本
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$code"
}

# 捕获 SIGINT 与 SIGTERM，调用 cleanup 以优雅结束
trap 'cleanup 0' INT TERM

# ---------------------
# check_url 函数：轮询指定 URL，直到返回 HTTP 成功或超时（返回非 0）
# ---------------------
check_url() {
  local url="$1"
  local timeout_secs="$2"
  local end=$((SECONDS + timeout_secs))
  while [ $SECONDS -le $end ]; do
    # 使用 curl -sSf, 在 HTTP 非 2xx 时会返回非 0，从而视为失败
    if curl -sSf "$url" > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# ---------------------
# 等待前端就绪
# ---------------------
# 给前端 60s 时间启动并响应根路径（http://localhost:4173/）
log "Waiting for frontend to respond on http://localhost:4173/..."
if ! check_url "http://localhost:4173/" 60; then
  # 超时则提示日志位置并尝试清理已启动的进程，然后以 2 失败退出
  log_error "Frontend did not start in time; see .logs/frontend.log"
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit 2
fi

log "Frontend is up."

# ---------------------
# 等待后端就绪
# ---------------------
# 给后端 60s 时间启动并响应 /api/questions（以代表 API 已就绪）
log "Waiting for backend to respond on http://localhost:3000/api/questions..."
if ! check_url "http://localhost:3000/api/questions" 60; then
  log_error "Backend did not start in time; see .logs/backend.log"
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit 2
fi

log "Backend is up."

# 超时 watcher 已移除；由调用方（例如 run-e2e）负责在测试完成后发送 SIGTERM/退出请求以停止服务

# ---------------------
# 监控循环：若任一进程异常退出则快速失败；若是处于关机流程则正常退出 0
# ---------------------
while true; do
  # 检查前端进程是否仍在运行（kill -0 只是做检查，不发送信号）
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    # 如果我们正在关闭（SHUTTING_DOWN=1），说明这是我们触发的退出，直接正常结束
    if [ "$SHUTTING_DOWN" -eq 1 ]; then
      exit 0
    fi
    # 否则视为异常：打印前端日志提示调试，并调用 cleanup 返回非 0
    log_error "Frontend process exited unexpectedly; see .logs/frontend.log"
    cat .logs/frontend.log >&2 || true
    cleanup 1
  fi

  # 同样的检查后端进程是否仍在运行
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    if [ "$SHUTTING_DOWN" -eq 1 ]; then
      exit 0
    fi
    log_error "Backend process exited unexpectedly; see .logs/backend.log"
    cat .logs/backend.log >&2 || true
    cleanup 1
  fi

  # 每秒检查一次（轻负载）
  sleep 1
done
