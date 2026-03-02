<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ThemeToggle } from "@quiz/ui";
import AuthDialog from "@/components/AuthDialog.vue";
import UserDropdown from "@/components/UserDropdown.vue";
import HistoryDrawer from "@/components/HistoryDrawer.vue";
import CategorySelector from "@/components/CategorySelector.vue";
import { useAuthDialog } from "@/composables/useAuthDialog";
import { useSse } from "@/composables/useSse";
import { useUserStore } from "@/stores/useUserStore";

const userStore = useUserStore();
const { openLogin } = useAuthDialog();
const { announcement, connect, disconnect, sendHeartbeat } = useSse();
const router = useRouter();

// ── SSE 连接管理 ──────────────────────────────────────
onMounted(() => {
  connect();
  sendHeartbeat(router.currentRoute.value.fullPath);
});

onUnmounted(() => {
  disconnect();
});

// 路由变更时上报当前页面
router.afterEach((to) => {
  sendHeartbeat(to.fullPath);
});
</script>

<template>
  <div id="app">
    <!-- 右上角浮动工具栏（透明底色） -->
    <div class="toolbar">
      <!-- 未登录：显示登录按钮 -->
      <button v-if="!userStore.isLoggedIn" class="toolbar__login-btn" @click="openLogin">
        登录
      </button>
      <!-- 已登录：显示用户下拉菜单 -->
      <UserDropdown v-else />
      <!-- 主题切换 -->
      <ThemeToggle />
    </div>

    <!-- 登录/注册对话框 -->
    <AuthDialog />
    <!-- 答题历史抽屉 -->
    <HistoryDrawer />
    <!-- 分类选择器对话框 -->
    <CategorySelector />

    <!-- 公告 toast（管理端广播推送） -->
    <Transition name="toast">
      <div v-if="announcement" class="announcement-toast">
        {{ announcement }}
      </div>
    </Transition>

    <main>
      <router-view />
    </main>

    <footer class="app-footer">
      <span>&copy; 2026 Quiz by </span>
      <a
        href="http://illegalscreed.cn/zh/"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link"
      >
        illegal
      </a>
    </footer>
  </div>
</template>

<style scoped lang="scss">
#app {
  @apply min-h-screen flex flex-col;
}

main {
  @apply flex-1 flex flex-col;

  // 让 router-view 撑满 main
  :deep(> *) {
    @apply flex-1 flex flex-col;
  }
}

.app-footer {
  @apply py-3 text-center;
  color: var(--quiz-ui-muted);
}

.footer-link {
  @apply inline-flex items-center gap-1 font-medium;
  color: var(--quiz-ui-primary);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--quiz-ui-primary-hover);
    text-decoration: underline;
  }

  &:focus-visible {
    @apply outline-none;
    text-decoration: underline;
  }
}

/* ── 公告 toast ────────────────────────────────────── */
.announcement-toast {
  @apply fixed top-4 left-1/2 z-50 px-5 py-3 rounded-lg text-sm font-medium;
  transform: translateX(-50%);
  background: var(--quiz-ui-primary);
  color: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.15);
  max-width: 90vw;
}

/* toast 过渡动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

/* ── 右上角浮动工具栏 ───────────────────────────────── */
.toolbar {
  @apply fixed top-4 right-4 z-40 flex items-center gap-2;

  &__login-btn {
    @apply px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer;
    background: transparent;
    border: 1px solid var(--quiz-ui-border);
    color: var(--quiz-ui-text);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--quiz-ui-control-bg);
      border-color: var(--quiz-ui-primary);
      color: var(--quiz-ui-primary);
    }

    &:focus-visible {
      @apply outline-none;
      box-shadow: 0 0 0 3px var(--quiz-ui-focus);
    }
  }
}
</style>
