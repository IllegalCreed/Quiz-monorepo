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
      <!-- 描述区域：Spacer（占位）+ Content（绝对定位显示） -->
      <div
        class="radio__desc"
        :class="{ 'has-content': descHeight > 0 }"
        :style="{ '--desc-height': `${descHeight}px` }"
      >
        <!-- 占位元素：负责高度过渡 -->
        <div class="radio__desc-spacer"></div>

        <!-- 内容元素：绝对定位，负责内容显示和透明度过渡 -->
        <div class="radio__desc-content" ref="descContentRef">
          <slot name="description">{{ description }}</slot>
        </div>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, useSlots } from "vue";
/**
 * CheckRadio（哑组件）
 *
 * @remarks
 * - 仅负责展示状态并在被点击时发出 `select` 事件。
 * - 视觉由 `status` ("none" | "correct" | "incorrect") 决定。
 * - 不维护选中状态（`checked`），由父级（例如 `CheckRadioGroup`）通过 `status` 或 `v-model` 管理。
 * - 描述文字过渡：通过 JavaScript 获取实际高度，实现平滑的展开/收起动画。
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

// 获取 slots 对象用于运行时检测
const slots = useSlots();

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

// 根元素引用，便于父组件进行焦点管理
const rootEl = ref<HTMLElement | null>(null);

// 描述内容元素引用和高度状态（用于过渡动画）
const descContentRef = ref<HTMLElement | null>(null);
const descHeight = ref(0);

/**
 * 监听 description prop 和 slot 变化，计算并更新描述元素的实际高度
 *
 * @remarks
 * - 通过 scrollHeight 获取实际内容高度（包括换行）
 * - 使用 nextTick 确保 DOM 已更新
 * - 高度通过 CSS 变量 --desc-height 传递给样式
 */
watch(
  [() => props.description, () => !!slots.description],
  async () => {
    if ((props.description || slots.description) && descContentRef.value) {
      // 等待 DOM 更新后获取实际高度
      await nextTick();
      descHeight.value = descContentRef.value.scrollHeight;
    } else {
      descHeight.value = 0;
    }
  },
  { immediate: true },
);

// 暴露元素引用，便于父组件访问和测试
defineExpose({ rootEl, descContentRef });

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
