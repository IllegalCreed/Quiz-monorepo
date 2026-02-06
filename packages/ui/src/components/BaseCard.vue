<template>
  <!-- 卡片根容器 -->
  <div class="card">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * BaseCard 组件
 *
 * @remarks
 * - 卡片根容器，采用 border-based 设计（移除 shadow）
 * - 通常与 BaseCardHeader、BaseCardContent 组合使用
 * - 参考 shadcn 简洁风格
 */
defineOptions({ name: "BaseCard" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 卡片内容（通常包含 BaseCardHeader、BaseCardContent 等子组件） */
  default?: () => unknown;
}>();
</script>

<style lang="scss" scoped>
@use "./card.scss" as *;
</style>
