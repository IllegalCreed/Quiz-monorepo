/**
 * 路由历史 Store
 * 管理 Tab 历史记录和 keep-alive 缓存
 */
import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import type { RouteLike } from "@/types/router";
import { getPageCacheSettings } from "@/api/mock/settings";

export const useRouterStore = defineStore("router", () => {
  /** 访问过的视图(Tab 历史) */
  const visitedViews = ref<RouteLike[]>([]);

  /** 缓存的视图名称(用于 keep-alive) */
  const cachedViews = ref<string[]>([]);

  /** 页面缓存配置（从系统设置加载，key 是组件名，value 是是否启用缓存） */
  const pageCacheConfig = ref<Record<string, boolean>>({});

  /** 是否显示路由视图（用于刷新） */
  const isRouterAlive = ref(true);

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

    // 如果路由 meta 设置了 noCache,则不缓存（优先级最高）
    if (view.meta?.noCache) {
      return;
    }

    // 检查系统设置中的缓存配置（新增逻辑）
    const isEnabled = pageCacheConfig.value[cacheName];
    if (isEnabled === false) {
      return; // 配置中禁用了缓存
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

  /**
   * 初始化缓存配置
   * 在应用启动时调用，从系统设置加载缓存配置
   */
  const initCacheConfig = async () => {
    try {
      const settings = await getPageCacheSettings();
      // 将配置转换为 Map 格式：{ componentName: cacheEnabled }
      pageCacheConfig.value = settings.pages.reduce(
        (acc, page) => {
          acc[page.componentName] = page.cacheEnabled;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    } catch (error) {
      console.error("加载缓存配置失败:", error);
      // 失败时使用默认配置：全部启用（pageCacheConfig 为空对象时，addCachedView 会默认启用）
      pageCacheConfig.value = {};
    }
  };

  /**
   * 更新单个页面的缓存配置
   * 系统设置页面切换缓存时调用，确保配置和缓存列表同步
   * @param componentName 组件名称（如 "AdminsView"）
   * @param enabled 是否启用缓存
   */
  const updateCacheConfig = (componentName: string, enabled: boolean) => {
    pageCacheConfig.value[componentName] = enabled;
  };

  /**
   * 刷新当前页面
   * 通过临时隐藏 router-view 强制组件重新渲染（无论是否缓存）
   */
  const refreshView = async () => {
    // 隐藏 router-view
    isRouterAlive.value = false;

    // 等待组件销毁
    await nextTick();

    // 显示 router-view（重新创建组件）
    isRouterAlive.value = true;
  };

  /**
   * 动态更新某个 Tab 的显示标题
   * @param path 路由 path
   * @param title 新标题
   */
  const updateViewTitle = (path: string, title: string) => {
    const view = visitedViews.value.find((v) => v.path === path);
    if (view) {
      view.meta = { ...view.meta, title };
    }
  };

  return {
    visitedViews,
    cachedViews,
    isRouterAlive,
    addView,
    addVisitedView,
    addCachedView,
    deleteView,
    deleteVisitedView,
    deleteCachedView,
    clearAllViews,
    initCacheConfig,
    updateCacheConfig,
    refreshView,
    updateViewTitle,
  };
});
