<template>
  <div class="radio-group">
    <CheckRadio
      v-for="opt in options"
      :key="String(opt.value)"
      :value="opt.value"
      :label="opt.label"
      :description="opt.description"
      :status="computeStatus(opt.value)"
      :disabled="disabled"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import CheckRadio from "./CheckRadio.vue";

/**
 * CheckRadioGroup - 数据驱动的单选组组件。
 *
 * @remarks
 * - 使用 data-driven 的 API：通过 `options` prop 提供选项数组并由组件内渲染 `CheckRadio` 列表。
 * - 通过 `defineModel` 暴露 `v-model`：读写 `selected.value` 即为获取/设置当前选中项。
 * - 当传入 `correctValue` 且 `selected` 有值时，会在子项上显示正确/错误样式（只读展示）。
 * - 组件为“单次答题”模式：一旦 `selected` 非 null，后续点击不会改变选择（除非外部将 `v-model` 清空为 null）。
 *
 * @example
 * <CheckRadioGroup v-model="value" :options="[{value:'a',label:'A'},{value:'b',label:'B'}]" :correctValue="'b'" />
 *
 * @emits update:modelValue - v-model 自动同步（由 `defineModel` 管理）。
 */

/** 单个选项的描述对象 */
export interface Option {
  /** 选项的唯一标识（必填）。 */
  value: string | number;
  /** 选项的展示文本（可选）。 */
  label?: string;
  /** 选项的附加描述（可选）。 */
  description?: string;
}

/**
 * Props for CheckRadioGroup
 */
export interface GroupProps {
  /** 要渲染的选项数组，顺序即为展示顺序。 */
  options: Option[];
  /** 可选的正确答案值（用于展示正确/错误样式）。 */
  correctValue?: string | number | null;
  /** 若为 true，则禁用整个组的交互。 */
  disabled?: boolean;
}
const props = defineProps<GroupProps>();
// 组件名称
defineOptions({ name: "CheckRadioGroup" });

// 使用 defineModel 管理选中的值
const selected = defineModel<string | number | null>();

/**
 * 计算给定选项的显示状态（用于子 `CheckRadio` 的 `status` prop）。
 *
 * 规则：
 * - 若没有传入 `correctValue` 或尚未选中（`selected.value == null`），返回 `'none'`。
 * - 若选项值等于 `correctValue`，返回 `'correct'`。
 * - 若选项值等于当前 `selected.value`（且不等于 correct），返回 `'incorrect'`。
 *
 * @param v - 要计算状态的选项值
 * @returns {'none'|'correct'|'incorrect'}
 */
function computeStatus(v: string | number) {
  if (props.correctValue == null || selected.value == null)
    return "none" as const;
  const key = String(v);
  const correct = String(props.correctValue);
  if (key === correct) return "correct" as const;
  if (String(selected.value) === key) return "incorrect" as const;
  return "none" as const;
}

/**
 * 处理子项的选择事件。
 *
 * 行为说明：
 * - 若 `props.disabled` 为 true 或 `selected` 已有值（单次答题模式），则忽略该选择。
 * - 否则更新 `selected.value`（`defineModel` 会同步 v-model）。
 *
 * @param v - 被选择的选项值
 */
function onSelect(v: string | number) {
  if (props.disabled || selected.value !== null) return;
  selected.value = v;
}
</script>

<style lang="scss" scoped>
.radio-group {
  @apply flex flex-col gap-2;
}
</style>
