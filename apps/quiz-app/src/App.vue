<script setup lang="ts">
import { ThemeToggle } from "@quiz/ui";
</script>

<template>
  <div id="app">
    <!-- 主题切换按钮 - 固定在右上角 -->
    <ThemeToggle class="fixed top-4 right-4 z-100" />

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
</style>
