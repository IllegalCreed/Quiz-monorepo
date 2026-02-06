<template>
  <!-- 卡片头部 -->
  <div :class="['card-header', { 'card-header--divided': divided }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * CardHeader 组件
 *
 * @remarks
 * - 卡片头部，通常包含标题
 * - 支持 `divided` prop 显示底部虚线分割
 */
defineOptions({ name: "CardHeader" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 头部内容（通常是标题文本或自定义内容） */
  default?: () => unknown;
}>();

export interface CardHeaderProps {
  /** 是否显示底部虚线分割 */
  divided?: boolean;
}

withDefaults(defineProps<CardHeaderProps>(), {
  divided: false,
});
</script>

<style lang="scss" scoped>
@use "./card.scss" as *;
</style>
