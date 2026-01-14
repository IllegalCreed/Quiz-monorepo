const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load env files (allow running from repo root)
dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(process.cwd(), "apps/quiz-backend/.env.test.local"),
  });
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

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

function _getDatabaseName() {
  if (process.env.DATABASE_NAME) return process.env.DATABASE_NAME;
  try {
    const u = new URL(process.env.DATABASE_URL);
    return u.pathname.replace("/", "");
  } catch (e) {
    return "";
  }
}

function ensureNotProd() {
  const dbName = _getDatabaseName();
  if (process.env.NODE_ENV === "production" || dbName.includes("prod")) {
    if (process.env.QUIZ_ALLOW_PROD_SEED !== "true") {
      throw new Error("Refusing to run seed/reset against production database");
    }
  }
}

async function seedSystem() {
  // Placeholder for system-wide seed data (admins, roles, etc.)
  // Currently no system-only models defined in schema; kept for future use.
  console.log("seedSystem: nothing to seed at the moment");
}

async function seedTest() {
  ensureNotProd();
  console.log("seedTest: beginning");

  // Delete test data (order matters due to relations)
  try {
    await prisma.answerAttempt?.deleteMany();
  } catch (e) {
    // model might not be used
  }
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  const dataPath = path.join(__dirname, "data", "seed-test.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const q of data) {
    const created = await prisma.question.create({
      data: {
        stem: q.stem,
        explanation: q.explanation,
        tags: q.tags,
        options: {
          create: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
    });
    console.log("Inserted question", created.id);
  }
  console.log("seedTest: finished");
}

async function resetTest() {
  ensureNotProd();
  console.log("resetTest: wiping and reseeding test data");
  await seedTest();
}

module.exports = {
  prisma,
  seedSystem,
  seedTest,
  resetTest,
};
