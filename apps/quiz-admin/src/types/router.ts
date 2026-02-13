/**
 * 路由相关类型定义
 */
import type { LocationQueryRaw } from "vue-router";

/**
 * 扩展 vue-router 的 RouteMeta 类型
 * 添加自定义的 meta 字段
 */
declare module "vue-router" {
  interface RouteMeta {
    /** 页面标题 */
    title?: string;
    /** 组件名称（用于 keep-alive 缓存，应与组件实际 name 一致） */
    componentName?: string;
    /** 是否不缓存该页面（设为 true 则不使用 keep-alive） */
    noCache?: boolean;
  }
}

/** 路由类似对象(用于 Tab 历史) */
export interface RouteLike {
  path: string;
  fullPath: string;
  name?: string | symbol;
  meta?: {
    title?: string;
    componentName?: string;
    noCache?: boolean;
  };
  query?: LocationQueryRaw;
}
