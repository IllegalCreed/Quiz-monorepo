<template>
  <div
    class="radio-group"
    role="radiogroup"
    :aria-label="ariaLabel || name"
    @keydown="onKeydown"
  >
    <slot />
    <p v-if="answered" class="sr-only" aria-live="polite">{{ ariaMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, provide, computed } from "vue";
import type { PropType } from "vue";

// component name and v-model declaration
// defineOptions macro (handled by Vue compiler)
defineOptions({ name: "CheckRadioGroup" });
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
  // quiz behavior
  correctValue: {
    type: [String, Number] as PropType<string | number | null>,
    default: null,
  },
  disableAfterAnswer: { type: Boolean, default: true },
  allowRetry: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "answered"]);
const selected = ref(props.modelValue);

// reactive state containers must be declared before any immediate watchers
const radios = ref<HTMLButtonElement[]>([]);
const statuses = ref<Record<string, "none" | "correct" | "incorrect">>({});
const answered = ref(false);

watch(
  () => props.modelValue,
  (v) => (selected.value = v),
);
// keep v-model in sync
watch(selected, (v) => emit("update:modelValue", v));

// react to external changes to selected (including initial modelValue)
watch(
  selected,
  (v) => {
    // if cleared, reset statuses
    if (v == null) {
      statuses.value = {};
      answered.value = false;
      return;
    }

    // if a correctValue is provided, derive status for the current selection
    if (props.correctValue != null) {
      statuses.value = {};
      const key = String(v);
      const correct = String(props.correctValue);
      if (key === correct) {
        statuses.value[correct] = "correct";
      } else {
        statuses.value[key] = "incorrect";
        statuses.value[correct] = "correct";
      }
      answered.value = true;
      const index = radios.value.findIndex(
        (r) => r.getAttribute("data-value") === String(v),
      );
      emit("answered", {
        value: v,
        isCorrect: String(v) === String(props.correctValue),
        correctValue: props.correctValue,
        index,
      });
    }
  },
  { immediate: true },
);

function register(el: HTMLButtonElement) {
  if (!radios.value.includes(el)) radios.value.push(el);
}
function unregister(el: HTMLButtonElement) {
  radios.value = radios.value.filter((r) => r !== el);
}
function getStatus(v: string | number) {
  return (
    (statuses.value[String(v)] as "none" | "correct" | "incorrect") || "none"
  );
}
function reset() {
  statuses.value = {};
  answered.value = false;
}
function setValue(v: string | number) {
  if (props.disabled) return;
  if (answered.value && props.disableAfterAnswer) return;
  selected.value = v;

  // compute statuses
  statuses.value = {};
  const key = String(v);
  if (props.correctValue != null) {
    const correct = String(props.correctValue);
    if (key === correct) {
      statuses.value[correct] = "correct";
    } else {
      statuses.value[key] = "incorrect";
      statuses.value[correct] = "correct";
    }
  }

  answered.value = true;

  const index = radios.value.findIndex(
    (r) => r.getAttribute("data-value") === String(v),
  );
  emit("answered", {
    value: v,
    isCorrect:
      props.correctValue != null && String(v) === String(props.correctValue),
    correctValue: props.correctValue,
    index,
  });
}

const ariaMessage = computed(() => {
  if (!answered.value) return "";
  const v = selected.value;
  const isCorrect =
    props.correctValue != null && String(v) === String(props.correctValue);
  if (isCorrect) return "Correct answer selected.";
  return `Incorrect. Correct answer is ${props.correctValue}`;
});

provide("radioGroup", {
  name: props.name,
  selected,
  disabled: computed(() => props.disabled),
  register,
  unregister,
  setValue,
  getStatus,
  reset,
  answered,
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
@use "./check-radio.scss" as *;
.radio-group {
  @apply flex flex-col gap-2;
}
</style>
