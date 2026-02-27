/**
 * BaseTag 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试，验证渲染 + 交互行为
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";
import BaseTag from "../components/BaseTag.vue";
import { getTagColor } from "../components/tag-utils";

const meta = {
  title: "组件/BaseTag",
  component: BaseTag,
  parameters: {
    docs: {
      description: {
        component:
          "Tag 标签组件提供三种尺寸（sm、md、lg）和六种颜色变体，支持可关闭模式。用于题目分类标签、ColumnSelector 已选摘要等场景。",
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div style="padding: 24px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BaseTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认标签 */
export const Default: Story = {
  args: {
    size: "md",
  },
  render: (args) => ({
    components: { BaseTag },
    setup() {
      return { args };
    },
    template: '<BaseTag v-bind="args">Vue</BaseTag>',
  }),
  name: "默认标签",
  play: async ({ canvas }) => {
    const tag = canvas.getByText("Vue");
    expect(tag).toBeTruthy();
    expect(tag.classList.contains("tag--md")).toBe(true);
  },
};

/** 三种尺寸 */
export const Sizes: Story = {
  render: () => ({
    components: { BaseTag },
    template: `
      <BaseTag size="sm">小号标签</BaseTag>
      <BaseTag size="md">中号标签</BaseTag>
      <BaseTag size="lg">大号标签</BaseTag>
    `,
  }),
  name: "尺寸对比",
  play: async ({ canvas }) => {
    expect(canvas.getByText("小号标签").classList.contains("tag--sm")).toBe(
      true,
    );
    expect(canvas.getByText("中号标签").classList.contains("tag--md")).toBe(
      true,
    );
    expect(canvas.getByText("大号标签").classList.contains("tag--lg")).toBe(
      true,
    );
  },
};

/** 颜色变体 */
export const Colors: Story = {
  render: () => ({
    components: { BaseTag },
    template: `
      <BaseTag color="default">默认</BaseTag>
      <BaseTag color="blue">蓝色</BaseTag>
      <BaseTag color="green">绿色</BaseTag>
      <BaseTag color="purple">紫色</BaseTag>
      <BaseTag color="orange">橙色</BaseTag>
      <BaseTag color="pink">粉色</BaseTag>
      <BaseTag color="cyan">青色</BaseTag>
    `,
  }),
  name: "颜色变体",
  play: async ({ canvas }) => {
    expect(canvas.getByText("蓝色").classList.contains("tag--blue")).toBe(true);
    expect(canvas.getByText("紫色").classList.contains("tag--purple")).toBe(
      true,
    );
  },
};

/** 可关闭标签 */
export const Removable: Story = {
  render: () => {
    const onRemove = fn();
    return {
      components: { BaseTag },
      setup() {
        return { onRemove };
      },
      template: `
        <BaseTag size="md" removable @remove="onRemove">可关闭标签</BaseTag>
        <BaseTag size="sm" color="blue" removable @remove="onRemove">蓝色可关闭</BaseTag>
      `,
    };
  },
  name: "可关闭",
  play: async ({ canvas, userEvent }) => {
    /* 验证关闭按钮存在且可点击 */
    const removeBtns = canvas.getAllByRole("button", { name: "移除" });
    expect(removeBtns.length).toBe(2);
    await userEvent.click(removeBtns[0]!);
  },
};

/** 多标签组合（模拟题目分类展示，使用 getTagColor 自动分配颜色） */
export const QuestionTags: Story = {
  render: () => ({
    components: { BaseTag },
    setup() {
      return { getTagColor };
    },
    template: `
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <BaseTag size="sm" :color="getTagColor('Vue')">Vue</BaseTag>
        <BaseTag size="sm" :color="getTagColor('前端通识')">前端通识</BaseTag>
        <BaseTag size="sm" :color="getTagColor('CSS')">CSS</BaseTag>
        <BaseTag size="sm" :color="getTagColor('JavaScript')">JavaScript</BaseTag>
      </div>
    `,
  }),
  name: "题目分类标签",
  play: async ({ canvas }) => {
    const tags = canvas.getAllByText(/Vue|前端通识|CSS|JavaScript/);
    expect(tags.length).toBe(4);
  },
};

/** ColumnSelector 已选摘要（模拟） */
export const SelectorSummary: Story = {
  render: () => {
    const onRemove = fn();
    return {
      components: { BaseTag },
      setup() {
        return { onRemove };
      },
      template: `
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <BaseTag size="md" removable @remove="onRemove">JavaScript</BaseTag>
          <BaseTag size="md" removable @remove="onRemove">React</BaseTag>
          <BaseTag size="md" removable @remove="onRemove">前端通识</BaseTag>
        </div>
      `,
    };
  },
  name: "选择器已选摘要",
  play: async ({ canvas }) => {
    const removeBtns = canvas.getAllByRole("button", { name: "移除" });
    expect(removeBtns.length).toBe(3);
  },
};
