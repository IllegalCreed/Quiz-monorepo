/**
 * 数据库种子数据脚本
 *
 * 用法：通过 package.json 脚本调用（会自动加载环境变量）
 *   pnpm run db:seed:dev   - 开发库
 *   pnpm run db:seed:test  - 测试库（重置）
 *   pnpm run db:seed:prod  - 生产库（需要确认）
 */
import { seedSystem, resetTest } from "../prisma/db-utils";

async function main() {
  const mode = process.argv[2] || "dev";
  if (!["dev", "test", "prod"].includes(mode)) {
    console.error("Usage: seed.ts <dev|test|prod>");
    process.exit(1);
  }

  // 生产环境需要明确确认
  if (mode === "prod" && process.env.QUIZ_ALLOW_PROD_SEED !== "true") {
    console.error(
      "拒绝向生产库插入种子数据。如需强制执行，设置环境变量 QUIZ_ALLOW_PROD_SEED=true",
    );
    process.exit(1);
  }

  try {
    if (mode === "test") {
      console.log("重置并插入测试数据...");
      await resetTest();
    } else {
      console.log(`插入系统基础数据 (${mode})...`);
      await seedSystem();
    }
    console.log("✅ 完成");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ 失败:", msg);
    process.exit(1);
  } finally {
    // 显式退出避免 Prisma Client 挂起
    process.exit(0);
  }
}

void main();
