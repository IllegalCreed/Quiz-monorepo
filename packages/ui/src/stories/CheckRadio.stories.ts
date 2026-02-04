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

export const StandaloneDisabled: Story = {
  args: {
    value: "a",
    label: "禁用选项",
    disabled: true,
    status: "none",
  },
  name: "独立：禁用",
  play: async ({ canvas, userEvent }) => {
    const btn = canvas.getByRole("button");
    // 验证按钮处于禁用状态
    expect(btn).toBeDisabled();
    // 点击禁用按钮（测试 disabled 分支）
    await userEvent.click(btn);
    // 验证禁用样式
    const radio = btn.closest(".radio");
    expect(radio).toHaveClass("radio--disabled");
  },
};

export const StandaloneStatusNull: Story = {
  args: {
    value: "a",
    label: "状态为 null",
    status: null,
  },
  name: "独立：status 为 null",
  play: async ({ canvas }) => {
    const labelEl = canvas.getByText("状态为 null");
    const radio = labelEl.closest(".radio");
    // status 为 null 时应该没有 correct/incorrect 样式
    expect(radio).not.toHaveClass("radio--correct");
    expect(radio).not.toHaveClass("radio--incorrect");
  },
};

export const StandaloneWithSlots: Story = {
  name: "独立：使用 Slot 自定义内容",
  args: {
    value: "slot-test",
  },
  render: () => ({
    components: { CheckRadio },
    template: `
      <CheckRadio value="slot-test">
        <template #label><strong>自定义标签</strong></template>
        <template #description><em>自定义描述内容</em></template>
      </CheckRadio>
    `,
  }),
  play: async ({ canvas }) => {
    // 验证 slot 内容正确渲染
    expect(canvas.getByText("自定义标签")).toBeInTheDocument();
    expect(canvas.getByText("自定义描述内容")).toBeInTheDocument();
    // 验证描述区域存在（$slots.description 分支被覆盖）
    const descEl = canvas.getByText("自定义描述内容").closest(".radio__desc");
    expect(descEl).toBeInTheDocument();
  },
};
