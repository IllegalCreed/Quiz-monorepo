/**
 * 管理员管理 API（真实后端）
 */
import { get, post, patch, del } from '@/utils/request'

/** 管理员列表项（不包含权限信息） */
export interface AdminUserItem {
  id: number
  username: string
  nickname: string
  roleId: number
  roleName: string
  status: 'ACTIVE' | 'DISABLED'
  createdAt: string
  updatedAt: string
}

/** 创建管理员表单 */
export interface CreateAdminForm {
  username: string
  password: string
  nickname: string
  roleId: number
}

/** 更新管理员角色表单 */
export interface UpdateAdminRoleForm {
  roleId: number
}

/**
 * 获取管理员列表
 */
export const getAdminUsers = async (): Promise<AdminUserItem[]> => {
  return get<AdminUserItem[]>('/admin/admins')
}

/**
 * 创建管理员
 */
export const createAdmin = async (form: CreateAdminForm): Promise<AdminUserItem> => {
  return post<AdminUserItem>('/admin/admins', form)
}

/**
 * 更新管理员角色
 */
export const updateAdminRole = async (
  id: number,
  form: UpdateAdminRoleForm,
): Promise<AdminUserItem> => {
  return patch<AdminUserItem>(`/admin/admins/${id}/role`, form)
}

/**
 * 删除管理员
 */
export const deleteAdmin = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/admins/${id}`)
}
