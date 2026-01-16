#!/usr/bin/env bash
set -euo pipefail

# regenerate-test-secret.sh
# - generate a per-run TEST_RESET_SECRET for test runs
# - write it to apps/quiz-backend/.env.test.local and apps/quiz-app/cypress.env.json
# - safety: do NOT overwrite existing DB credentials; only create from example when target missing
# - supports: --dry-run  (show masked values, do not write files)
#             --yes      (allow writes; without --yes script will still write but --dry-run will prevent writes)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "[regen-test-secret] %s\n" "$*"; }
mask() { local s="$1"; if [ -z "$s" ]; then echo "(not set)"; return; fi; echo "${s:0:4}***${s: -4}"; }

DRY_RUN=0
YES=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1; shift;;
    --yes)
      YES=1; shift;;
    -h|--help)
      cat <<'USAGE'
Usage: regenerate-test-secret.sh [--dry-run] [--yes] [--help]
  --dry-run   : Show masked secret and planned changes; do not write files
  --yes       : Apply changes (writes files). Without --yes you still write files unless --dry-run is set.
  --help      : Show this help
USAGE
      exit 0;;
    *)
      echo "Unknown arg: $1"; exit 2;;
  esac
done

# Generate a 32-char hex secret
SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
MSECRET=$(mask "$SECRET")
log "Generated secret: ${MSECRET} (masked)"

# Files
BACK_ENV="$ROOT_DIR/apps/quiz-backend/.env.test.local"
BACK_EXAMPLE="$ROOT_DIR/apps/quiz-backend/.env.test.example"
CYP_JSON="$ROOT_DIR/apps/quiz-app/cypress.env.json"

# Backend: ensure file exists (create from example only if target does not exist)
if [ ! -f "$BACK_ENV" ]; then
  if [ -f "$BACK_EXAMPLE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      log "DRY-RUN: would create $BACK_ENV from example"
    else
      cp "$BACK_EXAMPLE" "$BACK_ENV" 2>/dev/null || true
      chmod 600 "$BACK_ENV" || true
      log "Created $BACK_ENV from example (did not overwrite existing file)"
    fi
  else
    if [ "$DRY_RUN" -eq 1 ]; then
      log "DRY-RUN: would create empty $BACK_ENV"
    else
      touch "$BACK_ENV"
      chmod 600 "$BACK_ENV" || true
      log "Created empty $BACK_ENV"
    fi
  fi
else
  # backup existing file before modifying
  if [ "$DRY_RUN" -eq 1 ]; then
    log "DRY-RUN: would backup existing $BACK_ENV to ${BACK_ENV}.bak.TIMESTAMP"
  else
    cp "$BACK_ENV" "${BACK_ENV}.bak.$(date +%Y%m%d%H%M%S)" || true
    log "Backed up existing $BACK_ENV"
  fi
fi

# Replace or append TEST_RESET_SECRET
if grep -q '^TEST_RESET_SECRET=' "$BACK_ENV" 2>/dev/null; then
  if [ "$DRY_RUN" -eq 1 ]; then
    log "DRY-RUN: would replace existing TEST_RESET_SECRET in $BACK_ENV with ${MSECRET}"
  else
    sed "s/^TEST_RESET_SECRET=.*/TEST_RESET_SECRET=${SECRET}/" "$BACK_ENV" > "${BACK_ENV}.tmp" && mv "${BACK_ENV}.tmp" "$BACK_ENV"
    log "Updated TEST_RESET_SECRET in $BACK_ENV"
  fi
else
  if [ "$DRY_RUN" -eq 1 ]; then
    log "DRY-RUN: would append TEST_RESET_SECRET=${MSECRET} to $BACK_ENV"
  else
    echo "TEST_RESET_SECRET=${SECRET}" >> "$BACK_ENV"
    log "Appended TEST_RESET_SECRET to $BACK_ENV"
  fi
fi

# Frontend (Cypress): write JSON
if [ "$DRY_RUN" -eq 1 ]; then
  log "DRY-RUN: would write TEST_RESET_SECRET=${MSECRET} to $CYP_JSON"
else
  printf '{\n  "TEST_RESET_SECRET": "%s"\n}\n' "$SECRET" > "$CYP_JSON"
  log "Wrote TEST_RESET_SECRET to $CYP_JSON"
fi

log "Done. ${DRY_RUN:+(DRY-RUN)}"

exit 0
