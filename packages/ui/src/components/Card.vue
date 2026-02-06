<template>
  <!-- 卡片根容器 -->
  <div class="card">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * Card 组件
 *
 * @remarks
 * - 卡片根容器，采用 border-based 设计（移除 shadow）
 * - 通常与 CardHeader、CardContent 组合使用
 * - 参考 shadcn 简洁风格
 */
defineOptions({ name: "Card" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 卡片内容（通常包含 CardHeader、CardContent 等子组件） */
  default?: () => unknown;
}>();
</script>

<style lang="scss" scoped>
@use "./card.scss" as *;
</style>
