/**
 * Quiz App 用户种子数据
 *
 * 创建 3 个测试用户：
 * - testuser1（活跃用户）
 * - testuser2（活跃用户）
 * - disableduser（已禁用）
 */

import * as bcrypt from "bcrypt";
import type { PrismaClient } from "@prisma/client";

/** bcrypt 加密轮次 */
const SALT_ROUNDS = 10;

/**
 * 初始化测试用户种子数据
 */
export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log("  👤 创建测试用户...");

  const password = await bcrypt.hash("user123", SALT_ROUNDS);

  const user1 = await prisma.user.upsert({
    where: { id: 1 },
    update: { password, status: "ACTIVE" },
    create: {
      id: 1,
      username: "testuser1",
      password,
      nickname: "测试用户一",
      email: "user1@example.com",
      status: "ACTIVE",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { id: 2 },
    update: { password, status: "ACTIVE" },
    create: {
      id: 2,
      username: "testuser2",
      password,
      nickname: "测试用户二",
      email: "user2@example.com",
      status: "ACTIVE",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { id: 3 },
    update: { password, status: "DISABLED" },
    create: {
      id: 3,
      username: "disableduser",
      password,
      nickname: "被禁用的用户",
      email: "disabled@example.com",
      status: "DISABLED",
    },
  });

  console.log(`     ✓ ${user1.username} (ACTIVE)`);
  console.log(`     ✓ ${user2.username} (ACTIVE)`);
  console.log(`     ✓ ${user3.username} (DISABLED)`);
}
