<template>
  <!-- 外层 label 包裹整个单选按钮，方便点击任意位置都能触发 select -->
  <label
    ref="rootEl"
    :class="[
      'radio',
      {
        'radio--disabled': disabled, // 仅由 prop 控制的禁用样式
        'radio--correct': (props.status ?? 'none') === 'correct',
        'radio--incorrect': (props.status ?? 'none') === 'incorrect',
      },
    ]"
  >
    <!-- 视觉按钮：职责单一，点击只发出 select 事件 -->
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'radio__control',
        {
          'radio--correct': (props.status ?? 'none') === 'correct',
          'radio--incorrect': (props.status ?? 'none') === 'incorrect',
        },
      ]"
      @click="onActivate"
    >
      <span class="radio__dot" aria-hidden="true" />
    </button>

    <!-- 单选按钮的文本内容区域 -->
    <div class="radio__content">
      <div class="radio__label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="$slots.description || description" class="radio__desc">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { ref } from "vue";
/**
 * CheckRadio（哑组件）
 *
 * @remarks
 * - 仅负责展示状态并在被点击时发出 `select` 事件。
 * - 视觉由 `status` ("none" | "correct" | "incorrect") 决定。
 * - 不维护选中状态（`checked`），由父级（例如 `CheckRadioGroup`）通过 `status` 或 `v-model` 管理。
 */
defineOptions({ name: "CheckRadio" });

/**
 * Slot 类型声明（支持自定义 label 和 description 内容）
 */
defineSlots<{
  /** 自定义标签内容 */
  label?: () => unknown;
  /** 自定义描述内容 */
  description?: () => unknown;
}>();

const emit = defineEmits<{ (e: "select", v: string | number): void }>();

export interface CheckRadioProps {
  /** 选项的唯一标识值（必填）。 */
  value: string | number;
  /** 用于显示的主标签文本。 */
  label?: string;
  /** 可选的描述文本，显示在标签下方。 */
  description?: string;
  /** 是否禁用当前选项，禁用时不响应点击。 */
  disabled?: boolean;
  /** 答题/展示状态：'none' | 'correct' | 'incorrect'（默认为 'none'）。 */
  status?: "none" | "correct" | "incorrect" | null;
}
const props = withDefaults(defineProps<CheckRadioProps>(), {
  label: "",
  description: "",
  disabled: false,
  status: "none",
});

// 暴露根元素引用，便于父组件进行焦点管理
const rootEl = ref<HTMLElement | null>(null);
defineExpose({ rootEl });

/**
 * 响应用户点击，发出 `select` 事件。
 *
 * @remarks
 * - 不在组件内部维护选中状态；由上层（例如 `CheckRadioGroup`）监听该事件并更新 `v-model`。
 * - 禁用状态由 `<button disabled>` 原生属性控制，点击时不会触发此函数。
 *
 * @emits select - 负载为被点击选项的 `value`
 */
function onActivate() {
  emit("select", props.value);
}
</script>

<style lang="scss" scoped>
@use "./check-radio.scss" as *;
</style>
