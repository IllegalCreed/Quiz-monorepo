<template>
  <div
    class="radio-group"
    role="radiogroup"
    :aria-label="ariaLabel || name"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, provide, computed } from "vue";
import type { PropType } from "vue";

// component name and v-model declaration
// defineOptions macro (handled by Vue compiler)
defineOptions({ name: "QuizRadioGroup" });
// declare v-model type (Vue 3.5 defineModel macro)
// defineModel macro (handled by Vue compiler)
defineModel<string | number | null>();

const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  },
  name: {
    type: String,
    default: () => `radio-${Math.random().toString(36).slice(2, 8)}`,
  },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
const selected = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (selected.value = v),
);
watch(selected, (v) => emit("update:modelValue", v));

const radios = ref<HTMLButtonElement[]>([]);

function register(el: HTMLButtonElement) {
  if (!radios.value.includes(el)) radios.value.push(el);
}
function unregister(el: HTMLButtonElement) {
  radios.value = radios.value.filter((r) => r !== el);
}
function setValue(v: string | number) {
  if (props.disabled) return;
  selected.value = v;
}

provide("radioGroup", {
  name: props.name,
  selected,
  disabled: computed(() => props.disabled),
  register,
  unregister,
  setValue,
});

function onKeydown(e: KeyboardEvent) {
  const keys = [
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    "ArrowUp",
    "Home",
    "End",
    " ",
    "Enter",
  ];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  const enabled = radios.value.filter(
    (r) => !(r as HTMLButtonElement).hasAttribute("disabled"),
  );
  if (!enabled.length) return;
  let index = enabled.indexOf(document.activeElement as HTMLButtonElement);
  // if nothing focused, fall back to the currently selected value
  if (index === -1 && selected.value != null) {
    const sel = String(selected.value);
    index = enabled.findIndex((r) => r.getAttribute("data-value") === sel);
  }

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    const next = enabled[(index + 1) % enabled.length];
    next?.focus();
    next?.click();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    const prev = enabled[(index - 1 + enabled.length) % enabled.length];
    prev?.focus();
    prev?.click();
  } else if (e.key === "Home") {
    const first = enabled[0];
    if (first) {
      first.focus();
      first.click();
    }
  } else if (e.key === "End") {
    const last = enabled[enabled.length - 1];
    if (last) {
      last.focus();
      last.click();
    }
  } else if (e.key === " " || e.key === "Enter") {
    (document.activeElement as HTMLButtonElement)?.click();
  }
}
</script>

<style lang="scss" scoped>
@use "./radio.scss" as *;
.radio-group {
  @apply flex flex-col gap-2;
}
</style>
