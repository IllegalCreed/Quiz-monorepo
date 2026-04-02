<template>
  <!-- 对话框 / 抽屉组件 -->
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="dialog-fade">
      <div
        v-if="modelValue"
        :class="['dialog-overlay', `dialog-overlay--${placement}`]"
        @click.self="onOverlayClick"
      >
        <!-- 面板 -->
        <Transition
          :name="panelTransition"
          @after-enter="onOpened"
          @after-leave="onClosed"
        >
          <div
            v-if="modelValue"
            ref="panelRef"
            :class="['dialog', `dialog--${placement}`]"
            :style="{ width }"
            role="dialog"
            tabindex="-1"
            aria-modal="true"
            :aria-label="title || '对话框'"
          >
            <!-- Header：有 title 或 header slot 时渲染 -->
            <div v-if="title || $slots.header" class="dialog__header">
              <slot name="header">
                <h2 class="dialog__title">{{ title }}</h2>
              </slot>
              <button
                v-if="closable"
                class="dialog__close"
                aria-label="关闭"
                @click="close"
              >
                <i class="i-carbon-close w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <!-- Body（主体内容） -->
            <div class="dialog__body" tabindex="0">
              <slot />
            </div>

            <!-- Footer：有 footer slot 时渲染 -->
            <div v-if="$slots.footer" class="dialog__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, type PropType } from "vue";

/**
 * BaseDialog 组件
 *
 * @remarks
 * - 支持三种 placement：center（居中对话框）、right（右侧抽屉）、left（左侧抽屉）
 * - 共享遮罩、滚动锁定、Esc 关闭、基础焦点管理
 * - 使用 BEM 命名规范，Teleport 到 body 避免 z-index 层叠问题
 */
defineOptions({ name: "BaseDialog" });

/**
 * Slot 类型声明
 */
defineSlots<{
  /** 替代 title prop 的自定义 header */
  header?: () => unknown;
  /** 主体内容 */
  default?: () => unknown;
  /** 底部操作区 */
  footer?: () => unknown;
}>();

/**
 * BaseDialog Props 类型
 */
export interface BaseDialogProps {
  /** 控制显示/隐藏 */
  modelValue: boolean;
  /** 标题文字（不传则不渲染 header） */
  title?: string;
  /** 布局模式：center 居中对话框、right/left 侧边抽屉 */
  placement?: "center" | "right" | "left";
  /** 是否显示遮罩层 */
  overlay?: boolean;
  /** 点击遮罩层是否关闭 */
  closeOnOverlay?: boolean;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 面板宽度 */
  width?: string;
  /** Esc 键是否关闭 */
  closeOnEsc?: boolean;
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  placement: {
    type: String as PropType<"center" | "right" | "left">,
    default: "center",
  },
  overlay: {
    type: Boolean,
    default: true,
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  closable: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "28rem",
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  /** 更新 v-model */
  "update:modelValue": [value: boolean];
  /** 关闭动画结束后触发 */
  close: [];
  /** 打开动画结束后触发 */
  opened: [];
}>();

/** 面板 DOM 引用 */
const panelRef = ref<HTMLElement>();

/** 面板过渡动画名称（根据 placement 决定） */
const panelTransition = computed(() => `dialog-${props.placement}`);

/**
 * 关闭对话框
 */
function close() {
  emit("update:modelValue", false);
}

/**
 * 遮罩点击处理
 */
function onOverlayClick() {
  if (props.closeOnOverlay) {
    close();
  }
}

/**
 * 打开动画结束后：聚焦面板并触发 opened 事件
 */
function onOpened() {
  emit("opened");
}

/**
 * 关闭动画结束后：触发 close 事件
 */
function onClosed() {
  emit("close");
}

/**
 * Esc 键监听
 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.closeOnEsc) {
    close();
  }
}

/**
 * 滚动锁定管理
 *
 * @remarks
 * 打开时给 body 添加 overflow:hidden 阻止背景滚动，
 * 关闭时恢复原始 overflow 值。
 */
let originalOverflow = "";

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      // 锁定滚动
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // 监听 Esc
      document.addEventListener("keydown", onKeydown);
      void nextTick(() => {
        panelRef.value?.focus();
      });
    } else {
      // 恢复滚动
      document.body.style.overflow = originalOverflow;
      // 移除 Esc 监听
      document.removeEventListener("keydown", onKeydown);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
@use "./dialog.scss" as *;
</style>
