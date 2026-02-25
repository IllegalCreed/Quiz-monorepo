import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { seedAdmin } from "./data/seed-admin";
import {
  seedCategories,
  linkTestQuestionCategories,
} from "./data/seed-categories";

// db-utils focuses only on data operations; caller must load dotenv or set DATABASE_URL.
// If DATABASE_URL isn't set, allow constructing from discrete parts; otherwise, throw.
if (!process.env.DATABASE_URL) {
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

function _maskDatabaseUrl(raw?: string) {
  if (!raw) return "(not set)";
  try {
    const u = new URL(raw);
    const user = u.username ? `${u.username}:***@` : "";
    return `${u.protocol}//${user}${u.host}${u.pathname}`;
  } catch {
    return "(invalid url)";
  }
}

console.log(
  "Resolved DATABASE_URL for Prisma adapter:",
  _maskDatabaseUrl(process.env.DATABASE_URL),
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

  // 1. 管理员系统数据（角色 + 账号）
  await seedAdmin(prisma);

  // 2. 基础题目
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
            {
              text: "Hello",
              isCorrect: false,
              description: "Hello 只是一个问候词，不是正确答案。",
            },
            {
              text: "World",
              isCorrect: true,
              description: "World 是正确答案，代表完整的 Hello World 程序。",
            },
          ],
        },
      },
    });
    console.log("seedSystem: created base question");
  } else {
    console.log("seedSystem: base question already exists");
  }

  // 3. 分类体系（维度 + 分类节点）
  await seedCategories(prisma);

  console.log("seedSystem: finished");
}

export async function seedTest() {
  ensureNotProd();
  console.log("seedTest: beginning (inserting test dataset)");

  type SeedOption = { text: string; isCorrect: boolean; description?: string };
  type SeedQuestion = {
    stem: string;
    explanation?: string | null;
    tags?: string[] | null;
    options: SeedOption[];
  };

  // 定位 seed-test.json（兼容源码运行和编译后运行两种路径布局）
  const candidatePaths = [
    path.join(__dirname, "data", "seed-test.json"),
    path.join(__dirname, "..", "prisma", "data", "seed-test.json"),
    path.resolve(process.cwd(), "prisma", "data", "seed-test.json"),
  ];

  let dataPath: string | undefined;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      dataPath = p;
      break;
    }
  }

  if (!dataPath) {
    throw new Error(
      `seed-test.json not found. Checked: ${candidatePaths.join(", ")}`,
    );
  }

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
              description: o.description ?? undefined,
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
              description: o.description ?? undefined,
            })),
          },
        },
      });
      console.log("Inserted test question", q.stem);
    }
  }

  // 将测试题关联到结构化分类（依赖 seedSystem 中的 seedCategories 已执行）
  await linkTestQuestionCategories(prisma);

  console.log("seedTest: finished");
}

export async function resetTest() {
  ensureNotProd();

  const dbName = _getDatabaseName();
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(
      "Refusing to run resetTest against non-test database (database name must include 'test')",
    );
  }

  console.log("resetTest: wiping and reseeding test data");

  // 清除管理员系统数据
  try {
    await prisma.admin?.deleteMany();
  } catch {
    /* ignore */
  }
  try {
    await prisma.role?.deleteMany();
  } catch {
    /* ignore */
  }

  // 清除题目相关数据（QuestionCategory 有 FK，必须先于 question/option 删除）
  try {
    await prisma.answerAttempt?.deleteMany();
  } catch {
    /* ignore */
  }
  await prisma.questionCategory.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  // 重新插入（含分类体系）
  await seedSystem();
  await seedTest();
  console.log("resetTest: finished");
}

export { prisma };
