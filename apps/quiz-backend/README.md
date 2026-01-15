# quiz-backend

Nest-like backend for Quiz project (minimal scaffold for MVP)

## Quick Start (development)

1. Copy `.env.example` -> `.env.development.local` and fill values.
2. Option A: Start local MySQL via `docker-compose up -d` (will listen on 3307 locally)
3. Run `pnpm --filter apps/quiz-backend install` (or `cd apps/quiz-backend && pnpm install`)
4. Ensure database exists: `pnpm --filter apps/quiz-backend run db:create` (this uses env vars)
5. Run `pnpm --filter apps/quiz-backend run prisma:generate` and `pnpm --filter apps/quiz-backend run prisma:migrate` to apply migrations
6. Seed (dev): `pnpm --filter apps/quiz-backend run db:seed` (alias for `db:seed:dev`)

- `db:seed:dev` — idempotent system seed (creates base system data if missing)
- `db:seed:test` — **reset** test DB and seed both system and test data (clears previous test data then inserts a deterministic dataset). This is the script intended for E2E/CI preparation.
- `db:seed:prod` — seeds system data to production **only** when explicitly allowed (requires `QUIZ_ALLOW_PROD_SEED=true` and, if you want the script to load `.env.production.local`, `QUIZ_ALLOW_READ_PROD_ENV=true`).

7. Start dev server: `pnpm --filter apps/quiz-backend run dev`

Notes:

- For production, use `.env.production.local` for secrets and a managed DB. The seed scripts are intentionally conservative about touching production: running `db:seed:prod` requires explicit confirmation via `QUIZ_ALLOW_PROD_SEED=true` to avoid accidental destructive operations.
- This scaffold includes Prisma schema, seed utilities and a small Questions controller with `GET /api/questions` and `POST /api/questions/check` endpoints.
