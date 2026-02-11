/**
 * 路由相关类型定义
 */
import type { LocationQueryRaw } from 'vue-router'

/** 路由类似对象(用于 Tab 历史) */
export interface RouteLike {
  path: string
  fullPath: string
  name?: string | symbol
  meta?: Record<string, unknown>
  query?: LocationQueryRaw
}
