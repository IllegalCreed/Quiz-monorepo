<template>
  <!-- 输入框组件 -->
  <div :class="rootClass">
    <!-- Label -->
    <label v-if="label" class="input__label" :for="inputId">
      {{ label }}
    </label>

    <!-- 输入框容器 -->
    <div class="input__wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        class="input__field"
        :type="currentType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        v-bind="{ ...$attrs, class: undefined }"
        @input="onInput"
      />

      <!-- 密码可见切换 -->
      <button
        v-if="type === 'password'"
        type="button"
        class="input__toggle"
        :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
        tabindex="-1"
        @click="togglePassword"
      >
        <i
          :class="[
            passwordVisible ? 'i-carbon-view-off' : 'i-carbon-view',
            'w-4.5 h-4.5',
          ]"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- 错误提示 -->
    <span v-if="error" class="input__error" role="alert">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from "vue";

/**
 * BaseInput 组件
 *
 * @remarks
 * - 表单场景标准化输入框，支持 label、error 状态、password 可见切换
 * - 提供三种尺寸：sm、md、lg
 * - 使用 BEM 命名规范，label 通过 for 关联 input
 */
defineOptions({ name: "BaseInput", inheritAttrs: false });

/**
 * BaseInput Props 类型
 */
export interface BaseInputProps {
  /** 输入值 */
  modelValue?: string;
  /** 输入类型 */
  type?: "text" | "password" | "email";
  /** 占位文字 */
  placeholder?: string;
  /** 标签 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: "md" | "sm" | "lg";
}

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String as PropType<"text" | "password" | "email">,
    default: "text",
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: undefined,
  },
  error: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<"md" | "sm" | "lg">,
    default: "md",
  },
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

/** 输入框 DOM 引用 */
const inputRef = ref<HTMLInputElement>();

/** 密码可见状态 */
const passwordVisible = ref(false);

/** 生成唯一 id（label → input 关联） */
let idCounter = 0;
const inputId = `base-input-${++idCounter}`;

/**
 * 根容器类名（BEM 修饰符）
 */
const rootClass = computed(() => [
  "input",
  `input--${props.size}`,
  {
    "input--error": !!props.error,
    "input--disabled": props.disabled,
  },
]);

/**
 * 当前 input type（密码切换时在 password / text 之间切换）
 */
const currentType = computed(() => {
  if (props.type === "password" && passwordVisible.value) {
    return "text";
  }
  return props.type;
});

/**
 * 输入事件处理
 */
function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

/**
 * 切换密码可见
 */
function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

/** 暴露 inputRef 供外部聚焦 */
defineExpose({ inputRef });
</script>

<style lang="scss" scoped>
@use "./input.scss" as *;
</style>
