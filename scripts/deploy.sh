#!/bin/bash
# ============================================================
# Quiz Monorepo 一键部署脚本
# 用法: ./scripts/deploy.sh [app|admin|backend|all]
#
# 部署策略：本地构建 → tar 打包 → 远程解压到 dist.new → 原子切换（mv）。
#   - 避免 `scp -r dist 远端:.../` 在 dist 已存在时嵌套成 dist/dist 的坑
#   - 静态站每次全量替换，自动清掉历史残留的旧 assets
#   - 旧版本保留为远程 dist.old，确认无误后可手动删
# ============================================================

set -e

# 服务器配置
SERVER_HOST="47.120.26.143"
SERVER_USER="root"

# 远程路径（站点根；dist 是其下的子目录）
REMOTE_APP="/var/www/quiz-app"
REMOTE_ADMIN="/var/www/quiz-admin"
REMOTE_BACKEND="/root/server/quiz-backend"

# 本地路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 SSH 连接
check_ssh() {
  log_info "检查 SSH 连接..."
  if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "${SERVER_USER}@${SERVER_HOST}" 'echo ok' &>/dev/null; then
    log_error "无法连接到服务器。请确认 SSH key 已配置。"
    log_warn "提示: ssh-copy-id ${SERVER_USER}@${SERVER_HOST}"
    exit 1
  fi
}

# 构建指定模块
build() {
  local target=$1
  cd "$PROJECT_ROOT"
  case $target in
    app)     log_info "构建 quiz-app...";     pnpm -C apps/quiz-app run build ;;
    admin)   log_info "构建 quiz-admin...";   pnpm -C apps/quiz-admin run build ;;
    backend) log_info "构建 quiz-backend..."; pnpm -C apps/quiz-backend run build ;;
    all)     log_info "构建全部项目...";       pnpm build ;;
  esac
}

# 静态站点原子部署（前端 / 管理后台）
# 参数: $1=app 目录名(quiz-app/quiz-admin)  $2=远程站点根
deploy_static() {
  local name=$1 remote_dir=$2
  local local_dist="${PROJECT_ROOT}/apps/${name}/dist"
  if [ ! -f "${local_dist}/index.html" ]; then
    log_error "${name}/dist 未构建（缺 index.html）"; exit 1
  fi
  log_info "部署 ${name} 到 ${SERVER_HOST}..."
  tar czf "/tmp/${name}-dist.tgz" --exclude='.DS_Store' -C "$local_dist" .
  scp -q "/tmp/${name}-dist.tgz" "${SERVER_USER}@${SERVER_HOST}:/tmp/"
  # 远程：解压到 dist.new → 原子切换；变量经环境传入，heredoc 用单引号不做本地展开
  ssh "${SERVER_USER}@${SERVER_HOST}" "RD='${remote_dir}' NAME='${name}' bash -s" <<'REMOTE'
set -e
cd "$RD"
rm -rf dist.new && mkdir dist.new
tar xzf "/tmp/${NAME}-dist.tgz" -C dist.new
[ -f dist.new/index.html ] || { echo "解压异常：缺 index.html，中止"; rm -rf dist.new; exit 1; }
rm -rf dist.old
[ -d dist ] && mv dist dist.old || true
mv dist.new dist
rm -f "/tmp/${NAME}-dist.tgz"
REMOTE
  rm -f "/tmp/${name}-dist.tgz"
  log_info "${name} 部署完成 ✓（旧版本备份在远程 ${remote_dir}/dist.old）"
}

deploy_app() { deploy_static "quiz-app" "$REMOTE_APP"; }
deploy_admin() { deploy_static "quiz-admin" "$REMOTE_ADMIN"; }

# 后端部署：原子替换 dist + 装依赖/迁移/生成 client + 重启 + 清理游离双进程
deploy_backend() {
  local backend_root="${PROJECT_ROOT}/apps/quiz-backend"
  if [ ! -f "${backend_root}/dist/src/main.js" ]; then
    log_error "后端 dist 未构建（缺 src/main.js）"; exit 1
  fi
  log_info "部署 quiz-backend 到 ${SERVER_HOST}..."
  tar czf /tmp/qb-dist.tgz --exclude='.DS_Store' --exclude='*.tsbuildinfo' -C "${backend_root}/dist" .
  tar czf /tmp/qb-prisma.tgz --exclude='.DS_Store' -C "${backend_root}/prisma" .
  scp -q /tmp/qb-dist.tgz /tmp/qb-prisma.tgz "${SERVER_USER}@${SERVER_HOST}:/tmp/"
  scp -q "${backend_root}/package.json" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_BACKEND}/"
  # 远程：依赖/迁移/生成/重启全程 && 串联——任一步失败都不会走到 restart，
  # 旧进程继续在内存里服务、线上不中断；只有全部成功才切到新代码。
  ssh "${SERVER_USER}@${SERVER_HOST}" "QB='${REMOTE_BACKEND}' bash -s" <<'REMOTE'
set -e
cd "$QB"
# 1) 原子替换 dist（避免 scp -r 嵌套）
rm -rf dist.new && mkdir dist.new && tar xzf /tmp/qb-dist.tgz -C dist.new
[ -f dist.new/src/main.js ] || { echo "dist 异常：缺 src/main.js，中止"; rm -rf dist.new; exit 1; }
rm -rf dist.old && mv dist dist.old && mv dist.new dist
# 2) 更新 prisma（schema/migrations）
rm -rf prisma.new && mkdir prisma.new && tar xzf /tmp/qb-prisma.tgz -C prisma.new
rm -rf prisma.old && mv prisma prisma.old && mv prisma.new prisma
# 3) 依赖 + 迁移 + 生成 client + 重启（&& 串联）
pnpm install 2>&1 | tail -3 \
  && pnpm exec dotenv -e .env.production -e .env.production.local -- pnpm exec prisma migrate deploy 2>&1 | tail -3 \
  && pnpm exec dotenv -e .env.production -e .env.production.local -- pnpm exec prisma generate 2>&1 | tail -2 \
  && pm2 restart quiz-backend --update-env
# 4) 等待后端就绪（NestJS 启动 + 连 RDS 约 ~50s 才绑 10020），轮询最多 90s
PM2_PID=$(pm2 pid quiz-backend 2>/dev/null | tr -d '[:space:]')
echo "等待后端绑定 10020（pm2 PID=$PM2_PID）..."
for i in $(seq 1 30); do
  LPID=$(ss -tlnp 2>/dev/null | grep ':10020' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
  [ -n "$LPID" ] && [ "$LPID" = "$PM2_PID" ] && break
  sleep 3
done
# 5) 就绪后清理游离双进程（杀掉任何非 pm2 当前 PID 的 main.js 残留）
for pid in $(pgrep -f 'quiz-backend/dist/src/main.js' 2>/dev/null); do
  if [ -n "$PM2_PID" ] && [ "$pid" != "$PM2_PID" ]; then
    echo "清理游离进程 $pid"; kill "$pid" 2>/dev/null || true
  fi
done
sleep 1
# 6) 自检
LPID=$(ss -tlnp 2>/dev/null | grep ':10020' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
NPROC=$(pgrep -fc 'quiz-backend/dist/src/main.js' 2>/dev/null || echo '?')
if [ "$LPID" = "$PM2_PID" ] && [ "$NPROC" = "1" ]; then
  echo "✓ 自检通过：10020 由 pm2 进程 $PM2_PID 监听、单进程"
else
  echo "⚠ 自检：10020 PID=$LPID，pm2 PID=$PM2_PID，main.js 进程数=$NPROC（请复核）"
fi
rm -f /tmp/qb-dist.tgz /tmp/qb-prisma.tgz
REMOTE
  rm -f /tmp/qb-dist.tgz /tmp/qb-prisma.tgz
  log_info "quiz-backend 部署完成 ✓（旧 dist 备份在远程 ${REMOTE_BACKEND}/dist.old）"
}

# 主逻辑
main() {
  local target="${1:-all}"

  echo "========================================"
  echo "  Quiz Monorepo 部署"
  echo "  目标: ${target}"
  echo "  服务器: ${SERVER_HOST}"
  echo "========================================"
  echo ""

  check_ssh

  case $target in
    app)     build app && deploy_app ;;
    admin)   build admin && deploy_admin ;;
    backend) build backend && deploy_backend ;;
    all)
      build all
      deploy_app
      deploy_admin
      deploy_backend
      ;;
    *)
      echo "用法: $0 [app|admin|backend|all]"
      echo ""
      echo "  app      - 仅部署前端 (quiz-app)"
      echo "  admin    - 仅部署管理后台 (quiz-admin)"
      echo "  backend  - 仅部署后端 (quiz-backend)"
      echo "  all      - 部署全部（默认）"
      exit 1
      ;;
  esac

  echo ""
  log_info "部署完成！"
  echo ""
  echo "  前端:   https://quiz.illegalscreed.cn"
  echo "  后台:   https://quiz-admin.illegalscreed.cn"
  echo "  API:    https://quiz-api.illegalscreed.cn"
}

main "$@"
