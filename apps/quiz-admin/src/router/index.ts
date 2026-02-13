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
      children: [], // 子路由将动态添加
    },
  ],
});

/**
 * 路由守卫
 * 验证登录状态 + 动态加载路由 + 权限检查
 */
router.beforeEach(async (to, from, next) => {
  const { token, needToRefreshRouter } = useToken();
  const accountStore = useAccountStore();

  // 1. 如果访问登录页,直接放行
  if (to.path === "/login") {
    next();
    return;
  }

  // 2. 未登录,跳转登录页
  if (!token.value) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  // 3. 已登录,检查是否需要刷新路由
  if (needToRefreshRouter.value) {
    try {
      // 先设置为 false,避免死循环
      needToRefreshRouter.value = false;

      // 加载用户信息
      const userInfo = await accountStore.getInfo();

      // 根据权限动态更新路由
      updateHomeRoutes(router, userInfo.menuPermissions);

      // 重新导航到目标路由（确保动态路由已生效）
      next({ ...to, replace: true });
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 清除 token 并跳转登录页
      token.value = null;
      next({ path: "/login", query: { redirect: to.fullPath } });
    }
    return;
  }

  // 4. 权限检查：验证用户是否有权访问该路由
  if (to.matched.length === 0) {
    // 路由不存在（可能因为无权限未添加），重定向到首页
    console.warn(`路由 ${to.path} 不存在或无权限访问`);
    next({ path: "/home/dashboard", replace: true });
    return;
  }

  // 5. 正常放行
  next();
});

export default router;
