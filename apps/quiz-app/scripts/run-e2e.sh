#!/usr/bin/env bash
# 指定使用系统中的 bash 来运行脚本
set -euo pipefail
# -e: 出错时立即退出
# -u: 使用未定义变量时报错
# -o pipefail: 管道中任何一段失败都会使整个管道失败

# -------------------------------
# 运行目录与准备（工作目录：apps/quiz-app）
# -------------------------------
# 将脚本位置上移一级到包根（apps/quiz-app），确保后续相对路径正确
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# -------------------------------
# 预清理：释放 3000/4173 端口（如果有进程占用）
# -------------------------------
# 目的：避免旧的后端或前端进程占用端口导致新启动失败（常见于本地重复运行）
# 说明：lsof -ti tcp:<port> 返回占用该端口的进程 PID 列表（仅 PID），使用 || true 忽略找不到命令或没有结果的错误
for port in 3000 4173; do
  pids=$(lsof -ti tcp:${port} || true)
  if [ -n "$pids" ]; then
    echo "Killing processes on port ${port}: $pids"
    # 先尝试发送 TERM 给占用进程，给它们优雅退出的机会
    kill -TERM $pids 2>/dev/null || true
    # 等一小会儿让系统回收端口
    sleep 1
  fi
done

# -------------------------------
# 启动共享的 preview-test 脚本（位于仓库根 scripts/preview-test.sh）
# -------------------------------
# 注意：preview-test 负责启动前端与后端并写入 .logs 中的日志
# 我们在后台运行它并保存 PID，以便测试完成后能优雅停止它
sh ../../scripts/preview-test.sh &
PREVIEW_PID=$!

# -------------------------------
# 等待服务就绪（前端 + 后端），无限期等待直到就绪
# -------------------------------
# 说明：不再使用本脚本进行超时控制，调用方（如 CI 的运行器或本地开发者）负责在必要时终止进程。
# 这个脚本会一直轮询直到前端与后端都能响应健康检测接口，适用于你希望由外部决定何时停止服务的场景。
while true; do
  if curl -sSf "http://localhost:4173/" >/dev/null 2>&1 && curl -sSf "http://localhost:3000/api/questions" >/dev/null 2>&1; then
    echo "Servers ready"
    break
  fi
  sleep 1
done

# -------------------------------
# 运行 Cypress（从当前包目录运行以保证能找到 cypress 配置）
# -------------------------------
# cross-env 用于以跨平台的方式设置环境变量（在 macOS/Linux 这儿主要是为了在可能的 Windows 环境也能工作）
# NODE_ENV=production 只是为了让前端在生产模式下运行（与本地 preview 的行为一致），Cypress 会以 headless 模式运行测试
cross-env NODE_ENV=production cypress run --e2e
CYP_EXIT=$?

# -------------------------------
# 测试完成后优雅停止 preview-test 脚本（发送 TERM 并等待其退出）
# -------------------------------
# 这里使用 TERM 而不是 KILL，以便被启动的服务有机会优雅释放资源并写入日志
kill -TERM "$PREVIEW_PID" 2>/dev/null || true
wait "$PREVIEW_PID" 2>/dev/null || true

# 将 Cypress 的退出码作为本脚本的退出码返回（确保 CI 能根据实际测试结果判断通过/失败）
exit "$CYP_EXIT"
