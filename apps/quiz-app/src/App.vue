<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";

const { isDark, toggleDark } = useTheme();
</script>

<template>
  <div id="app">
    <!-- 主题切换按钮 - 固定在右上角 -->
    <button
      class="theme-toggle"
      @click="toggleDark()"
      :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
      :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
    >
      <i v-if="isDark" class="i-carbon-sun w-5 h-5" aria-hidden="true" />
      <i v-else class="i-carbon-moon w-5 h-5" aria-hidden="true" />
    </button>

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

.theme-toggle {
  // 固定在右上角
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;

  @apply p-2 rounded-lg flex items-center justify-center cursor-pointer;

  background-color: var(--quiz-ui-control-bg);
  border: 1px solid var(--quiz-ui-border);
  color: var(--quiz-ui-text);
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    background-color: var(--quiz-ui-primary);
    color: white;
    border-color: var(--quiz-ui-primary);
    // 移除 scale 变化
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--quiz-ui-focus);
  }

  &:active i {
    transform: rotate(180deg);
  }

  i {
    transition: transform 0.3s ease;
  }
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

/* 响应式：移动端 */
@media (max-width: 640px) {
  .theme-toggle {
    top: 0.75rem;
    right: 0.75rem;
    @apply p-1.5;

    i {
      @apply w-4 h-4;
    }
  }
}
</style>
