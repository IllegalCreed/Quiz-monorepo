/**
 * Quiz Admin 管理员系统种子数据
 *
 * 创建：
 * - 3 个角色（超级管理员、内容管理员、用户管理员）
 * - 2 个管理员账号（super_admin、admin）
 */

import * as bcrypt from "bcrypt";
import type { PrismaClient } from "@prisma/client";

// bcrypt 加密轮次
const SALT_ROUNDS = 10;

/**
 * 初始化管理员系统种子数据
 */
export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  console.log("🌱 开始插入管理员系统种子数据...");

  // 1. 创建角色
  console.log("  📋 创建角色...");

  /** 超级管理员 API 权限：覆盖所有资源模块 */
  const superAdminApiPermissions = [
    "users:*",
    "admins:*",
    "roles:*",
    "permissions:*",
    "questions:*",
    "categories:*",
    "tags:*",
    "answers:*",
    "statistics:*",
    "clients:*",
    "system:*",
  ];

  // 3 个角色相互独立，并行 upsert 减少串行往返
  const contentAdminPermissions = [
    "questions:list",
    "questions:create",
    "questions:update",
    "questions:delete",
    "questions:publish",
    "categories:list",
    "categories:create",
    "categories:update",
    "categories:delete",
    "tags:*",
  ];
  const [superAdminRole, contentAdminRole, userAdminRole] = await Promise.all([
    prisma.role.upsert({
      where: { id: 1 },
      // 超级管理员菜单权限用通配符，与 jwt.strategy.ts 的处理逻辑对称
      // update 同步更新 apiPermissions，确保已有记录也能修正
      update: {
        menuPermissions: ["*"],
        apiPermissions: superAdminApiPermissions,
      },
      create: {
        id: 1,
        name: "超级管理员",
        description: "系统内置角色，拥有全部权限",
        isSystem: true,
        menuPermissions: ["*"],
        apiPermissions: superAdminApiPermissions,
      },
    }),
    prisma.role.upsert({
      where: { id: 2 },
      update: {
        menuPermissions: ["dashboard", "questions", "categories"],
        apiPermissions: contentAdminPermissions,
      },
      create: {
        id: 2,
        name: "内容管理员",
        description: "管理题目、分类和标签",
        isSystem: false,
        menuPermissions: ["dashboard", "questions", "categories"],
        apiPermissions: contentAdminPermissions,
      },
    }),
    prisma.role.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: "用户管理员",
        description: "管理 App 用户",
        isSystem: false,
        menuPermissions: ["dashboard", "users"],
        apiPermissions: ["users:*"],
      },
    }),
  ]);

  console.log(`     ✓ 超级管理员角色 (ID: ${superAdminRole.id})`);
  console.log(`     ✓ 内容管理员角色 (ID: ${contentAdminRole.id})`);
  console.log(`     ✓ 用户管理员角色 (ID: ${userAdminRole.id})`);

  // 2. 创建管理员账号 — bcrypt 散列与 DB upsert 都可并行
  console.log("  👤 创建管理员账号...");
  const [superAdminPassword, adminPassword] = await Promise.all([
    bcrypt.hash("super_admin", SALT_ROUNDS),
    bcrypt.hash("admin123", SALT_ROUNDS),
  ]);
  const [superAdmin, admin] = await Promise.all([
    prisma.admin.upsert({
      where: { id: 1 },
      update: {
        password: superAdminPassword,
        nickname: "超级管理员",
        roleId: superAdminRole.id,
        status: "ACTIVE",
      },
      create: {
        id: 1,
        username: "super_admin",
        password: superAdminPassword,
        nickname: "超级管理员",
        roleId: superAdminRole.id,
        status: "ACTIVE",
      },
    }),
    prisma.admin.upsert({
      where: { id: 2 },
      update: {
        password: adminPassword,
        nickname: "普通管理员",
        roleId: userAdminRole.id,
        status: "ACTIVE",
      },
      create: {
        id: 2,
        username: "admin",
        password: adminPassword,
        nickname: "普通管理员",
        roleId: userAdminRole.id,
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`     ✓ ${superAdmin.username} (角色: ${superAdminRole.name})`);
  console.log(`     ✓ ${admin.username} (角色: ${userAdminRole.name})`);

  console.log("✅ 管理员系统种子数据插入完成！");
}
