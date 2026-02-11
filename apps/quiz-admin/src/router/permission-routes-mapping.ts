/**
 * 权限-路由映射表
 * 定义每个菜单权限对应哪些路由名称
 */
export const permissionRoutesMapping: Record<string, string[]> = {
  dashboard: ['dashboard'],
  users: ['users'],
  admins: ['admins'],
  system: ['settings'],
}
