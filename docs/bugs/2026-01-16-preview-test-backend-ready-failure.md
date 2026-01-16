Title: preview-test fails readiness check even when backend process starts

Date: 2026-01-16
Reporter: automation

Summary:
The `preview-test` orchestration sometimes reports that the backend readiness endpoint (`POST/GET /api/test/ready`) did not respond within the configured `PREVIEW_TEST_WAIT` timeout even though the backend process logs show the Nest app started and the route mapped. Observed behavior in `pnpm -w test` runs: turbo reports success for workspace tasks despite E2E failing due to preview-test; this was addressed by ensuring `run-e2e.sh` propagates preview-test exit code and by tightening cleanup, but root cause remains: readiness checks failing intermittently.

Reproduction steps:

1. Run `pnpm -w test` (or `pnpm -C apps/quiz-app run test:e2e`).
2. Observe preview-test: starts backend & frontend, frontend passes readiness, backend readiness check times out.
3. Check `.logs/backend.log` and see Nest startup logs and sometimes Prisma pool errors.

Key observations:

- Nest prints "Mapped {/api/test/ready, GET} route" and later "Server running on port 3000".
- `preview-test` dumps last 300 lines of `.logs/backend.log` on readiness timeout; logs revealed Prisma pool timeouts (P2010-like) in earlier runs.
- Sometimes `preview-test` timeout occurs before server binds to port (connection refused) or while server logs show ports bound but readiness endpoint still fails due to missing env config (e.g. `ENABLE_TEST_ENDPOINT` or `TEST_RESET_SECRET` not set in process env), or DB issues cause process to not respond to readiness checks.

Hypothesis:

- `apps/quiz-backend/scripts/start-test.sh` may not reliably load `.env.test.local` or forward required env vars (e.g., `ENABLE_TEST_ENDPOINT`, `TEST_RESET_SECRET`) into the Nest process when started via the `preview-test` helper. When missing, the `/api/test/ready` endpoint will reject requests.
- Alternative cause: transient DB connection failures prevent server from serving readiness due to early DB access in startup hooks. But we intentionally made readiness endpoint DB-free.

Next actions:

1. Inspect `apps/quiz-backend/scripts/start-test.sh` to verify env loading and whether `ENABLE_TEST_ENDPOINT` and `TEST_RESET_SECRET` are set before starting Nest.
2. Add unit/e2e tests or small script to validate that starting backend via `start-test.sh` exposes `/api/test/ready` and returns 200.
3. If missing, ensure `start-test.sh` reads `.env.test.local` (dotenv) and exports required variables, and add defensive logging to surface when envs absent.
4. Consider making readiness endpoint return a helpful diagnostic body when `TEST_RESET_SECRET` or `ENABLE_TEST_ENDPOINT` missing to make failures clearer in CI logs.

Attachments:

- Reference to `scripts/preview-test.sh` lines where readiness is checked: `http://localhost:3000/api/test/ready`.
- Observed logs and test-run transcripts saved to `.logs`.
