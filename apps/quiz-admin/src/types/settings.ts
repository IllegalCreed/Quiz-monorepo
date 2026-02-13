/**
 * 系统设置相关类型定义
 */

/** 页面缓存配置项 */
export interface PageCacheConfig {
  /** 路由名称（对应 route.name） */
  routeName: string;
  /** 组件名称（对应 meta.componentName） */
  componentName: string;
  /** 页面标题 */
  title: string;
  /** 是否启用缓存 */
  cacheEnabled: boolean;
}

/** 页面缓存配置响应 */
export interface PageCacheSettings {
  /** 所有页面的缓存配置 */
  pages: PageCacheConfig[];
  /** 最后更新时间 */
  updatedAt: string;
}

/** 更新页面缓存配置请求 */
export interface UpdatePageCacheRequest {
  /** 路由名称 */
  routeName: string;
  /** 是否启用缓存 */
  cacheEnabled: boolean;
}
