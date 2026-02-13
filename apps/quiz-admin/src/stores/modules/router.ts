/**
 * 路由历史 Store
 * 管理 Tab 历史记录和 keep-alive 缓存
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import type { RouteLike } from "@/types/router";

export const useRouterStore = defineStore("router", () => {
  /** 访问过的视图(Tab 历史) */
  const visitedViews = ref<RouteLike[]>([]);

  /** 缓存的视图名称(用于 keep-alive) */
  const cachedViews = ref<string[]>([]);

  /**
   * 添加视图到历史记录
   * @param view 路由对象
   */
  const addView = (view: RouteLike) => {
    addVisitedView(view);
    addCachedView(view);
  };

  /**
   * 添加到访问历史(Tab)
   */
  const addVisitedView = (view: RouteLike) => {
    // 如果已存在,不重复添加
    if (visitedViews.value.some((v) => v.path === view.path)) {
      return;
    }

    visitedViews.value.push({
      path: view.path,
      fullPath: view.fullPath,
      name: view.name,
      meta: view.meta,
      query: view.query,
    });
  };

  /**
   * 添加到缓存列表
   */
  const addCachedView = (view: RouteLike) => {
    // 优先使用 meta.componentName（用于 keep-alive 匹配组件 name）
    // 如果没有则使用路由 name（兼容旧逻辑）
    const cacheName = view.meta?.componentName || view.name;

    if (typeof cacheName !== "string") {
      return;
    }

    // 如果已缓存,不重复添加
    if (cachedViews.value.includes(cacheName)) {
      return;
    }

    // 如果路由 meta 设置了 noCache,则不缓存
    if (view.meta?.noCache) {
      return;
    }

    cachedViews.value.push(cacheName);
  };

  /**
   * 删除视图
   * @param view 路由对象
   */
  const deleteView = (view: RouteLike) => {
    deleteVisitedView(view);
    deleteCachedView(view);
  };

  /**
   * 从访问历史中删除
   */
  const deleteVisitedView = (view: RouteLike) => {
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index > -1) {
      visitedViews.value.splice(index, 1);
    }
  };

  /**
   * 从缓存列表中删除
   */
  const deleteCachedView = (view: RouteLike) => {
    // 优先使用 meta.componentName（用于 keep-alive 匹配组件 name）
    // 如果没有则使用路由 name（兼容旧逻辑）
    const cacheName = view.meta?.componentName || view.name;

    if (typeof cacheName !== "string") {
      return;
    }

    const index = cachedViews.value.indexOf(cacheName);
    if (index > -1) {
      cachedViews.value.splice(index, 1);
    }
  };

  /**
   * 清空所有历史
   */
  const clearAllViews = () => {
    visitedViews.value = [];
    cachedViews.value = [];
  };

  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    addCachedView,
    deleteView,
    deleteVisitedView,
    deleteCachedView,
    clearAllViews,
  };
});
