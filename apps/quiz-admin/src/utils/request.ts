/**
 * HTTP 请求工具（基于 fetch）
 * 统一处理请求拦截、响应拦截和错误处理
 */

/** 统一响应格式 */
interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/** 请求配置 */
interface RequestConfig extends RequestInit {
  skipAuth?: boolean; // 是否跳过自动添加 token
}

/** 获取基础 URL */
const getBaseURL = (): string => {
  return import.meta.env.VITE_API_BASE || "http://localhost:10020/api";
};

/** 从 localStorage 获取 token */
const getToken = (): string | null => {
  return localStorage.getItem("quiz-admin-token");
};

/**
 * 统一的 fetch 请求封装
 * @param url 请求路径（相对路径，会自动拼接 baseURL）
 * @param config 请求配置
 * @returns 响应数据
 */
export const request = async <T = unknown>(url: string, config: RequestConfig = {}): Promise<T> => {
  const { skipAuth = false, headers = {}, ...restConfig } = config;

  // 拼接完整 URL
  const fullUrl = `${getBaseURL()}${url}`;

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // 自动添加 Authorization token（除非跳过）
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  try {
    // 发起请求
    const response = await fetch(fullUrl, {
      ...restConfig,
      headers: requestHeaders,
    });

    // 解析 JSON 响应
    const result: ApiResponse<T> = await response.json();

    // 处理 HTTP 错误状态
    if (!response.ok) {
      throw new Error(result.message || `请求失败: ${response.status}`);
    }

    // 返回 data 字段
    return result.data;
  } catch (error) {
    // 统一错误处理
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("网络请求失败");
  }
};

/**
 * GET 请求
 */
export const get = <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>(url, { ...config, method: "GET" });
};

/**
 * POST 请求
 */
export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT 请求
 */
export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH 请求
 */
export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE 请求
 */
export const del = <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>(url, { ...config, method: "DELETE" });
};
