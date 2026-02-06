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

    <footer class="app-footer">&copy; Quiz</footer>
  </div>
</template>

<style scoped lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 24px;
}

.app-footer {
  padding: 12px;
  text-align: center;
  color: var(--quiz-ui-muted);
}
</style>
