/**
 * 历史路由 Tab 逻辑
 * 监听路由变化，管理 Tab 历史记录
 */
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useRouterStore } from "@/stores/modules/router";
import type { RouteLike } from "@/types/router";

export function useHistoryRouter() {
  const routerStore = useRouterStore();
  const router = useRouter();
  const route = useRoute();

  // 用 storeToRefs 保持响应式连接，避免解构后丢失对 store ref 的追踪
  const { visitedViews } = storeToRefs(routerStore);

  /** 监听路由变化，自动添加到历史记录 */
  watch(route, () => {
    addView();
  });

  /** 组件挂载时添加当前路由 */
  onMounted(() => {
    addView();
  });

  /**
   * 添加当前路由到历史记录
   * 跳过布局容器路由（如 /home），只记录叶子页面
   */
  const addView = () => {
    if (route.name === "home") return;

    routerStore.addView({
      path: route.path,
      fullPath: route.fullPath,
      name: route.name as string,
      meta: route.meta,
      query: route.query,
    });
  };

  /**
   * 关闭 Tab
   * 从 store 中删除视图，如果关闭的是当前激活的 Tab 则跳转到相邻 Tab
   * @param view 要关闭的路由
   */
  function close(view: RouteLike) {
    // 先从 store 删除（X 按钮路径已在 tab-item 中删过，再删一次也无副作用）
    routerStore.deleteView(view);

    // 关闭的是当前激活页面时，才需要跳转
    if (view.path === route.path) {
      const latestView = routerStore.visitedViews.slice(-1)[0];
      if (latestView) {
        return router.push(latestView.fullPath);
      }
      // 没有其他 Tab 了，跳转到 /home（空白状态）
      return router.push("/home");
    }
  }

  /**
   * 关闭其他页签，只保留指定的 Tab
   * 如果当前路由不是目标 Tab，跳转到目标 Tab
   * @param view 要保留的路由
   */
  function closeOthers(view: RouteLike) {
    routerStore.deleteOtherViews(view);
    // 当前路由不是目标 Tab 时，导航到目标 Tab
    if (route.path !== view.path) {
      router.push({ path: view.path, query: view.query });
    }
  }

  /**
   * 关闭全部页签并跳转到 /home
   */
  function closeAll() {
    routerStore.clearAllViews();
    router.push("/home");
  }

  return {
    visitedViews,
    close,
    closeOthers,
    closeAll,
  };
}
