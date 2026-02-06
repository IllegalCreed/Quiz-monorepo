<template>
  <!-- 按钮组件 -->
  <button
    :type="type"
    :disabled="disabled"
    :class="[buttonClass, $attrs.class]"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";

/**
 * BaseButton 组件
 *
 * @remarks
 * - 提供三种变体：default（主按钮）、outline（次要按钮）、ghost（幽灵按钮）
 * - 提供三种尺寸：default、sm、lg
 * - 使用 BEM 命名规范，无需额外依赖（如 CVA）
 */
defineOptions({ name: "BaseButton", inheritAttrs: false });

/**
 * Slot 类型声明（按钮内容）
 */
defineSlots<{
  /** 按钮内容（文本、图标等） */
  default?: () => unknown;
}>();

/**
 * BaseButton Props 类型
 */
export interface BaseButtonProps {
  /** 按钮变体 */
  variant?: "default" | "outline" | "ghost";
  /** 按钮尺寸 */
  size?: "md" | "sm" | "lg";
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮类型 */
  type?: "button" | "submit" | "reset";
}

// 使用运行时 props 声明 + PropType 确保类型信息完整
const props = defineProps({
  variant: {
    type: String as PropType<"default" | "outline" | "ghost">,
    default: "default",
  },
  size: {
    type: String as PropType<"md" | "sm" | "lg">,
    default: "md",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<"button" | "submit" | "reset">,
    default: "button",
  },
});

/**
 * 计算按钮类名（BEM 命名规范）
 *
 * @remarks
 * 使用简单的数组拼接，不引入 CVA 等额外依赖
 */
const buttonClass = computed(() => [
  "btn",
  `btn--${props.variant}`,
  `btn--${props.size}`,
]);
</script>

<style lang="scss" scoped>
@use "./button.scss" as *;
</style>
