/**
 * BaseButton 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试，验证渲染 + 交互行为
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";
import BaseButton from "../components/BaseButton.vue";

const meta = {
  title: "组件/BaseButton",
  component: BaseButton,
  parameters: {
    docs: {
      description: {
        component:
          "Button 组件提供三种变体（default、outline、ghost）和三种尺寸（md、sm、lg）。参考 shadcn 简洁风格，使用 border 替代 shadow。",
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div style="padding: 24px; display: flex; gap: 12px; flex-wrap: wrap;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BaseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认变体 */
export const Default: Story = {
  args: {
    variant: "default",
    size: "md",
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args };
    },
    template: '<BaseButton v-bind="args">主按钮</BaseButton>',
  }),
  name: "变体：Default",
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: "主按钮" });
    expect(btn).toBeEnabled();
    expect(btn).toHaveClass("btn--default");
  },
};

/** Outline 变体 */
export const Outline: Story = {
  args: {
    variant: "outline",
    size: "md",
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args };
    },
    template: '<BaseButton v-bind="args">次要按钮</BaseButton>',
  }),
  name: "变体：Outline",
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: "次要按钮" });
    expect(btn).toHaveClass("btn--outline");
  },
};

/** Ghost 变体 */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "md",
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args };
    },
    template: '<BaseButton v-bind="args">幽灵按钮</BaseButton>',
  }),
  name: "变体：Ghost",
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: "幽灵按钮" });
    expect(btn).toHaveClass("btn--ghost");
  },
};

/** 小尺寸 */
export const SizeSmall: Story = {
  args: {
    variant: "default",
    size: "sm",
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args };
    },
    template: '<BaseButton v-bind="args">小按钮</BaseButton>',
  }),
  name: "尺寸：Small",
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: "小按钮" });
    expect(btn).toHaveClass("btn--sm");
  },
};

/** 大尺寸 */
export const SizeLarge: Story = {
  args: {
    variant: "default",
    size: "lg",
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args };
    },
    template: '<BaseButton v-bind="args">大按钮</BaseButton>',
  }),
  name: "尺寸：Large",
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: "大按钮" });
    expect(btn).toHaveClass("btn--lg");
  },
};

/** 禁用状态 */
export const Disabled: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display: flex; gap: 12px;">
        <BaseButton variant="default" disabled>禁用主按钮</BaseButton>
        <BaseButton variant="outline" disabled>禁用次要按钮</BaseButton>
        <BaseButton variant="ghost" disabled>禁用幽灵按钮</BaseButton>
      </div>
    `,
  }),
  name: "状态：Disabled",
  play: async ({ canvas }) => {
    const btns = canvas.getAllByRole("button");
    for (const btn of btns) {
      expect(btn).toBeDisabled();
    }
  },
};

/** 所有变体展示 */
export const AllVariants: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 12px;">
          <BaseButton variant="default">Default</BaseButton>
          <BaseButton variant="outline">Outline</BaseButton>
          <BaseButton variant="ghost">Ghost</BaseButton>
        </div>
        <div style="display: flex; gap: 12px;">
          <BaseButton variant="default" size="sm">Small</BaseButton>
          <BaseButton variant="default" size="md">Medium</BaseButton>
          <BaseButton variant="default" size="lg">Large</BaseButton>
        </div>
      </div>
    `,
  }),
  name: "所有变体",
  play: async ({ canvas }) => {
    /* 验证 6 个按钮全部渲染 */
    const btns = canvas.getAllByRole("button");
    expect(btns.length).toBe(6);
  },
};

/** 点击事件 */
export const WithIcon: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display: flex; gap: 12px;">
        <BaseButton variant="default">
          <i class="i-carbon-add w-5 h-5" aria-hidden="true" />
          添加
        </BaseButton>
        <BaseButton variant="outline">
          <i class="i-carbon-edit w-5 h-5" aria-hidden="true" />
          编辑
        </BaseButton>
        <BaseButton variant="ghost">
          <i class="i-carbon-trash-can w-5 h-5" aria-hidden="true" />
          删除
        </BaseButton>
      </div>
    `,
  }),
  name: "带图标",
  play: async ({ canvas, userEvent }) => {
    /* 验证带图标的按钮可以点击 */
    const addBtn = canvas.getByRole("button", { name: /添加/ });
    await userEvent.click(addBtn);
    expect(addBtn).toBeEnabled();
  },
};
