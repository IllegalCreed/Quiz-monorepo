<template>
  <label
    :class="[
      'radio',
      {
        'radio--checked': checked,
        'radio--disabled': disabled || groupDisabled,
        'radio--invalid': invalid,
        'radio--correct': effectiveStatus === 'correct',
        'radio--incorrect': effectiveStatus === 'incorrect',
      },
    ]"
  >
    <input
      class="sr-only"
      type="radio"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled || groupDisabled"
      @change="onChange"
      aria-hidden="true"
    />
    <button
      type="button"
      ref="btn"
      :role="'radio'"
      :aria-checked="checked"
      :tabindex="tabindex"
      :data-value="String(value)"
      :disabled="disabled || groupDisabled"
      :class="[
        'radio__control',
        {
          'radio--correct': effectiveStatus === 'correct',
          'radio--incorrect': effectiveStatus === 'incorrect',
        },
      ]"
      @click="onActivate"
    >
      <span class="radio__dot" aria-hidden="true" />
    </button>
    <div class="radio__content">
      <div class="radio__label">{{ label }}</div>
      <div v-if="description" class="radio__desc">{{ description }}</div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, computed, watch } from "vue";
import type { PropType } from "vue";

// component name (multi-word) and v-model declaration
// defineOptions macro (handled by Vue compiler)
defineOptions({ name: "CheckRadio" });
// declare v-model type for standalone usage
// defineModel macro (handled by Vue compiler)
defineModel<string | number | null>();

interface RadioGroupContext {
  name: string;
  selected: { value: string | number | null };
  disabled: { value: boolean };
  register: (el: HTMLButtonElement) => void;
  unregister: (el: HTMLButtonElement) => void;
  setValue: (v: string | number) => void;
  getStatus: (v: string | number) => "none" | "correct" | "incorrect";
}

const props = defineProps({
  value: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },
  label: { type: String, default: "" },
  description: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  modelValue: { type: [String, Number] as PropType<string | number | null> },
  name: { type: String, default: "" },
  // optional controlled status (受控)
  status: {
    type: String as PropType<"none" | "correct" | "incorrect">,
    default: null,
  },
});
const emit = defineEmits(["update:modelValue"]);

const group = inject<RadioGroupContext | null>("radioGroup", null);
const internalSelected = ref(props.modelValue);
// standalone internal status; typically unused for quiz, but supports internal mode
const internalStatus = ref<"none" | "correct" | "incorrect">("none");

const checked = computed(() => {
  if (group) return group.selected.value === props.value;
  return internalSelected.value === props.value;
});

const effectiveStatus = computed<"none" | "correct" | "incorrect">(() => {
  if (props.status != null)
    return props.status as "none" | "correct" | "incorrect";
  if (group) return group.getStatus(props.value);
  return internalStatus.value;
});

const name = computed(() =>
  group
    ? group.name
    : props.name || `radio-${Math.random().toString(36).slice(2, 8)}`,
);
const groupDisabled = computed(() => (group ? group.disabled.value : false));

const btn = ref<HTMLElement | null>(null);
onMounted(() => {
  if (group && btn.value)
    group.register(btn.value as unknown as HTMLButtonElement);
});
onBeforeUnmount(() => {
  if (group && btn.value)
    group.unregister(btn.value as unknown as HTMLButtonElement);
});

function onActivate() {
  if (props.disabled || groupDisabled.value) return;
  if (group) group.setValue(props.value);
  else {
    emit("update:modelValue", props.value);
    internalSelected.value = props.value;
  }
}

function onChange() {
  // keep for native input compatibility
  onActivate();
}

const tabindex = computed(() => {
  if (group) {
    return checked.value ? 0 : -1;
  }
  return 0;
});

watch(
  () => props.modelValue,
  (v) => (internalSelected.value = v),
);
</script>

<style lang="scss" scoped>
@use "./check-radio.scss" as *;
</style>
