/**
 * 系统日志种子数据
 * 为单元测试和 E2E 测试创建多种类型的日志记录
 *
 * 覆盖场景：
 * - LOGIN 成功/失败（管理员 + 用户）
 * - API_MUTATION 成功/失败（CREATE / UPDATE / DELETE）
 * - 不同操作者（super_admin ID=1, admin ID=2, testuser1 ID=1）
 * - 不同时间（过去 7 天分散）
 */

import type { PrismaClient, Prisma } from "@prisma/client";

/** 日志种子数据条目（不含 id，由 AUTO_INCREMENT 分配） */
interface SeedLog {
  type: "LOGIN" | "API_MUTATION";
  actorType: "ADMIN" | "USER";
  actorId: number | null;
  actorName: string | null;
  action: string;
  module: string;
  path: string;
  method: string;
  params?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  success: boolean;
  error?: string | null;
  ip: string | null;
  durationMs: number | null;
  createdAt: Date;
}

/**
 * 插入系统日志种子数据
 * 共 15 条，支持分页测试（pageSize=10 时产生 2 页）
 */
export async function seedSystemLogs(prisma: PrismaClient): Promise<void> {
  console.log("  📋 创建系统日志种子数据...");

  const now = Date.now();
  const DAY = 86400000;

  const logs: SeedLog[] = [
    // ===== LOGIN 日志 =====
    // 1. 管理员登录成功
    {
      type: "LOGIN",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "LOGIN",
      module: "auth",
      path: "/admin/auth/login",
      method: "POST",
      success: true,
      ip: "127.0.0.1",
      durationMs: 150,
      createdAt: new Date(now - 7 * DAY),
    },
    // 2. 管理员登录失败（密码错误）
    {
      type: "LOGIN",
      actorType: "ADMIN",
      actorId: null,
      actorName: "unknown_user",
      action: "LOGIN",
      module: "auth",
      path: "/admin/auth/login",
      method: "POST",
      success: false,
      error: "账号或密码错误",
      ip: "192.168.1.50",
      durationMs: 80,
      createdAt: new Date(now - 6 * DAY - 3600000),
    },
    // 3. 管理员登录成功（普通管理员）
    {
      type: "LOGIN",
      actorType: "ADMIN",
      actorId: 2,
      actorName: "admin",
      action: "LOGIN",
      module: "auth",
      path: "/admin/auth/login",
      method: "POST",
      success: true,
      ip: "192.168.1.100",
      durationMs: 120,
      createdAt: new Date(now - 6 * DAY),
    },
    // 4. 用户登录成功
    {
      type: "LOGIN",
      actorType: "USER",
      actorId: 1,
      actorName: "testuser1",
      action: "LOGIN",
      module: "user-auth",
      path: "/api/user/auth/login",
      method: "POST",
      success: true,
      ip: "10.0.0.5",
      durationMs: 100,
      createdAt: new Date(now - 5 * DAY),
    },
    // 5. 用户登录失败
    {
      type: "LOGIN",
      actorType: "USER",
      actorId: null,
      actorName: "wronguser",
      action: "LOGIN",
      module: "user-auth",
      path: "/api/user/auth/login",
      method: "POST",
      success: false,
      error: "账号或密码错误",
      ip: "10.0.0.99",
      durationMs: 60,
      createdAt: new Date(now - 5 * DAY + 7200000),
    },

    // ===== API_MUTATION 日志 =====
    // 6. 创建题目（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "CREATE",
      module: "questions",
      path: "/admin/questions",
      method: "POST",
      params: { stem: "测试题目", type: "single_choice" },
      result: { _truncated: false },
      success: true,
      ip: "127.0.0.1",
      durationMs: 200,
      createdAt: new Date(now - 4 * DAY),
    },
    // 7. 更新题目（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "UPDATE",
      module: "questions",
      path: "/admin/questions/1",
      method: "PATCH",
      params: { stem: "更新后的题干", explanation: "补充解析" },
      success: true,
      ip: "127.0.0.1",
      durationMs: 180,
      createdAt: new Date(now - 4 * DAY + 3600000),
    },
    // 8. 切换用户状态（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "UPDATE",
      module: "app-users",
      path: "/admin/app-users/3/status",
      method: "PATCH",
      params: { status: "DISABLED" },
      success: true,
      ip: "127.0.0.1",
      durationMs: 100,
      createdAt: new Date(now - 3 * DAY),
    },
    // 9. 创建分类（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 2,
      actorName: "admin",
      action: "CREATE",
      module: "categories",
      path: "/admin/categories/nodes",
      method: "POST",
      params: { name: "新分类", groupId: 1, parentId: null },
      success: true,
      ip: "192.168.1.100",
      durationMs: 150,
      createdAt: new Date(now - 3 * DAY + 7200000),
    },
    // 10. 删除分类（失败 — 不存在）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 2,
      actorName: "admin",
      action: "DELETE",
      module: "categories",
      path: "/admin/categories/nodes/999",
      method: "DELETE",
      success: false,
      error: "分类不存在",
      ip: "192.168.1.100",
      durationMs: 50,
      createdAt: new Date(now - 2 * DAY),
    },
    // 11. 创建管理员（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "CREATE",
      module: "admins",
      path: "/admin/admins",
      method: "POST",
      params: { username: "new_admin", password: "***", roleId: 2 },
      success: true,
      ip: "127.0.0.1",
      durationMs: 250,
      createdAt: new Date(now - 2 * DAY + 3600000),
    },
    // 12. 删除管理员（失败 — 保护规则）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "DELETE",
      module: "admins",
      path: "/admin/admins/1",
      method: "DELETE",
      success: false,
      error: "不可删除超级管理员",
      ip: "127.0.0.1",
      durationMs: 30,
      createdAt: new Date(now - 1 * DAY),
    },
    // 13. 更新角色权限（成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 1,
      actorName: "super_admin",
      action: "UPDATE",
      module: "roles",
      path: "/admin/roles/2",
      method: "PATCH",
      params: { menuPermissions: ["dashboard", "questions"] },
      success: true,
      ip: "127.0.0.1",
      durationMs: 130,
      createdAt: new Date(now - 1 * DAY + 3600000),
    },
    // 14. 删除题目（软删除，成功）
    {
      type: "API_MUTATION",
      actorType: "ADMIN",
      actorId: 2,
      actorName: "admin",
      action: "DELETE",
      module: "questions",
      path: "/admin/questions/5",
      method: "DELETE",
      success: true,
      ip: "192.168.1.100",
      durationMs: 90,
      createdAt: new Date(now - 12 * 3600000),
    },
    // 15. 用户注册（成功）
    {
      type: "LOGIN",
      actorType: "USER",
      actorId: 2,
      actorName: "testuser2",
      action: "REGISTER",
      module: "user-auth",
      path: "/api/user/auth/register",
      method: "POST",
      success: true,
      ip: "10.0.0.20",
      durationMs: 200,
      createdAt: new Date(now - 6 * 3600000),
    },
  ];

  // 使用 createMany 批量插入（ID 由 AUTO_INCREMENT 分配，reset 后从 1 开始）
  await prisma.systemLog.createMany({
    data: logs.map((log) => ({
      ...log,
      params: (log.params as Prisma.InputJsonValue) ?? undefined,
      result: (log.result as Prisma.InputJsonValue) ?? undefined,
      error: log.error ?? null,
    })),
  });

  console.log(`     ✓ 创建 ${logs.length} 条系统日志`);
}
