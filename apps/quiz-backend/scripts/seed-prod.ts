/**
 * 生产库种子数据脚本（安全版本）
 *
 * 与 seed.ts 的区别：
 *   - 只调用 seedSystem()（管理员账号 + 角色），不调用 seedTest()
 *   - 生产库中不应存在测试数据
 *
 * 用法：
 *   pnpm run db:seed:prod
 */
import { seedSystem } from "../prisma/db-utils";

async function main() {
  try {
    console.log("插入生产系统基础数据（管理员 + 角色）...");
    await seedSystem();
    console.log("✅ 完成");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ 失败:", msg);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

void main();
