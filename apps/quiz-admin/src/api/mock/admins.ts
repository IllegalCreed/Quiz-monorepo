/**
 * Mock 管理员管理 API
 * 仅超级管理员可访问，管理 Admin 后台的管理员账号
 *
 * 保护规则：
 * - 超级管理员不可被删除
 * - 超级管理员的权限不可被修改
 */
import type { AdminUser } from '@/types/account'

/** Mock 数据库 - 管理员列表（与 account.ts 共享数据结构） */
const mockAdmins: AdminUser[] = [
  {
    id: 1,
    username: 'super_admin',
    nickname: '超级管理员',
    role: 'super_admin',
    menuPermissions: ['dashboard', 'users', 'admins', 'system'],
    apiPermissions: [
      'users:read',
      'users:write',
      'users:delete',
      'admins:read',
      'admins:write',
      'admins:delete',
      'admins:permission',
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    username: 'admin',
    nickname: '普通管理员',
    role: 'admin',
    menuPermissions: ['dashboard', 'users'],
    apiPermissions: ['users:read', 'users:write'],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    username: 'editor',
    nickname: '内容编辑员',
    role: 'admin',
    menuPermissions: ['dashboard', 'users'],
    apiPermissions: ['users:read'],
    createdAt: '2024-02-15T10:30:00.000Z',
    updatedAt: '2024-02-15T10:30:00.000Z',
  },
]

/** 自增 ID */
let nextId = 4

/**
 * Mock 获取管理员列表
 * @returns 管理员数组
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [...mockAdmins]
}

/**
 * Mock 创建管理员
 * @param data 管理员数据
 * @returns 新创建的管理员
 */
export const createAdmin = async (
  data: Pick<AdminUser, 'username' | 'nickname' | 'menuPermissions' | 'apiPermissions'>,
): Promise<AdminUser> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 检查用户名是否重复
  if (mockAdmins.some((u) => u.username === data.username)) {
    throw new Error(`用户名 "${data.username}" 已存在`)
  }

  const now = new Date().toISOString()
  const newAdmin: AdminUser = {
    id: nextId++,
    ...data,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  }

  mockAdmins.push(newAdmin)
  return newAdmin
}

/**
 * Mock 更新管理员权限
 * 超级管理员的权限不可修改
 * @param id 管理员 ID
 * @param menuPermissions 菜单权限数组
 * @param apiPermissions API 权限数组
 */
export const updateAdminPermissions = async (
  id: number,
  menuPermissions: string[],
  apiPermissions: string[],
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const admin = mockAdmins.find((u) => u.id === id)
  if (!admin) {
    throw new Error(`管理员 ID ${id} 不存在`)
  }

  // 超级管理员权限不可修改
  if (admin.role === 'super_admin') {
    throw new Error('超级管理员的权限不可修改')
  }

  admin.menuPermissions = menuPermissions
  admin.apiPermissions = apiPermissions
  admin.updatedAt = new Date().toISOString()
}

/**
 * Mock 删除管理员
 * 超级管理员不可被删除
 * @param id 管理员 ID
 */
export const deleteAdmin = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const admin = mockAdmins.find((u) => u.id === id)
  if (!admin) {
    throw new Error(`管理员 ID ${id} 不存在`)
  }

  // 超级管理员不可删除
  if (admin.role === 'super_admin') {
    throw new Error('超级管理员不可被删除')
  }

  const index = mockAdmins.findIndex((u) => u.id === id)
  mockAdmins.splice(index, 1)
}
