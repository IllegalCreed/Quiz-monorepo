import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { seedAdmin } from "./data/seed-admin";
import { seedUsers } from "./data/seed-users";
import {
  seedCategories,
  linkTestQuestionCategories,
} from "./data/seed-categories";
import { seedUserData } from "./data/seed-user-data";
import { seedSystemLogs } from "./data/seed-logs";

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

/** 创建基础题目（"Hello World - 基础题"）—— 幂等 */
async function _seedBaseQuestion(): Promise<void> {
  const exists = await prisma.question.findFirst({
    where: { stem: "Hello World - 基础题" },
  });
  if (exists) {
    console.log("seedSystem: base question already exists");
    return;
  }
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
}

export async function seedSystem() {
  ensureNotProd();
  console.log("seedSystem: beginning (idempotent)");

  // 4 个阶段彼此独立（admins / 基础题 / 分类体系 / 测试用户），并行执行
  await Promise.all([
    seedAdmin(prisma),
    _seedBaseQuestion(),
    seedCategories(prisma),
    seedUsers(prisma),
  ]);

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

  // 一次性查出所有同名题目，避免逐题 findFirst（10 次 → 1 次）
  const existingByStem = new Map(
    (
      await prisma.question.findMany({
        where: { stem: { in: data.map((q) => q.stem) } },
        select: { id: true, stem: true },
      })
    ).map((q) => [q.stem, q.id]),
  );

  // 题目间互相独立，可并行 upsert
  await Promise.all(
    data.map(async (q) => {
      const optionsCreate = q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        description: o.description ?? undefined,
      }));
      const existingId = existingByStem.get(q.stem);
      if (existingId !== undefined) {
        await prisma.option.deleteMany({ where: { questionId: existingId } });
        await prisma.question.update({
          where: { id: existingId },
          data: {
            explanation: q.explanation ?? undefined,
            tags: q.tags ?? undefined,
            options: { create: optionsCreate },
          },
        });
      } else {
        await prisma.question.create({
          data: {
            stem: q.stem,
            explanation: q.explanation ?? undefined,
            tags: q.tags ?? undefined,
            options: { create: optionsCreate },
          },
        });
      }
    }),
  );
  console.log(`  Seeded ${data.length} test questions`);

  // 题目已落库后，3 个下游 seed 互相独立，可并行：
  // - linkTestQuestionCategories: 依赖 questions + categories
  // - seedUserData: 依赖 users + questions + categories
  // - seedSystemLogs: 完全独立
  await Promise.all([
    linkTestQuestionCategories(prisma),
    seedUserData(prisma),
    seedSystemLogs(prisma),
  ]);

  console.log("seedTest: finished");
}

/**
 * 一次性清空所有测试表并重置 AUTO_INCREMENT
 *
 * 通过临时关闭外键约束 + TRUNCATE TABLE 实现：
 * - TRUNCATE 自带 AUTO_INCREMENT 重置，无需额外 ALTER TABLE
 * - 跳过 FK 顺序依赖，无需按拓扑顺序删除
 * - 单次连接往返完成全部清理，比逐表 deleteMany 快一个数量级
 *
 * 仅在 resetTest（已确认 db name 含 'test'）中使用，对生产/开发库不可见。
 */
async function _truncateAllTables(): Promise<void> {
  const tables = [
    "UserPreference",
    "SystemLog",
    "AnswerAttempt",
    "QuestionCategory",
    "Option",
    "Question",
    "Category",
    "CategoryGroup",
    "Admin",
    "Role",
    "User",
  ];

  // 用 interactive transaction 把 SET FOREIGN_KEY_CHECKS 与 TRUNCATE 绑定到同一连接，
  // 否则 SET 会因为连接池分发到不同连接而失效。TRUNCATE 是 DDL 隐式提交，
  // 但 FOREIGN_KEY_CHECKS 是 session-level 变量，对同连接的后续语句仍然有效。
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of tables) {
      await tx.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
    }
    await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
  });
}

export async function resetTest() {
  ensureNotProd();

  const dbName = _getDatabaseName();
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(
      "Refusing to run resetTest against non-test database (database name must include 'test')",
    );
  }

  const startedAt = Date.now();
  console.log("resetTest: wiping and reseeding test data");

  // 快速清理：TRUNCATE 所有表（FK 临时关闭，自动重置 AUTO_INCREMENT）
  await _truncateAllTables();
  // 重新插入（含分类体系）
  await seedSystem();
  await seedTest();
  console.log(`resetTest: finished in ${Date.now() - startedAt}ms`);
}

export { prisma };
