/**
 * 账号相关类型定义
 */

/** 管理员用户信息（Admin 后台使用者） */
export interface AdminUser {
  id: number;
  username: string;
  nickname: string;
  /** @deprecated 旧的角色字段，保留用于兼容 */
  role: "super_admin" | "admin";
  /** 关联的角色 ID */
  roleId: number | string;
  /** 角色名称（用于显示） */
  roleName: string;
  /** 菜单权限（从角色继承，计算得出） */
  menuPermissions: string[];
  /** API 权限（从角色继承，计算得出） */
  apiPermissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** App 用户信息（Quiz 应用使用者） */
export interface AppUser {
  id: number;
  username: string;
  nickname: string;
  email: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
}

/** 登录表单 */
export interface LoginForm {
  username: string;
  password: string;
}
