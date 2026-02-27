/**
 * 统一请求封装
 *
 * - 自动注入 Authorization Bearer token
 * - 自动解包后端统一响应格式 { code, data, message }
 * - 401 时调用外部注入的回调（避免循环依赖）
 */

/** API 基础地址 */
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:10020/api";

/** localStorage 中 token 的 key（与 useUserStore 一致） */
const TOKEN_KEY = "quiz-user-token";

/** 后端统一响应格式 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 401 回调（由 main.ts 注入） */
let on401Handler: (() => void) | null = null;

/**
 * 注册 401 处理回调
 *
 * @param handler - token 过期或未登录时的处理函数
 */
export function setOn401Handler(handler: () => void) {
  on401Handler = handler;
}

/**
 * 通用请求函数
 *
 * @param url - 相对路径（如 "/questions"），会自动拼接 BASE_URL
 * @param options - 原生 fetch 选项
 * @returns 解包后的 data 字段
 */
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 合并 headers，自动注入 token
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // POST/PUT 默认 JSON content-type
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  // 401 未授权 → 调用回调
  if (res.status === 401) {
    on401Handler?.();
    throw new Error("未登录或登录已过期");
  }

  // 非 2xx 响应
  if (!res.ok) {
    // 尝试从响应体提取错误信息
    let message = `请求失败 (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      // 忽略解析失败
    }
    throw new Error(message);
  }

  // 解包统一响应格式
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

/** GET 请求 */
export function get<T>(url: string): Promise<T> {
  return request<T>(url);
}

/** POST 请求 */
export function post<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** PUT 请求 */
export function put<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
