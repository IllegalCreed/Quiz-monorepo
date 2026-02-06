<template>
  <!-- 卡片内容区 -->
  <div class="card-content">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * CardContent 组件
 *
 * @remarks
 * - 卡片内容区，简单容器
 * - 默认无特殊样式，用于包裹主要内容
 */
defineOptions({ name: "CardContent" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 内容区域（任意内容） */
  default?: () => unknown;
}>();
</script>

<style lang="scss" scoped>
@use "./card.scss" as *;
</style>
