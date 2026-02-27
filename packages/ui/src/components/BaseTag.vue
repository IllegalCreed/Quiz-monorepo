<template>
  <!-- 标签组件 -->
  <span
    :class="[tagClass, $attrs.class]"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <!-- 可关闭按钮 -->
    <span
      v-if="removable"
      class="tag__remove"
      role="button"
      aria-label="移除"
      @click.stop="$emit('remove')"
      >×</span
    >
  </span>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import type { TagColor } from "./tag-utils";

/**
 * BaseTag 组件
 *
 * @remarks
 * - 提供三种尺寸：sm（题目标签）、md（ColumnSelector 已选）、lg（醒目标签）
 * - 支持 6 种颜色变体 + 默认色
 * - 支持 removable 模式显示关闭按钮
 * - 使用 BEM 命名规范
 */
defineOptions({ name: "BaseTag", inheritAttrs: false });

/** Slot 类型声明 */
defineSlots<{
  /** 标签内容文本 */
  default?: () => unknown;
}>();

/**
 * BaseTag Props 类型
 */
export interface BaseTagProps {
  /** 标签尺寸 */
  size?: "sm" | "md" | "lg";
  /** 颜色变体（default 使用主题默认色） */
  color?: TagColor;
  /** 是否可关闭 */
  removable?: boolean;
}

const props = defineProps({
  size: {
    type: String as PropType<"sm" | "md" | "lg">,
    default: "md",
  },
  color: {
    type: String as PropType<TagColor>,
    default: "default",
  },
  removable: {
    type: Boolean,
    default: false,
  },
});

defineEmits<{
  /** 点击关闭按钮时触发 */
  (e: "remove"): void;
}>();

/**
 * 计算标签类名（BEM 命名规范）
 */
const tagClass = computed(() => [
  "tag",
  `tag--${props.size}`,
  props.color !== "default" ? `tag--${props.color}` : "",
]);
</script>

<style lang="scss" scoped>
@use "./tag.scss" as *;
</style>
