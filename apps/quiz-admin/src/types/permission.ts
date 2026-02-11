/**
 * 权限相关类型定义
 *
 * 权限模型：
 * - 超级管理员(super_admin)：拥有全部权限，包括管理员管理
 * - 普通管理员(admin)：可管理 App 用户，不可管理管理员
 */

/** 菜单权限 */
export interface MenuPermission {
  key: string
  label: string
  children?: MenuPermission[]
}

/** API 权限 */
export interface ApiPermission {
  key: string
  label: string
  module: string
}

/** 所有菜单权限 */
export const ALL_MENU_PERMISSIONS: MenuPermission[] = [
  { key: 'dashboard', label: '欢迎页' },
  { key: 'users', label: '用户管理' },
  { key: 'admins', label: '管理员管理' },
  { key: 'system', label: '系统设置' },
]

/** 所有 API 权限 */
export const ALL_API_PERMISSIONS: ApiPermission[] = [
  // App 用户模块
  { key: 'users:read', label: '查看用户', module: 'users' },
  { key: 'users:write', label: '新增/编辑用户', module: 'users' },
  { key: 'users:delete', label: '删除用户', module: 'users' },
  // 管理员模块（仅超级管理员可分配）
  { key: 'admins:read', label: '查看管理员', module: 'admins' },
  { key: 'admins:write', label: '新增/编辑管理员', module: 'admins' },
  { key: 'admins:delete', label: '删除管理员', module: 'admins' },
  { key: 'admins:permission', label: '配置管理员权限', module: 'admins' },
]
