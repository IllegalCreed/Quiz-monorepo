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
  ensureNotProd();
  console.log("seedSystem: beginning (idempotent)");
  // Insert a single 'Hello World' base question via upsert so it exists exactly once
  await prisma.question.upsert({
    where: { stem: "Hello World - 基础题" },
    update: {},
    create: {
      stem: "Hello World - 基础题",
      explanation: "这是一个基础题目，所有环境都会包含这条数据。",
      tags: ["基础"],
      options: {
        create: [
          { text: "Hello", isCorrect: false },
          { text: "World", isCorrect: true },
        ],
      },
    },
  });
  console.log("seedSystem: finished");
}

async function seedTest() {
  ensureNotProd();
  console.log("seedTest: beginning (inserting test dataset)");

  const dataPath = path.join(__dirname, "data", "seed-test.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const q of data) {
    // Use upsert by stem to avoid duplicates if run twice unintentionally
    await prisma.question.upsert({
      where: { stem: q.stem },
      update: {
        explanation: q.explanation,
        tags: q.tags,
      },
      create: {
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
    console.log("Upserted test question", q.stem);
  }

  console.log("seedTest: finished");
}

async function resetTest() {
  ensureNotProd();
  console.log("resetTest: wiping and reseeding test data");

  try {
    await prisma.answerAttempt?.deleteMany();
  } catch (e) {
    // ignore if model not present
  }
  // delete options then questions
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  // After wiping, first seed system data (base) then test data
  await seedSystem();
  await seedTest();
  console.log("resetTest: finished");
}

module.exports = {
  prisma,
  seedSystem,
  seedTest,
  resetTest,
};
