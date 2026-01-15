import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const p = path.resolve(__dirname, "../.env.test.local");
if (fs.existsSync(p)) {
  dotenv.config({ path: p, override: true });
  console.log(`Loaded test env from ${p}`);
} else {
  // If no env file, mark tests to be skipped to avoid failing CI that lacks DB
  // This is intentional: if you want to run e2e locally, create .env.test.local
  // pointing to a working test database and re-run `pnpm -C apps/quiz-backend run test:e2e`.
  // We set a flag accessible by tests.
  // eslint-disable-next-line no-process-env
  process.env.SKIP_E2E = "true";
  console.warn(
    "No apps/quiz-backend/.env.test.local found — E2E tests will be skipped.",
  );
}

// Ensure test endpoint is enabled during e2e runs
if (!process.env.ENABLE_TEST_ENDPOINT) {
  // eslint-disable-next-line no-process-env
  process.env.ENABLE_TEST_ENDPOINT = "true";
}
