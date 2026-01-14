# quiz-backend

Nest-like backend for Quiz project (minimal scaffold for MVP)

## Quick Start (development)

1. Copy `.env.example` -> `.env.development.local` and fill values.
2. Option A: Start local MySQL via `docker-compose up -d` (will listen on 3307 locally)
3. Run `pnpm --filter apps/quiz-backend install` (or `cd apps/quiz-backend && pnpm install`)
4. Ensure database exists: `pnpm --filter apps/quiz-backend run db:create` (this uses env vars)
5. Run `pnpm --filter apps/quiz-backend run prisma:generate` and `pnpm --filter apps/quiz-backend run prisma:migrate` to apply migrations
6. Seed: `pnpm --filter apps/quiz-backend run db:seed`
7. Start dev server: `pnpm --filter apps/quiz-backend run dev`

Notes:

- For production, use `.env.production.local` for secrets and a managed DB.
- This scaffold includes Prisma schema, sample seed data, and a small Questions controller with `GET /api/questions` and `POST /api/questions/check` endpoints.
