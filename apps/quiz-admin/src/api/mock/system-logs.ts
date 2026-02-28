/**
 * Mock 系统日志 API
 * 与种子数据 seed-logs.ts 对齐，共 15 条
 * 支持筛选和分页
 */
import type { SystemLogItem, QuerySystemLogsParams, PaginatedResult } from "@/api/system-logs";

/** 生成时间戳辅助函数 */
const now = Date.now();
const DAY = 86400000;

/** Mock 数据库 - 系统日志（与种子数据一致） */
const mockSystemLogs: SystemLogItem[] = [
  // 1. 管理员登录成功
  {
    id: 1,
    type: "LOGIN",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "LOGIN",
    module: "auth",
    path: "/admin/auth/login",
    method: "POST",
    params: null,
    result: null,
    success: true,
    error: null,
    ip: "127.0.0.1",
    durationMs: 150,
    createdAt: new Date(now - 7 * DAY).toISOString(),
  },
  // 2. 管理员登录失败（密码错误）
  {
    id: 2,
    type: "LOGIN",
    actorType: "ADMIN",
    actorId: null,
    actorName: "unknown_user",
    action: "LOGIN",
    module: "auth",
    path: "/admin/auth/login",
    method: "POST",
    params: null,
    result: null,
    success: false,
    error: "账号或密码错误",
    ip: "192.168.1.50",
    durationMs: 80,
    createdAt: new Date(now - 6 * DAY - 3600000).toISOString(),
  },
  // 3. 管理员登录成功（普通管理员）
  {
    id: 3,
    type: "LOGIN",
    actorType: "ADMIN",
    actorId: 2,
    actorName: "admin",
    action: "LOGIN",
    module: "auth",
    path: "/admin/auth/login",
    method: "POST",
    params: null,
    result: null,
    success: true,
    error: null,
    ip: "192.168.1.100",
    durationMs: 120,
    createdAt: new Date(now - 6 * DAY).toISOString(),
  },
  // 4. 用户登录成功
  {
    id: 4,
    type: "LOGIN",
    actorType: "USER",
    actorId: 1,
    actorName: "testuser1",
    action: "LOGIN",
    module: "user-auth",
    path: "/api/user/auth/login",
    method: "POST",
    params: null,
    result: null,
    success: true,
    error: null,
    ip: "10.0.0.5",
    durationMs: 100,
    createdAt: new Date(now - 5 * DAY).toISOString(),
  },
  // 5. 用户登录失败
  {
    id: 5,
    type: "LOGIN",
    actorType: "USER",
    actorId: null,
    actorName: "wronguser",
    action: "LOGIN",
    module: "user-auth",
    path: "/api/user/auth/login",
    method: "POST",
    params: null,
    result: null,
    success: false,
    error: "账号或密码错误",
    ip: "10.0.0.99",
    durationMs: 60,
    createdAt: new Date(now - 5 * DAY + 7200000).toISOString(),
  },
  // 6. 创建题目（成功）
  {
    id: 6,
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
    error: null,
    ip: "127.0.0.1",
    durationMs: 200,
    createdAt: new Date(now - 4 * DAY).toISOString(),
  },
  // 7. 更新题目（成功）
  {
    id: 7,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "UPDATE",
    module: "questions",
    path: "/admin/questions/1",
    method: "PATCH",
    params: { stem: "更新后的题干", explanation: "补充解析" },
    result: null,
    success: true,
    error: null,
    ip: "127.0.0.1",
    durationMs: 180,
    createdAt: new Date(now - 4 * DAY + 3600000).toISOString(),
  },
  // 8. 切换用户状态（成功）
  {
    id: 8,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "UPDATE",
    module: "app-users",
    path: "/admin/app-users/3/status",
    method: "PATCH",
    params: { status: "DISABLED" },
    result: null,
    success: true,
    error: null,
    ip: "127.0.0.1",
    durationMs: 100,
    createdAt: new Date(now - 3 * DAY).toISOString(),
  },
  // 9. 创建分类（成功）
  {
    id: 9,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 2,
    actorName: "admin",
    action: "CREATE",
    module: "categories",
    path: "/admin/categories/nodes",
    method: "POST",
    params: { name: "新分类", groupId: 1, parentId: null },
    result: null,
    success: true,
    error: null,
    ip: "192.168.1.100",
    durationMs: 150,
    createdAt: new Date(now - 3 * DAY + 7200000).toISOString(),
  },
  // 10. 删除分类（失败）
  {
    id: 10,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 2,
    actorName: "admin",
    action: "DELETE",
    module: "categories",
    path: "/admin/categories/nodes/999",
    method: "DELETE",
    params: null,
    result: null,
    success: false,
    error: "分类不存在",
    ip: "192.168.1.100",
    durationMs: 50,
    createdAt: new Date(now - 2 * DAY).toISOString(),
  },
  // 11. 创建管理员（成功）
  {
    id: 11,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "CREATE",
    module: "admins",
    path: "/admin/admins",
    method: "POST",
    params: { username: "new_admin", password: "***", roleId: 2 },
    result: null,
    success: true,
    error: null,
    ip: "127.0.0.1",
    durationMs: 250,
    createdAt: new Date(now - 2 * DAY + 3600000).toISOString(),
  },
  // 12. 删除管理员（失败 — 保护规则）
  {
    id: 12,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "DELETE",
    module: "admins",
    path: "/admin/admins/1",
    method: "DELETE",
    params: null,
    result: null,
    success: false,
    error: "不可删除超级管理员",
    ip: "127.0.0.1",
    durationMs: 30,
    createdAt: new Date(now - 1 * DAY).toISOString(),
  },
  // 13. 更新角色权限（成功）
  {
    id: 13,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 1,
    actorName: "super_admin",
    action: "UPDATE",
    module: "roles",
    path: "/admin/roles/2",
    method: "PATCH",
    params: { menuPermissions: ["dashboard", "questions"] },
    result: null,
    success: true,
    error: null,
    ip: "127.0.0.1",
    durationMs: 130,
    createdAt: new Date(now - 1 * DAY + 3600000).toISOString(),
  },
  // 14. 删除题目（软删除，成功）
  {
    id: 14,
    type: "API_MUTATION",
    actorType: "ADMIN",
    actorId: 2,
    actorName: "admin",
    action: "DELETE",
    module: "questions",
    path: "/admin/questions/5",
    method: "DELETE",
    params: null,
    result: null,
    success: true,
    error: null,
    ip: "192.168.1.100",
    durationMs: 90,
    createdAt: new Date(now - 12 * 3600000).toISOString(),
  },
  // 15. 用户注册（成功）
  {
    id: 15,
    type: "LOGIN",
    actorType: "USER",
    actorId: 2,
    actorName: "testuser2",
    action: "REGISTER",
    module: "user-auth",
    path: "/api/user/auth/register",
    method: "POST",
    params: null,
    result: null,
    success: true,
    error: null,
    ip: "10.0.0.20",
    durationMs: 200,
    createdAt: new Date(now - 6 * 3600000).toISOString(),
  },
];

/**
 * Mock 获取系统日志列表（分页+筛选）
 */
export const getSystemLogs = async (
  params: QuerySystemLogsParams = {},
): Promise<PaginatedResult<SystemLogItem>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockSystemLogs];

  // 日志类型筛选
  if (params.type) {
    filtered = filtered.filter((log) => log.type === params.type);
  }

  // 操作者类型筛选
  if (params.actorType) {
    filtered = filtered.filter((log) => log.actorType === params.actorType);
  }

  // 模块筛选
  if (params.module) {
    filtered = filtered.filter((log) => log.module === params.module);
  }

  // 成功/失败筛选
  if (params.success !== undefined && params.success !== "") {
    const successValue = params.success === "true";
    filtered = filtered.filter((log) => log.success === successValue);
  }

  // 日期范围筛选
  if (params.startDate) {
    const start = new Date(params.startDate).getTime();
    filtered = filtered.filter((log) => new Date(log.createdAt).getTime() >= start);
  }
  if (params.endDate) {
    const end = new Date(params.endDate).getTime();
    filtered = filtered.filter((log) => new Date(log.createdAt).getTime() <= end);
  }

  // 按时间倒序排列（最新在前）
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 分页
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { total: filtered.length, items };
};
