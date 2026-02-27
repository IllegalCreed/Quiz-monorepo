<template>
  <!-- 弹出面板组件 -->
  <div ref="popoverRef" class="popover">
    <!-- Trigger 触发区域 -->
    <div class="popover__trigger" @click="toggle">
      <slot name="trigger" />
    </div>

    <!-- Content 弹出内容 -->
    <Transition name="popover-fade">
      <div
        v-if="visible"
        :class="['popover__content', `popover__content--${placement}`]"
        :style="{
          marginTop: offsetStyle.top,
          marginBottom: offsetStyle.bottom,
        }"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, type PropType } from "vue";

/**
 * BasePopover 组件
 *
 * @remarks
 * - 通用定位弹出面板，适用于 UserDropdown 等场景
 * - 点击 trigger 切换显示，点击外部或按 Esc 关闭
 * - 使用 CSS 绝对定位（相对于 trigger 父容器）
 */
defineOptions({ name: "BasePopover" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 触发弹出的元素 */
  trigger?: () => unknown;
  /** 弹出内容 */
  default?: () => unknown;
}>();

/**
 * BasePopover Props 类型
 */
export interface BasePopoverProps {
  /** 弹出方向 */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** 与触发元素的间距(px) */
  offset?: number;
}

const props = defineProps({
  placement: {
    type: String as PropType<
      "bottom-start" | "bottom-end" | "top-start" | "top-end"
    >,
    default: "bottom-end",
  },
  offset: {
    type: Number,
    default: 4,
  },
});

/** 弹出面板可见状态 */
const visible = ref(false);

/** 组件根元素引用 */
const popoverRef = ref<HTMLElement>();

/**
 * 根据 placement 计算 margin 偏移
 */
const offsetStyle = computed(() => {
  const isTop = props.placement.startsWith("top");
  return {
    top: isTop ? undefined : `${props.offset}px`,
    bottom: isTop ? `${props.offset}px` : undefined,
  };
});

/**
 * 切换弹出面板显示
 */
function toggle() {
  visible.value = !visible.value;
}

/**
 * 关闭弹出面板
 */
function close() {
  visible.value = false;
}

/**
 * 点击外部关闭处理
 */
function onClickOutside(e: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    close();
  }
}

/**
 * Esc 键关闭
 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    close();
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onKeydown);
});

/** 暴露 visible 和 close 供外部控制 */
defineExpose({ visible, close });
</script>

<style lang="scss" scoped>
@use "./popover.scss" as *;
</style>
