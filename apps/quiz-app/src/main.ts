import { createApp } from "vue";
import { createPinia } from "pinia";
import "virtual:uno.css";
// 包级样式（确保组件样式可用）
import "@quiz/ui/style.css";

import App from "./App.vue";
import router from "./router";
import { setOn401Handler } from "./utils/request";
import { useUserStore } from "./stores/useUserStore";
import { useAuthDialog } from "./composables/useAuthDialog";
import { useCategories } from "./composables/useCategories";
import { installQuizAnalytics } from "./analytics/installAnalytics";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// ── 注册 401 回调（token 过期时清空登录状态并打开登录框） ──
const userStore = useUserStore();
const { openLogin } = useAuthDialog();

setOn401Handler(() => {
  userStore.logout();
  useCategories().clearSelection();
  openLogin();
});

// ── 启动时恢复登录状态（分类偏好由页面初始化阶段负责加载） ──
void userStore.fetchUserInfo();

app.mount("#app");

// ── 可选访问统计：未明确允许时不加载任何供应商脚本 ──
installQuizAnalytics({
  enabled: import.meta.env.PROD,
  window,
  document,
  navigator,
  router,
});
