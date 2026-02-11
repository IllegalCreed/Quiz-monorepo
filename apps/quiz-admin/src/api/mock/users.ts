/**
 * Mock App 用户管理 API
 * 管理 Quiz 应用的普通用户（非管理员）
 */
import type { AppUser } from '@/types/account'

/** Mock 数据库 - App 用户列表 */
const mockAppUsers: AppUser[] = [
  {
    id: 1,
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-03-01T10:00:00.000Z',
  },
  {
    id: 2,
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    status: 'active',
    createdAt: '2024-03-05T14:30:00.000Z',
    updatedAt: '2024-03-05T14:30:00.000Z',
  },
  {
    id: 3,
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    status: 'disabled',
    createdAt: '2024-03-10T09:15:00.000Z',
    updatedAt: '2024-04-01T16:00:00.000Z',
  },
  {
    id: 4,
    username: 'zhaoliu',
    nickname: '赵六',
    email: 'zhaoliu@example.com',
    status: 'active',
    createdAt: '2024-03-15T11:45:00.000Z',
    updatedAt: '2024-03-15T11:45:00.000Z',
  },
  {
    id: 5,
    username: 'sunqi',
    nickname: '孙七',
    email: 'sunqi@example.com',
    status: 'active',
    createdAt: '2024-04-02T08:20:00.000Z',
    updatedAt: '2024-04-02T08:20:00.000Z',
  },
]

/** 自增 ID */
let nextId = 6

/**
 * Mock 获取 App 用户列表
 * @returns App 用户数组
 */
export const getAppUsers = async (): Promise<AppUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [...mockAppUsers]
}

/**
 * Mock 创建 App 用户
 * @param data 用户数据（不含 id、createdAt、updatedAt）
 * @returns 新创建的用户
 */
export const createAppUser = async (
  data: Pick<AppUser, 'username' | 'nickname' | 'email'>,
): Promise<AppUser> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 检查用户名是否重复
  if (mockAppUsers.some((u) => u.username === data.username)) {
    throw new Error(`用户名 "${data.username}" 已存在`)
  }

  const now = new Date().toISOString()
  const newUser: AppUser = {
    id: nextId++,
    ...data,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  mockAppUsers.push(newUser)
  return newUser
}

/**
 * Mock 更新 App 用户状态
 * @param id 用户 ID
 * @param status 新状态
 */
export const updateAppUserStatus = async (id: number, status: AppUser['status']): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const user = mockAppUsers.find((u) => u.id === id)
  if (!user) {
    throw new Error(`用户 ID ${id} 不存在`)
  }

  user.status = status
  user.updatedAt = new Date().toISOString()
}

/**
 * Mock 删除 App 用户
 * @param id 用户 ID
 */
export const deleteAppUser = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const index = mockAppUsers.findIndex((u) => u.id === id)
  if (index === -1) {
    throw new Error(`用户 ID ${id} 不存在`)
  }

  mockAppUsers.splice(index, 1)
}
