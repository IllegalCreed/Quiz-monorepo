/**
 * 角色管理 Mock API
 */

import type { CreateRoleForm, Role, UpdateRoleForm } from '@/types/role'
import { ALL_API_PERMISSIONS } from '@/types/permission'

/** Mock 数据库 - 角色列表 */
const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    description: '系统内置角色，拥有全部权限',
    isSystem: true,
    menuPermissions: ['dashboard', 'users', 'admins', 'roles', 'permissions', 'system'],
    apiPermissions: ALL_API_PERMISSIONS.map((p) => p.key), // 全部权限
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: '内容管理员',
    description: '管理题目、标签等内容',
    isSystem: false,
    menuPermissions: ['dashboard'],
    apiPermissions: [
      'questions:list',
      'questions:create',
      'questions:update',
      'questions:delete',
      'questions:publish',
      'tags:list',
      'tags:create',
      'tags:update',
      'tags:delete',
    ],
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: '用户管理员',
    description: '管理 App 用户',
    isSystem: false,
    menuPermissions: ['dashboard', 'users'],
    apiPermissions: ['users:list', 'users:create', 'users:update', 'users:status', 'users:delete'],
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: '2024-02-15T00:00:00.000Z',
  },
  {
    id: 4,
    name: '只读管理员',
    description: '只能查看数据，不能修改',
    isSystem: false,
    menuPermissions: ['dashboard', 'users'],
    apiPermissions: [
      'users:list',
      'questions:list',
      'tags:list',
      'answers:list',
      'statistics:dashboard',
    ],
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
  },
]

let nextId = 5

/**
 * 获取角色列表
 * 注意：不包含 adminCount，避免循环依赖
 * adminCount 需要由调用方单独计算
 */
export const getRoles = async (): Promise<Role[]> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [...mockRoles]
}

/**
 * 创建角色
 */
export const createRole = async (data: CreateRoleForm): Promise<Role> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 检查名称重复
  if (mockRoles.some((r) => r.name === data.name)) {
    throw new Error(`角色名称 "${data.name}" 已存在`)
  }

  const now = new Date().toISOString()
  const newRole: Role = {
    id: nextId++,
    ...data,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  }

  mockRoles.push(newRole)
  return newRole
}

/**
 * 更新角色
 */
export const updateRole = async (id: number | string, data: UpdateRoleForm): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  const role = mockRoles.find((r) => r.id === id)
  if (!role) {
    throw new Error(`角色 ID ${id} 不存在`)
  }

  // 系统角色不可修改
  if (role.isSystem) {
    throw new Error('系统内置角色不可修改')
  }

  // 检查名称重复
  if (data.name && mockRoles.some((r) => r.id !== id && r.name === data.name)) {
    throw new Error(`角色名称 "${data.name}" 已存在`)
  }

  Object.assign(role, data, { updatedAt: new Date().toISOString() })
}

/**
 * 删除角色
 */
export const deleteRole = async (id: number | string): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 400))

  const role = mockRoles.find((r) => r.id === id)
  if (!role) {
    throw new Error(`角色 ID ${id} 不存在`)
  }

  // 系统角色不可删除
  if (role.isSystem) {
    throw new Error('系统内置角色不可删除')
  }

  // 检查是否有管理员使用该角色
  // 动态导入避免循环依赖
  const { getAdminUsers } = await import('./admins')
  const admins = await getAdminUsers()
  const adminCount = admins.filter((admin) => admin.roleId === id).length

  if (adminCount > 0) {
    throw new Error(`该角色正被 ${adminCount} 个管理员使用，无法删除`)
  }

  const index = mockRoles.findIndex((r) => r.id === id)
  mockRoles.splice(index, 1)
}
