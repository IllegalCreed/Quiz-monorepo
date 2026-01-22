import CheckRadioGroup from "../components/CheckRadioGroup.vue";

export default {
  title: "组件/单选/CheckRadioGroup",
  component: CheckRadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "CheckRadioGroup — 数据驱动的单选组，通过 `options` 渲染多个 `CheckRadio`，支持 v-model 与 correctValue 显示。",
      },
    },
  },
};

const baseOptions = [
  { value: "a", label: "选项 A" },
  { value: "b", label: "选项 B" },
  { value: "c", label: "选项 C" },
  { value: "d", label: "选项 D" },
];

const withDescOptions = [
  { value: "a", label: "选项 A", description: "A 的补充描述" },
  { value: "b", label: "选项 B", description: "B 是正确答案的说明" },
  { value: "c", label: "选项 C", description: "C 的附加信息" },
  { value: "d", label: "选项 D", description: "D 的简短提示" },
];

export const GroupUnselected = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadioGroup },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadioGroup v-model="args.modelValue" :options="args.options" :correctValue="args.correctValue" :disabled="args.disabled"/></div>`,
  }),
  args: {
    modelValue: null,
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：未选择",
};

export const GroupWithDesc = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadioGroup },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadioGroup v-model="args.modelValue" :options="args.options" :correctValue="args.correctValue" :disabled="args.disabled"/></div>`,
  }),
  args: {
    modelValue: null,
    options: withDescOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：带描述",
};

export const GroupSelectedCorrect = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadioGroup },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadioGroup v-model="args.modelValue" :options="args.options" :correctValue="args.correctValue" :disabled="args.disabled"/></div>`,
  }),
  args: {
    modelValue: "b",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（正确）",
};

export const GroupSelectedIncorrect = {
  render: (args: Record<string, unknown>) => ({
    components: { CheckRadioGroup },
    setup() {
      return { args };
    },
    template: `<div style="padding:12px"><CheckRadioGroup v-model="args.modelValue" :options="args.options" :correctValue="args.correctValue" :disabled="args.disabled"/></div>`,
  }),
  args: {
    modelValue: "a",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（错误）",
};
