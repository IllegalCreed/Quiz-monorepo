/**
 * 账号相关 API（真实后端）
 */
import { post, get } from '@/utils/request'
import type { LoginForm, AdminUser } from '@/types/account'

/** 登录响应 */
interface LoginResponse {
  token: string
  admin: AdminUser
}

/**
 * 登录
 * @param loginForm 登录表单
 * @returns { token, admin }
 */
export const login = async (loginForm: LoginForm): Promise<LoginResponse> => {
  return post<LoginResponse>('/admin/auth/login', loginForm, { skipAuth: true })
}

/**
 * 获取当前管理员信息
 * @returns 管理员信息（包含权限）
 */
export const getInfo = async (): Promise<AdminUser> => {
  return get<AdminUser>('/admin/auth/info')
}

/**
 * 登出
 */
export const logout = async (): Promise<void> => {
  return post<void>('/admin/auth/logout')
}
