#!/usr/bin/env bash
# 本脚本使用 bash 执行。首行为 shebang，用来让系统找到正确的解释器。
# 严格模式：当任一命令失败或使用未定义变量时脚本会退出，pipe 的任一段失败也会导致失败。
set -euo pipefail
# 解释（给新手看的更详细说明）：
#  - set -e：任何命令返回非 0 时立即终止脚本（避免忽略错误）。
#  - set -u：引用未定义变量时报错（帮助发现拼写错误）。
#  - set -o pipefail：当管道中任一命令失败，整个管道视为失败（更可靠）。

# --------------- 工作目录（保证相对路径正确） ---------------
# 把脚本所在目录的上一级（通常是仓库根）设置为工作目录，方便在脚本中使用相对路径（如 .logs、apps/）。
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# -----------------------------------------------------------------------------
# 介绍（这部分是脚本做什么 & 给没有 shell 经验的人的解释）
# 本脚本的作用：
#  1) 启动前端（preview）与后端（测试环境）服务，分别将它们的 stdout/stderr 保存到 .logs 目录；
#  2) 通过 HTTP 请求检测服务是否就绪（可被访问）；
#  3) 若任一服务退出或在超时时间内未就绪，脚本会打印错误并以非 0 退出（便于 CI / turbo 识别失败）；
#  4) 在收到中断信号（如 Ctrl+C、CI 取消）时，会优雅地终止两个服务进程树并退出。
#
# 给新手的额外说明（概念）：
#  - "后台运行"：命令后面加 &，shell 会把它放到后台并继续执行后面的命令，启动时可通过 $! 获取它的 PID。
#  - "disown"：从 shell 的作业列表中移除后台任务，避免在终端关闭或收到信号时打印多余信息。
#  - "setsid / nohup"：不同环境中让进程脱离终端的方法，能减少被外部信号影响或日志噪音（我们尝试兼容多种系统）。
# -----------------------------------------------------------------------------

# --------------------- 要启动的命令（原始命令） ---------------------
# 说明：这里是我们想要执行的实际命令（还没包装 signal 行为）。
FRONTEND_CMD_RAW="pnpm -C apps/quiz-app run preview"
BACKEND_CMD_RAW="pnpm -C apps/quiz-backend run start:test"

# 为了在父进程发送 TERM 时避免 pnpm 打印 ELIFECYCLE 错误噪音，我们把命令再包装一层：
#  sh -c "trap 'exit 0' TERM; exec <原始命令>"
# 这会在进程收到 TERM 信号时以 exit 0 安静退出（被视为正常结束），而不是显示错误堆栈。
FRONTEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${FRONTEND_CMD_RAW}\""
BACKEND_CMD="sh -c \"trap 'exit 0' TERM; exec ${BACKEND_CMD_RAW}\""

# 创建日志目录（如果不存在），用来保存服务的输出，便于排查问题。
mkdir -p .logs

# --------------------- 日志与实用函数 ---------------------
# 简单日志函数：用于统一前缀，便于在 CI / 本地终端中快速识别输出来源。
log() { printf "[preview-test] %s\n" "$*"; }
log_error() { printf "[preview-test] ERROR: %s\n" "$*" >&2; }

# start_service <name> <cmd> <logfile>
# - 在后台启动服务并把 stdout/stderr 重定向到日志文件。
# - 尝试使用 setsid（更脱离终端），回退到 nohup，再回退到常规后台启动。
# - 返回启动的 root PID（通过 echo 返回，以便外部引用）。
start_service() {
  local name="$1"; local cmd="$2"; local logfile="$3"; local pid

  # 选择可用的启动方式，尽量兼容不同系统（Linux / macOS / CI 容器等）。
  if command -v setsid >/dev/null 2>&1; then
    log "Starting ${name} (setsid): ${cmd}" >&2
    setsid sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  elif command -v nohup >/dev/null 2>&1; then
    log "Starting ${name} (nohup): ${cmd}" >&2
    nohup sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  else
    # 最后回退：普通后台运行，这在极少数受限环境中也能工作
    log "Starting ${name} (background): ${cmd}" >&2
    sh -c "${cmd}" > "${logfile}" 2>&1 & pid=$!; disown $pid 2>/dev/null || true
  fi

  # 返回 PID，使调用方能够追踪和终止该进程
  echo "$pid"
}

# kill_process_tree <pid>
# 递归终止给定进程及其子进程，确保不会留下孤儿进程。
# 说明：使用 pgrep -P 查找父进程的子进程（在某些系统上可能不可用），这里采用保守方案并忽略错误。
kill_process_tree() {
  local _pid="$1"
  local children
  children=$(pgrep -P "${_pid}" 2>/dev/null || true)
  for c in $children; do
    kill_process_tree "$c"
  done
  # 先发送 TERM 以便进程有机会优雅退出，再在需要时使用 KILL。
  kill -TERM "${_pid}" 2>/dev/null || true
}

# --------------------- 清理与信号处理（优雅退出） ---------------------
cleanup() {
  # 防止重复执行（重入保护）：如果 cleanup 已经开始则立即返回
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    return
  fi
  CLEANUP_STARTED=1

  # 解除已设置的 trap，避免递归调用
  trap - INT TERM EXIT
  local code="${1:-0}"
  log "Shutdown requested — terminating servers (code=${code})"

  # 如果进程存在且可见，先尝试优雅终止它们的进程树
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Terminating frontend process tree (root PID: $FRONTEND_PID)"
    kill_process_tree "$FRONTEND_PID"
  fi
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Terminating backend process tree (root PID: $BACKEND_PID)"
    kill_process_tree "$BACKEND_PID"
  fi

  # 等待一个短的宽限期（grace），给进程机会退出
  local grace=5
  local i=0
  while [ "$i" -lt "$grace" ]; do
    sleep 1
    i=$((i + 1))
    local any=0
    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then any=1; fi
    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then any=1; fi
    [ $any -eq 0 ] && break
  done

  # 如果仍然存活则强制结束
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

  # 等待子进程退出并返回指定退出码
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  exit "$code"
}

# 捕获中断与终止信号（例如 Ctrl+C、CI 取消），并调用 cleanup。也会在脚本正常退出时触发 EXIT。
trap 'cleanup 0' INT TERM EXIT

# --------------------- 启动并检测就绪 ---------------------
# 启动后端与前端，并把它们的 PID 写入变量，方便后续管理
BACKEND_PID=$(start_service "backend" "$BACKEND_CMD" ".logs/backend.log")
log "Backend PID: ${BACKEND_PID}"
FRONTEND_PID=$(start_service "frontend" "$FRONTEND_CMD" ".logs/frontend.log")
log "Frontend PID: ${FRONTEND_PID}"

# 就绪检测超时（秒），可以通过环境变量 PREVIEW_TIMEOUT 覆盖（例如 CI 中设置更长时间）
PREVIEW_TIMEOUT=${PREVIEW_TIMEOUT:-10}

# wait_for <url> <timeout>
# - 尝试通过 curl 访问指定 URL，直到成功或超时
wait_for() {
  local url="$1"; local timeout="$2"; local end=$((SECONDS + timeout))
  while [ $SECONDS -le $end ]; do
    # -sSf：静默但在 HTTP 错误时返回非 0，方便判断就绪
    if curl -sSf "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

# 等待前端
log "Waiting up to ${PREVIEW_TIMEOUT}s for frontend (http://localhost:10010/)..."
if ! wait_for "http://localhost:10010/" "$PREVIEW_TIMEOUT"; then
  log_error "Frontend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/frontend.log"
  cleanup 2
fi
log "Frontend is up."

# 等待后端（使用 test/hello 作为健康检查端点）
log "Waiting up to ${PREVIEW_TIMEOUT}s for backend (http://localhost:10020/api/test/hello)..."
if ! wait_for "http://localhost:10020/api/test/hello" "$PREVIEW_TIMEOUT"; then
  log_error "Backend did not become ready within ${PREVIEW_TIMEOUT}s; see .logs/backend.log"
  cleanup 3
fi
log "Backend is up. Servers ready."

# 监控两个进程，若任一退出则快速失败（写日志并退出），帮助 CI 发现问题
while true; do
  # 如果 cleanup 已经开始，退出监控循环（正在关闭，无需再检查进程）
  if [ "${CLEANUP_STARTED:-0}" -eq 1 ]; then
    break
  fi

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
