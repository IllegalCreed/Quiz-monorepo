/**
 * Mock 管理员管理 API
 * 仅超级管理员可访问，管理 Admin 后台的管理员账号
 *
 * RBAC 模型：管理员 → 角色 → 权限
 * - 管理员通过 roleId 关联角色
 * - 权限从角色继承（动态计算）
 *
 * 保护规则：
 * - 超级管理员不可被删除
 * - 超级管理员的角色不可被修改
 */
import type { AdminUser } from '@/types/account'
import { getRoles } from './roles'

/**
 * Mock 数据库 - 管理员列表（简化存储，只存关键信息）
 */
interface AdminUserStorage {
  id: number
  username: string
  nickname: string
  role: 'super_admin' | 'admin' // 保留用于兼容
  roleId: number | string
  roleName: string
  createdAt: string
  updatedAt: string
}

const mockAdmins: AdminUserStorage[] = [
  {
    id: 1,
    username: 'super_admin',
    nickname: '超级管理员',
    role: 'super_admin',
    roleId: 1, // 超级管理员角色
    roleName: '超级管理员',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    username: 'admin',
    nickname: '普通管理员',
    role: 'admin',
    roleId: 3, // 用户管理员角色
    roleName: '用户管理员',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    username: 'editor',
    nickname: '内容编辑员',
    role: 'admin',
    roleId: 4, // 只读管理员角色
    roleName: '只读管理员',
    createdAt: '2024-02-15T10:30:00.000Z',
    updatedAt: '2024-02-15T10:30:00.000Z',
  },
]

/** 自增 ID */
let nextId = 4

/**
 * 从角色继承权限（核心逻辑）
 * 根据管理员的 roleId 查找角色，并继承角色的权限
 */
const inheritPermissionsFromRole = async (
  admin: AdminUserStorage,
): Promise<AdminUser> => {
  // 获取所有角色
  const roles = await getRoles()

  // 查找管理员对应的角色
  const role = roles.find((r) => r.id === admin.roleId)

  if (!role) {
    throw new Error(`角色 ID ${admin.roleId} 不存在`)
  }

  // 从角色继承权限
  return {
    ...admin,
    menuPermissions: role.menuPermissions,
    apiPermissions: role.apiPermissions,
  }
}

/**
 * Mock 获取管理员列表
 * @returns 管理员数组（包含从角色继承的权限）
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  // 为每个管理员从角色继承权限
  const adminsWithPermissions = await Promise.all(
    mockAdmins.map((admin) => inheritPermissionsFromRole(admin)),
  )

  return adminsWithPermissions
}

/**
 * Mock 创建管理员
 * @param data 管理员数据（包含 roleId）
 * @returns 新创建的管理员
 */
export const createAdmin = async (data: {
  username: string
  nickname: string
  roleId: number | string
}): Promise<AdminUser> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 检查用户名是否重复
  if (mockAdmins.some((u) => u.username === data.username)) {
    throw new Error(`用户名 "${data.username}" 已存在`)
  }

  // 验证角色是否存在
  const roles = await getRoles()
  const role = roles.find((r) => r.id === data.roleId)
  if (!role) {
    throw new Error(`角色 ID ${data.roleId} 不存在`)
  }

  const now = new Date().toISOString()
  const newAdmin: AdminUserStorage = {
    id: nextId++,
    username: data.username,
    nickname: data.nickname,
    role: 'admin', // 新创建的管理员默认不是超级管理员
    roleId: data.roleId,
    roleName: role.name,
    createdAt: now,
    updatedAt: now,
  }

  mockAdmins.push(newAdmin)

  // 返回包含权限的完整数据
  return inheritPermissionsFromRole(newAdmin)
}

/**
 * Mock 更新管理员角色
 * 超级管理员的角色不可修改
 * @param id 管理员 ID
 * @param roleId 新的角色 ID
 */
export const updateAdminRole = async (
  id: number,
  roleId: number | string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const admin = mockAdmins.find((u) => u.id === id)
  if (!admin) {
    throw new Error(`管理员 ID ${id} 不存在`)
  }

  // 超级管理员角色不可修改
  if (admin.role === 'super_admin') {
    throw new Error('超级管理员的角色不可修改')
  }

  // 验证角色是否存在
  const roles = await getRoles()
  const role = roles.find((r) => r.id === roleId)
  if (!role) {
    throw new Error(`角色 ID ${roleId} 不存在`)
  }

  // 更新角色
  admin.roleId = roleId
  admin.roleName = role.name
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
