<template>
  <!-- 深色模式切换按钮 -->
  <BaseButton
    variant="ghost"
    size="md"
    :class="props.class"
    @click="toggleDark()"
    :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
  >
    <i
      v-if="isDark"
      class="i-carbon-sun inline-block w-5 h-5 text-current"
      aria-hidden="true"
    />
    <i
      v-else
      class="i-carbon-moon inline-block w-5 h-5 text-current"
      aria-hidden="true"
    />
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from "./BaseButton.vue";

/**
 * ThemeToggle 组件
 *
 * @remarks
 * - 深色/浅色模式切换按钮
 * - 复用 BaseButton 组件（variant="ghost"）
 * - 使用 VueUse 的 useDark + useToggle 管理主题
 * - 图标：carbon:sun（浅色模式）/ carbon:moon（深色模式）
 * - useDark, useToggle 通过自动导入提供
 */
defineOptions({ name: "ThemeToggle" });

export interface ThemeToggleProps {
  /** 自定义类名（用于外部定位，如 fixed top-4 right-4） */
  class?: string;
}

const props = defineProps<ThemeToggleProps>();

// 使用 VueUse 的 useDark 自动管理深色模式
// - 自动添加/移除 <html> 的 .dark 类
// - 持久化到 localStorage（key: 'vueuse-color-scheme'）
// - 支持系统主题检测（prefers-color-scheme）
const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>
