#!/usr/bin/env bash
set -euo pipefail

# 该脚本用于为每次从仓库根运行测试生成新的 TEST_RESET_SECRET
# 它会：
#  - 生成随机 secret
#  - 写入 apps/quiz-backend/.env.test.local 中的 TEST_RESET_SECRET
#  - 写入 apps/quiz-app/cypress.env.json 中的 TEST_RESET_SECRET（供 Cypress 使用）
#  - 不会把这些文件提交到 git（均在 .gitignore 中）

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "[regen-test-secret] %s\n" "$*"; }

# Generate a 32-char hex secret
SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
log "Generated secret: ${SECRET} (shortened in logs)"

# ---- backend: write to .env.test.local (creating or updating) ----
BACK_ENV="$ROOT_DIR/apps/quiz-backend/.env.test.local"
# If example exists, copy as base
if [ -f "$ROOT_DIR/apps/quiz-backend/.env.test.example" ]; then
  cp "$ROOT_DIR/apps/quiz-backend/.env.test.example" "$BACK_ENV" 2>/dev/null || true
fi
# Replace or append TEST_RESET_SECRET
if grep -q '^TEST_RESET_SECRET=' "$BACK_ENV" 2>/dev/null; then
  # Use portable sed: create a backup file and move
  sed "s/^TEST_RESET_SECRET=.*/TEST_RESET_SECRET=${SECRET}/" "$BACK_ENV" > "${BACK_ENV}.tmp" && mv "${BACK_ENV}.tmp" "$BACK_ENV"
else
  echo "TEST_RESET_SECRET=${SECRET}" >> "$BACK_ENV"
fi
log "Wrote TEST_RESET_SECRET to apps/quiz-backend/.env.test.local"

# ---- frontend (Cypress): write to cypress.env.json ----
CYP_JSON="$ROOT_DIR/apps/quiz-app/cypress.env.json"
# Write simple JSON containing the test secret for Cypress to read via Cypress.env('TEST_RESET_SECRET')
printf '{\n  "TEST_RESET_SECRET": "%s"\n}\n' "$SECRET" > "$CYP_JSON"
log "Wrote TEST_RESET_SECRET to apps/quiz-app/cypress.env.json"

# Done
log "Test reset secret regenerated and written to backend/frontend configs"

exit 0
