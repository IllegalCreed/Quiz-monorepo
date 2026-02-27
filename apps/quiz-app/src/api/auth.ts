/**
 * 认证相关 API
 *
 * 对应后端 user-auth 模块：注册 / 登录 / 获取用户信息
 */
import { post, get } from "@/utils/request";
import type { LoginForm, RegisterForm, AuthResponse, UserInfo } from "@/types/user";

/**
 * 用户注册
 *
 * @param form - 注册表单（用户名 3-20 字符，密码 ≥ 6 位）
 * @returns token + 用户信息
 */
export function register(form: RegisterForm): Promise<AuthResponse> {
  return post<AuthResponse>("/user/auth/register", form);
}

/**
 * 用户登录
 *
 * @param form - 登录表单
 * @returns token + 用户信息
 */
export function login(form: LoginForm): Promise<AuthResponse> {
  return post<AuthResponse>("/user/auth/login", form);
}

/**
 * 获取当前用户信息（需要 Bearer token）
 */
export function getUserInfo(): Promise<UserInfo> {
  return get<UserInfo>("/user/auth/info");
}
