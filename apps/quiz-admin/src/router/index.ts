/**
 * 路由主文件 + 守卫
 * 实现登录验证和动态路由加载
 */
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/login/login-view.vue";
import HomeView from "@/views/master/home/home-view.vue";
import { useToken } from "@/composables/use-token";
import { useAccountStore } from "@/stores/modules/account";
import { updateHomeRoutes } from "./dynamic-routes";

/** 创建路由实例 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { title: "登录" },
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
      meta: { title: "首页", requiresAuth: true },
      children: [
        // 兜底路由：承接未注册路径，避免 Vue Router "No match found" 警告
        // 使用空组件而非 redirect，避免路由初始化时 dashboard 也未注册导致无限循环
        { path: ":pathMatch(.*)*", name: "__fallback__", component: { template: "<div></div>" } },
      ],
    },
  ],
});

/**
 * 路由守卫
 * 验证登录状态 + 动态加载路由 + 权限检查
 * 使用 return 语法（Vue Router 4 推荐，替代 next() 回调）
 */
router.beforeEach(async (to) => {
  const { token, needToRefreshRouter } = useToken();
  const accountStore = useAccountStore();

  // 1. 如果访问登录页,直接放行
  if (to.path === "/login") {
    return true;
  }

  // 2. 未登录,跳转登录页
  if (!token.value) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  // 3. 已登录,检查是否需要刷新路由（首次加载或 token 刷新后）
  if (needToRefreshRouter.value) {
    try {
      // 先设置为 false,避免死循环
      needToRefreshRouter.value = false;

      // 加载用户信息
      const userInfo = await accountStore.getInfo();

      // 根据权限动态更新路由
      updateHomeRoutes(router, userInfo.menuPermissions);

      // 重新导航到目标路由（确保动态路由已生效）
      return { ...to, replace: true };
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 清除 token 并跳转登录页
      token.value = null;
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }

  // 4. 若命中兜底路由，说明该路径无权访问或不存在（此时动态路由已注册）
  if (to.matched.some((r) => r.name === "__fallback__")) {
    return { path: "/home/dashboard", replace: true };
  }

  // 5. 正常放行
  return true;
});

export default router;
