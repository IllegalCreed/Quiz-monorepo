/**
 * 当前登录管理员信息接口
 * 由 JWT Strategy 解析 token 后注入到 request.user
 */
export interface AdminInfo {
  /** 管理员 ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 角色（兼容前端：'super_admin' 或 'admin'） */
  role: string;
  /** 角色 ID */
  roleId: number;
  /** 角色名称 */
  roleName: string;
  /** 菜单权限列表 */
  menuPermissions: string[];
  /** API 权限列表 */
  apiPermissions: string[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
