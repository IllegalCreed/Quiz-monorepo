#!/usr/bin/env bash
set -euo pipefail

# regenerate-test-secret.sh (简化版)
# 本脚本用途（中文说明）🔧
#  - 为测试运行生成一个随机的 TEST_RESET_SECRET（32 字符 hex）
#  - 将该密钥写入两个位置：
#      1) 后端配置：apps/quiz-backend/.env.test.local（替换或添加 TEST_RESET_SECRET）
#      2) 前端（Cypress）：apps/quiz-app/cypress.env.json（覆盖写入 JSON）
#  - 安全性与简单性：
#      • 如果后端的 .env.test.local 不存在，会优先从 .env.test.example 复制（若存在），否则创建空文件；
#      • 将目标文件权限设置为 600（仅限拥有者可读写）；
#  - 设计原则：保持简单、可预测、在 CI 中可直接运行。

# 工作目录：保证相对路径从仓库根开始
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "[regen-test-secret] %s\n" "$*"; }
mask() { local s="$1"; if [ -z "$s" ]; then echo "(not set)"; return; fi; echo "${s:0:4}***${s: -4}"; }

# 生成 32 字符 hex（16 字节）
# 说明：使用 node 的 crypto 保证跨平台一致性（CI 环境通常有 node）
SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
MSECRET=$(mask "$SECRET")
log "Generated secret: ${MSECRET} (masked)"

# 目标文件
BACK_ENV="$ROOT_DIR/apps/quiz-backend/.env.test.local"
BACK_EXAMPLE="$ROOT_DIR/apps/quiz-backend/.env.test.example"
CYP_JSON="$ROOT_DIR/apps/quiz-app/cypress.env.json"

# 确保后端 .env 文件存在：若不存在优先从 example 复制，否则创建空文件
if [ ! -f "$BACK_ENV" ]; then
  if [ -f "$BACK_EXAMPLE" ]; then
    cp "$BACK_EXAMPLE" "$BACK_ENV" 2>/dev/null || true
    log "Created $BACK_ENV from example"
  else
    touch "$BACK_ENV"
    log "Created empty $BACK_ENV"
  fi
  chmod 600 "$BACK_ENV" || true
fi

# 在文件中替换或追加 TEST_RESET_SECRET（跨平台 sed 操作：写到临时文件再移动）
if grep -q '^TEST_RESET_SECRET=' "$BACK_ENV" 2>/dev/null; then
  sed "s/^TEST_RESET_SECRET=.*/TEST_RESET_SECRET=${SECRET}/" "$BACK_ENV" > "${BACK_ENV}.tmp" && mv "${BACK_ENV}.tmp" "$BACK_ENV"
  log "Replaced TEST_RESET_SECRET in $BACK_ENV"
else
  echo "TEST_RESET_SECRET=${SECRET}" >> "$BACK_ENV"
  log "Appended TEST_RESET_SECRET to $BACK_ENV"
fi

# 写入 Cypress 配置（覆盖写入 JSON）
printf '{\n  "TEST_RESET_SECRET": "%s"\n}\n' "$SECRET" > "$CYP_JSON"
chmod 600 "$CYP_JSON" || true
log "Wrote TEST_RESET_SECRET to $CYP_JSON"

log "Done."
exit 0
