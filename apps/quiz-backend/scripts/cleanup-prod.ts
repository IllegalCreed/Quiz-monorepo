/**
 * 生产库内容数据清理脚本（一次性使用）
 *
 * 清理范围：
 *   - 用户数据：User、UserPreference、AnswerAttempt
 *   - 内容数据：QuestionCategory、Option、Question、Category、CategoryGroup
 *   - 日志数据：SystemLog
 *
 * 保留：Admin、Role（系统基础数据）
 *
 * 原则：只在确认后执行，运行后数据不可恢复
 *
 * 用法：
 *   pnpm run db:cleanup:prod
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// 初始化 Prisma Client
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
    throw new Error("DATABASE_URL not set.");
  }
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  // 安全确认
  if (process.env.QUIZ_ALLOW_PROD_CLEANUP !== "true") {
    console.error(
      "拒绝清理生产库数据。如需强制执行，设置环境变量 QUIZ_ALLOW_PROD_CLEANUP=true",
    );
    process.exit(1);
  }

  console.log("⚠️  开始清理生产库内容数据...");

  // 按外键依赖顺序删除
  const r1 = await prisma.answerAttempt.deleteMany();
  console.log(`  删除 AnswerAttempt: ${r1.count} 条`);

  const r2 = await prisma.userPreference.deleteMany();
  console.log(`  删除 UserPreference: ${r2.count} 条`);

  const r3 = await prisma.user.deleteMany();
  console.log(`  删除 User: ${r3.count} 条`);

  const r4 = await prisma.systemLog.deleteMany();
  console.log(`  删除 SystemLog: ${r4.count} 条`);

  const r5 = await prisma.questionCategory.deleteMany();
  console.log(`  删除 QuestionCategory: ${r5.count} 条`);

  const r6 = await prisma.option.deleteMany();
  console.log(`  删除 Option: ${r6.count} 条`);

  const r7 = await prisma.question.deleteMany();
  console.log(`  删除 Question: ${r7.count} 条`);

  const r8 = await prisma.category.deleteMany();
  console.log(`  删除 Category: ${r8.count} 条`);

  const r9 = await prisma.categoryGroup.deleteMany();
  console.log(`  删除 CategoryGroup: ${r9.count} 条`);

  console.log("✅ 清理完成，Admin 和 Role 数据已保留");
}

main()
  .catch((e) => {
    console.error("❌ 清理失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
