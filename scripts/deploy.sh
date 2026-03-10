#!/bin/bash
# ============================================================
# Quiz Monorepo 一键部署脚本
# 用法: ./scripts/deploy.sh [app|admin|backend|all]
# ============================================================

set -e

# 服务器配置
SERVER_HOST="47.120.26.143"
SERVER_USER="root"

# 远程路径
REMOTE_APP="/var/www/quiz-app/dist"
REMOTE_ADMIN="/var/www/quiz-admin/dist"
REMOTE_BACKEND="/root/server/quiz-backend"

# 本地路径（相对于项目根目录）
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
    app)
      log_info "构建 quiz-app..."
      pnpm -C apps/quiz-app run build
      ;;
    admin)
      log_info "构建 quiz-admin..."
      pnpm -C apps/quiz-admin run build
      ;;
    backend)
      log_info "构建 quiz-backend..."
      pnpm -C apps/quiz-backend run build
      ;;
    all)
      log_info "构建全部项目..."
      pnpm build
      ;;
  esac
}

# 部署前端
deploy_app() {
  log_info "部署 quiz-app 到 ${SERVER_HOST}..."
  scp -r "${PROJECT_ROOT}/apps/quiz-app/dist" "${SERVER_USER}@${SERVER_HOST}:/var/www/quiz-app/"
  log_info "quiz-app 部署完成 ✓"
}

# 部署管理后台
deploy_admin() {
  log_info "部署 quiz-admin 到 ${SERVER_HOST}..."
  scp -r "${PROJECT_ROOT}/apps/quiz-admin/dist" "${SERVER_USER}@${SERVER_HOST}:/var/www/quiz-admin/"
  log_info "quiz-admin 部署完成 ✓"
}

# 部署后端
deploy_backend() {
  log_info "部署 quiz-backend 到 ${SERVER_HOST}..."

  # 上传编译产物
  scp -r "${PROJECT_ROOT}/apps/quiz-backend/dist" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_BACKEND}/"

  # 上传 prisma（可能有新迁移）
  scp -r "${PROJECT_ROOT}/apps/quiz-backend/prisma" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_BACKEND}/"

  # 上传 package.json（可能有新依赖）
  scp "${PROJECT_ROOT}/apps/quiz-backend/package.json" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_BACKEND}/"

  # 远程执行：安装依赖 + 迁移 + 重启
  ssh "${SERVER_USER}@${SERVER_HOST}" "
    cd ${REMOTE_BACKEND}
    pnpm install 2>&1 | tail -3
    npx dotenv -e .env.production -e .env.production.local -- npx prisma migrate deploy 2>&1
    pm2 restart quiz-backend
    echo '后端重启完成'
  "

  log_info "quiz-backend 部署完成 ✓"
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
    app)
      build app && deploy_app
      ;;
    admin)
      build admin && deploy_admin
      ;;
    backend)
      build backend && deploy_backend
      ;;
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
