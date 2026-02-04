import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CheckRadio from "../components/CheckRadio.vue";
import { expect } from "storybook/test";

const meta = {
  title: "组件/单选/CheckRadio",
  component: CheckRadio,
  parameters: {
    docs: {
      description: {
        component:
          "CheckRadio — 哑组件，用于展示单个选项的 label/description/status/disabled，点击时发出 select 事件。",
      },
    },
  },
  decorators: [
    () => ({ template: '<div style="padding:12px"><story /></div>' }),
  ],
} satisfies Meta<typeof CheckRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StandaloneUnselected: Story = {
  args: { value: "a", label: "示例选项 A", status: "none" },
  name: "独立：未选择",
  play: async ({ canvas, userEvent }) => {
    const btn = canvas.getByRole("button");
    expect(btn).toBeEnabled();
    await userEvent.click(btn);
  },
};

export const StandaloneCorrect: Story = {
  args: { value: "a", label: "正确选项", status: "correct" },
  name: "独立：正确",
  play: async ({ canvas }) => {
    const labelEl = canvas.getByText("正确选项");
    const radio = labelEl.closest(".radio");
    expect(radio).toHaveClass("radio--correct");
  },
};

export const StandaloneIncorrect: Story = {
  args: { value: "a", label: "错误选项", status: "incorrect" },
  name: "独立：错误",
  play: async ({ canvas }) => {
    const labelEl = canvas.getByText("错误选项");
    const radio = labelEl.closest(".radio");
    expect(radio).toHaveClass("radio--incorrect");
  },
};

export const StandaloneWithDesc: Story = {
  args: {
    value: "a",
    label: "示例选项（含描述）",
    description: "示例描述：用于展示如何在选项下方显示补充信息或使用说明。",
  },
  name: "独立：带描述",
  play: async ({ canvas }) => {
    expect(
      canvas.getByText(
        "示例描述：用于展示如何在选项下方显示补充信息或使用说明。",
      ),
    ).toBeInTheDocument();
  },
};
