/**
 * 历史路由 Tab 逻辑
 * 监听路由变化，管理 Tab 历史记录
 */
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouterStore } from '@/stores/modules/router'
import type { RouteLike } from '@/types/router'

export function useHistoryRouter() {
  const routerStore = useRouterStore()
  const router = useRouter()
  const route = useRoute()

  /** 监听路由变化，自动添加到历史记录 */
  watch(route, () => {
    addView()
  })

  /** 组件挂载时添加当前路由 */
  onMounted(() => {
    addView()
  })

  /**
   * 添加当前路由到历史记录
   * 跳过布局容器路由（如 /home），只记录叶子页面
   */
  const addView = () => {
    if (route.name === 'home') return

    routerStore.addView({
      path: route.path,
      fullPath: route.fullPath,
      name: route.name as string,
      meta: route.meta,
      query: route.query,
    })
  }

  /**
   * 关闭 Tab
   * 如果关闭的是当前激活的 Tab，则跳转到最后一个 Tab
   * 如果没有其他 Tab 了，跳转到 /home（不带子路由）
   * @param view 要关闭的路由
   */
  function close(view: RouteLike) {
    if (view.path === route.path) {
      // 关闭的是当前页面，跳转到最后一个 Tab
      const latestView = routerStore.visitedViews.slice(-1)[0]
      if (latestView) {
        return router.push(latestView.fullPath)
      }
      // 没有其他 Tab 了，跳转到 /home（空白状态）
      return router.push('/home')
    }
  }

  return {
    visitedViews: routerStore.visitedViews,
    close,
  }
}
