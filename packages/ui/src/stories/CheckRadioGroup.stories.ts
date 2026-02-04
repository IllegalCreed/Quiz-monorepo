import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";

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

const meta = {
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
  decorators: [
    () => ({ template: '<div style="padding:12px"><story /></div>' }),
  ],
} satisfies Meta<typeof CheckRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupUnselected: Story = {
  args: {
    modelValue: null,
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：未选择",
};

export const GroupWithDesc: Story = {
  args: {
    modelValue: null,
    options: withDescOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：带描述",
};

export const GroupSelectedCorrect: Story = {
  args: {
    modelValue: "b",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（正确）",
};

export const GroupSelectedIncorrect: Story = {
  args: {
    modelValue: "a",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（错误）",
};
