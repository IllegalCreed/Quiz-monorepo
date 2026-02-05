#!/usr/bin/env bash
# 本脚本用于清理占用指定端口的进程
# 用法: cleanup-ports.sh [端口列表]
# 示例: cleanup-ports.sh "8080 3000 4173"
# 如果不提供参数，默认清理 10010 10020 10040 端口

# 严格模式：当任一命令失败或使用未定义变量时脚本会退出
set -euo pipefail

# 默认要清理的端口列表（前端、后端、UI）
DEFAULT_PORTS="10010 10020 10040"
PORTS="${1:-$DEFAULT_PORTS}"

# 优雅关闭的等待时间（秒）
GRACEFUL_TIMEOUT=3

# 日志函数
log() { printf "[cleanup-ports] %s\n" "$*"; }

# cleanup_port <port>
# 清理指定端口上的所有进程
cleanup_port() {
  local port="$1"
  local pids

  # 使用 lsof 查找占用该端口的进程 PID
  # -t: 只输出 PID
  # -i:端口: 查找使用该端口的进程
  pids=$(lsof -ti:${port} 2>/dev/null || true)

  # 如果端口未被占用，直接返回
  if [ -z "$pids" ]; then
    log "Port ${port} is not in use"
    return 0
  fi

  log "Found processes on port ${port}: ${pids}"

  # 遍历所有占用该端口的进程
  for pid in $pids; do
    # 检查进程是否存在（kill -0 只检查不发送信号）
    if kill -0 "$pid" 2>/dev/null; then
      log "Terminating process ${pid} on port ${port}"

      # 先尝试优雅终止（TERM 信号）
      kill -TERM "$pid" 2>/dev/null || true

      # 等待进程退出（最多等待 GRACEFUL_TIMEOUT 秒）
      local i=0
      while [ $i -lt "$GRACEFUL_TIMEOUT" ]; do
        # 如果进程已经退出，记录日志并跳出循环
        if ! kill -0 "$pid" 2>/dev/null; then
          log "Process ${pid} terminated gracefully"
          break
        fi
        sleep 1
        i=$((i + 1))
      done

      # 如果进程仍然存活，强制终止（KILL 信号）
      if kill -0 "$pid" 2>/dev/null; then
        log "Force killing process ${pid}"
        kill -KILL "$pid" 2>/dev/null || true
        # 再次等待短暂时间确保进程被终止
        sleep 0.5
      fi
    fi
  done
}

# 主流程：遍历所有端口并清理
log "Starting port cleanup for ports: ${PORTS}"

for port in $PORTS; do
  cleanup_port "$port"
done

log "Port cleanup completed"
