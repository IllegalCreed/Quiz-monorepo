import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// db-utils focuses only on data operations; caller must load dotenv or set DATABASE_URL.
// If DATABASE_URL isn't set, allow constructing from discrete parts; otherwise, throw.
if (!process.env.DATABASE_URL) {
  // If user provided discrete connection parts, construct DATABASE_URL as convenience
  if (
    process.env.DATABASE_HOST &&
    process.env.DATABASE_USERNAME &&
    process.env.DATABASE_PASSWORD &&
    process.env.DATABASE_NAME
  ) {
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT || "3306";
    const user = encodeURIComponent(process.env.DATABASE_USERNAME);
    const pass = encodeURIComponent(process.env.DATABASE_PASSWORD);
    const db = process.env.DATABASE_NAME;
    process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
  } else {
    throw new Error(
      "DATABASE_URL not set. Please load your dotenv file in the caller (e.g. set ENV_FILE and call dotenv.config) or set DATABASE_URL directly.",
    );
  }
}

// If DATABASE_URL still missing but individual parts exist, construct it from parts
if (
  !process.env.DATABASE_URL &&
  process.env.DATABASE_HOST &&
  process.env.DATABASE_USERNAME &&
  process.env.DATABASE_PASSWORD &&
  process.env.DATABASE_NAME
) {
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT || "3306";
  const user = encodeURIComponent(process.env.DATABASE_USERNAME);
  const pass = encodeURIComponent(process.env.DATABASE_PASSWORD);
  const db = process.env.DATABASE_NAME;
  process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
}

console.log(
  "Resolved DATABASE_URL for Prisma adapter:",
  process.env.DATABASE_URL,
);

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

function _getDatabaseName(): string {
  if (process.env.DATABASE_NAME) return process.env.DATABASE_NAME;
  try {
    const u = new URL(process.env.DATABASE_URL as string);
    return u.pathname.replace("/", "");
  } catch {
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

export async function seedSystem() {
  ensureNotProd();
  console.log("seedSystem: beginning (idempotent)");

  const exists = await prisma.question.findFirst({
    where: { stem: "Hello World - 基础题" },
  });
  if (!exists) {
    await prisma.question.create({
      data: {
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
    console.log("seedSystem: created base question");
  } else {
    console.log("seedSystem: base question already exists");
  }
  console.log("seedSystem: finished");
}

export async function seedTest() {
  ensureNotProd();
  console.log("seedTest: beginning (inserting test dataset)");

  type SeedOption = { text: string; isCorrect: boolean };
  type SeedQuestion = {
    stem: string;
    explanation?: string | null;
    tags?: string[] | null;
    options: SeedOption[];
  };

  const dataPath = path.join(__dirname, "data", "seed-test.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as SeedQuestion[];

  for (const q of data) {
    const existing = await prisma.question.findFirst({
      where: { stem: q.stem },
    });
    if (existing) {
      await prisma.option.deleteMany({ where: { questionId: existing.id } });
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          explanation: q.explanation ?? undefined,
          tags: q.tags ?? undefined,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          },
        },
      });
      console.log("Updated test question", q.stem);
    } else {
      await prisma.question.create({
        data: {
          stem: q.stem,
          explanation: q.explanation ?? undefined,
          tags: q.tags ?? undefined,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          },
        },
      });
      console.log("Inserted test question", q.stem);
    }
  }

  console.log("seedTest: finished");
}

export async function resetTest() {
  ensureNotProd();

  // Safety: refuse to reset unless the database name looks like a test database.
  const dbName = _getDatabaseName();
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(
      "Refusing to run resetTest against non-test database (database name must include 'test')",
    );
  }

  console.log("resetTest: wiping and reseeding test data");

  try {
    await prisma.answerAttempt?.deleteMany();
  } catch {
    // ignore if model not present
  }
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  await seedSystem();
  await seedTest();
  console.log("resetTest: finished");
}

export { prisma };
