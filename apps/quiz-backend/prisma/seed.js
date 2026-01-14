// Convenience top-level seed script – delegates to db-utils
const path = require("path");
const dotenv = require("dotenv");
// Load env files
dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(
      process.cwd(),
      "apps/quiz-backend/.env.development.local",
    ),
  });
  dotenv.config({
    path: path.resolve(process.cwd(), "apps/quiz-backend/.env.local"),
  });
}

const { seedSystem, seedTest } = require("./db-utils");

async function main() {
  console.log("Running full seed: system -> test");
  await seedSystem();
  await seedTest();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
