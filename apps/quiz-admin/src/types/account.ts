/**
 * 账号相关类型定义
 */

/** 管理员用户信息（Admin 后台使用者） */
export interface AdminUser {
  id: number
  username: string
  nickname: string
  role: 'super_admin' | 'admin'
  menuPermissions: string[]
  apiPermissions: string[]
  createdAt: string
  updatedAt: string
}

/** App 用户信息（Quiz 应用使用者） */
export interface AppUser {
  id: number
  username: string
  nickname: string
  email: string
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

/** 登录表单 */
export interface LoginForm {
  username: string
  password: string
}
