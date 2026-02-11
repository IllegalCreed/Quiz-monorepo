/**
 * Mock 账号 API
 *
 * 测试账号:
 * - 超级管理员: super_admin / super_admin (全权限，含管理员管理)
 * - 普通管理员: admin / admin (仅用户管理)
 *
 * Token 格式: mock-token-{userId}-{timestamp}
 * 通过 token 中的 userId 反查用户信息，支持页面刷新后恢复登录状态
 */
import type { LoginForm, AdminUser } from '@/types/account'

/** Mock 数据库 - 管理员列表 */
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
]

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
 * 通过 token 中的 userId 反查用户数据，支持页面刷新
 * @param token 登录 token
 * @returns 管理员信息
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

  return user
}

/**
 * Mock 登出
 * @param _token 登录 token（mock 模式下无需处理）
 */
export const logout = async (_token: string): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200))
}
