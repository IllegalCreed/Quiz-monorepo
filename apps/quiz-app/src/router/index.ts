import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "quiz",
      component: () => import("@/pages/QuizPage.vue"),
      meta: { title: "IllegalCreed Quiz · 开发者技术问答" },
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("@/pages/PrivacyPage.vue"),
      meta: { title: "隐私政策 · IllegalCreed Quiz" },
    },
  ],
});

/** 保持页面标题与当前路由一致，确保统计只读取公开标题。 */
router.afterEach((to) => {
  document.title = String(to.meta.title ?? "IllegalCreed Quiz · 开发者技术问答");
});

export default router;
