/**
 * Button 组件 Storybook 故事
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "../components/Button.vue";

const meta = {
  title: "组件/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Button 组件提供三种变体（default、outline、ghost）和三种尺寸（default、sm、lg）。参考 shadcn 简洁风格，使用 border 替代 shadow。",
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div style="padding: 24px; display: flex; gap: 12px; flex-wrap: wrap;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 默认变体
export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">主按钮</Button>',
  }),
  name: "变体：Default",
};

export const Outline: Story = {
  args: {
    variant: "outline",
    size: "default",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">次要按钮</Button>',
  }),
  name: "变体：Outline",
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "default",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">幽灵按钮</Button>',
  }),
  name: "变体：Ghost",
};

// 尺寸变体
export const SizeSmall: Story = {
  args: {
    variant: "default",
    size: "sm",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">小按钮</Button>',
  }),
  name: "尺寸：Small",
};

export const SizeLarge: Story = {
  args: {
    variant: "default",
    size: "lg",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">大按钮</Button>',
  }),
  name: "尺寸：Large",
};

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 12px;">
        <Button variant="default" disabled>禁用主按钮</Button>
        <Button variant="outline" disabled>禁用次要按钮</Button>
        <Button variant="ghost" disabled>禁用幽灵按钮</Button>
      </div>
    `,
  }),
  name: "状态：Disabled",
};

// 所有变体展示
export const AllVariants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 12px;">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div style="display: flex; gap: 12px;">
          <Button variant="default" size="sm">Small</Button>
          <Button variant="default" size="default">Default</Button>
          <Button variant="default" size="lg">Large</Button>
        </div>
      </div>
    `,
  }),
  name: "所有变体",
};

// 带图标
export const WithIcon: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 12px;">
        <Button variant="default">
          <i class="i-carbon-add w-5 h-5" aria-hidden="true" />
          添加
        </Button>
        <Button variant="outline">
          <i class="i-carbon-edit w-5 h-5" aria-hidden="true" />
          编辑
        </Button>
        <Button variant="ghost">
          <i class="i-carbon-trash-can w-5 h-5" aria-hidden="true" />
          删除
        </Button>
      </div>
    `,
  }),
  name: "带图标",
};
