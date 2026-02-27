/**
 * 用户相关类型定义
 */

/** 用户状态枚举 */
export type UserStatus = "ACTIVE" | "DISABLED";

/** 用户信息（对应后端 /api/user/auth/info 响应） */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string | null;
  email: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** 登录表单 */
export interface LoginForm {
  username: string;
  password: string;
}

/** 注册表单 */
export interface RegisterForm {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
}

/** 认证响应（登录/注册共用） */
export interface AuthResponse {
  token: string;
  user: UserInfo;
}
