/**
 * Mock 账号 API
 *
 * 测试账号:
 * - 超级管理员: super_admin / super_admin (拥有超级管理员角色)
 * - 普通管理员: admin / admin (拥有用户管理员角色)
 *
 * Token 格式: mock-token-{userId}-{timestamp}
 * 通过 token 中的 userId 反查用户信息，支持页面刷新后恢复登录状态
 *
 * RBAC 模型：管理员 → 角色 → 权限
 * - 管理员通过 roleId 关联角色
 * - 权限从角色继承（动态计算）
 */
import type { LoginForm, AdminUser } from '@/types/account'
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
    roleId: 1, // 关联超级管理员角色
    roleName: '超级管理员',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    username: 'admin',
    nickname: '普通管理员',
    role: 'admin',
    roleId: 3, // 关联用户管理员角色
    roleName: '用户管理员',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

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
 * 从 token 中解析用户 ID
 * Token 格式: mock-token-{userId}-{timestamp}
 */
const parseUserIdFromToken = (token: string): number | null => {
  const match = token.match(/^mock-token-(\d+)-\d+$/)
  return match ? Number(match[1]) : null
}

/**
 * Mock 登录
 * @param loginForm 登录表单
 * @returns token
 */
export const login = async (loginForm: LoginForm): Promise<string> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 查找用户（简化：密码 = 用户名）
  const user = mockAdmins.find(
    (u) => u.username === loginForm.username && loginForm.password === loginForm.username,
  )

  if (!user) {
    throw new Error('账号或密码错误')
  }

  // 生成 token（包含 userId，刷新后可反查）
  const token = `mock-token-${user.id}-${Date.now()}`
  return token
}

/**
 * Mock 获取用户信息
 * 通过 token 中的 userId 反查用户数据，并从角色继承权限
 * @param token 登录 token
 * @returns 管理员信息（包含从角色继承的权限）
 */
export const getInfo = async (token: string): Promise<AdminUser> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  // 从 token 中解析 userId
  const userId = parseUserIdFromToken(token)
  if (!userId) {
    throw new Error('未登录或登录已过期')
  }

  // 通过 userId 查找用户
  const user = mockAdmins.find((u) => u.id === userId)
  if (!user) {
    throw new Error('未登录或登录已过期')
  }

  // 从角色继承权限
  return inheritPermissionsFromRole(user)
}

/**
 * Mock 登出
 * @param _token 登录 token（mock 模式下无需处理）
 */
export const logout = async (_token: string): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200))
}
