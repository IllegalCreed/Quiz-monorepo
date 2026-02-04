import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";
import { expect } from "storybook/test";

// 交互测试（Story 的 play 用例）

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
  play: async ({ canvas }) => {
    // 断言：分组渲染为四个单选控件
    const items = canvas.getAllByRole("button");
    expect(items).toHaveLength(4);
  },
};

export const GroupWithDesc: Story = {
  args: {
    modelValue: null,
    options: withDescOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：带描述",
  play: async ({ canvas }) => {
    // 断言：每个选项的描述文本存在
    expect(canvas.getByText("A 的补充描述")).toBeInTheDocument();
    expect(canvas.getByText("B 是正确答案的说明")).toBeInTheDocument();
  },
};

export const GroupSelectedCorrect: Story = {
  args: {
    modelValue: "b",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（正确）",
  play: async ({ canvas }) => {
    // 断言：正确选项应有正确状态的类名
    const label = canvas.getByText("选项 B");
    const radio = label.closest(".radio");
    expect(radio).toHaveClass("radio--correct");
  },
};

export const GroupSelectedIncorrect: Story = {
  args: {
    modelValue: "a",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选（错误）",
  play: async ({ canvas }) => {
    const label = canvas.getByText("选项 A");
    const radio = label.closest(".radio");
    expect(radio).toHaveClass("radio--incorrect");
  },
};

export const GroupDisabled: Story = {
  args: {
    modelValue: null,
    options: baseOptions,
    correctValue: "b",
    disabled: true,
  },
  name: "分组：禁用",
  play: async ({ canvas, userEvent }) => {
    const buttons = canvas.getAllByRole("button");
    // 验证所有按钮都被禁用
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
    // 尝试点击禁用的按钮（测试 disabled 分支）
    await userEvent.click(buttons[0]);
  },
};

export const GroupNoCorrectValue: Story = {
  args: {
    modelValue: null,
    options: baseOptions,
    correctValue: null,
    disabled: false,
  },
  name: "分组：无正确答案",
  play: async ({ canvas, userEvent }) => {
    // 点击选择一个选项
    const btn = canvas.getAllByRole("button")[0];
    await userEvent.click(btn);
    // 没有 correctValue 时，所有选项都不应有 correct/incorrect 样式
    const radios = canvas
      .getAllByRole("button")
      .map((b) => b.closest(".radio"));
    for (const radio of radios) {
      expect(radio).not.toHaveClass("radio--correct");
      expect(radio).not.toHaveClass("radio--incorrect");
    }
  },
};

export const GroupAlreadySelected: Story = {
  args: {
    modelValue: "a",
    options: baseOptions,
    correctValue: "b",
    disabled: false,
  },
  name: "分组：已选后再点击",
  play: async ({ canvas, userEvent }) => {
    // 已经选了 A，再点击 C，应该不会改变选择（单次答题模式）
    const btnC = canvas.getAllByRole("button")[2];
    await userEvent.click(btnC);
    // A 仍然是 incorrect（说明选择没变）
    const labelA = canvas.getByText("选项 A");
    const radioA = labelA.closest(".radio");
    expect(radioA).toHaveClass("radio--incorrect");
  },
};
