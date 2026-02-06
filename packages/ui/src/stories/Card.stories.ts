/**
 * BaseCard 组件 Storybook 故事
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseCard from "../components/BaseCard.vue";
import BaseCardHeader from "../components/BaseCardHeader.vue";
import BaseCardContent from "../components/BaseCardContent.vue";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";

const meta = {
  title: "组件/BaseCard",
  component: BaseCard,
  parameters: {
    docs: {
      description: {
        component:
          "Card 组件系列（BaseCard、BaseCardHeader、BaseCardContent）提供灵活的卡片布局。参考 shadcn 简洁风格，使用 border 替代 shadow。CardHeader 支持虚线分割。",
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div style="padding: 24px; max-width: 720px; margin: 0 auto;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础卡片
export const Basic: Story = {
  render: () => ({
    components: { BaseCard, BaseCardContent },
    template: `
      <BaseCard>
        <BaseCardContent>
          <p style="margin: 0; color: var(--quiz-ui-text);">这是一个基础卡片，只有内容区域。</p>
        </BaseCardContent>
      </BaseCard>
    `,
  }),
  name: "基础卡片",
};

// 带标题和内容
export const WithHeader: Story = {
  render: () => ({
    components: { BaseCard, BaseCardHeader, BaseCardContent },
    template: `
      <BaseCard>
        <BaseCardHeader>
          <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--quiz-ui-text);">
            卡片标题
          </h2>
        </BaseCardHeader>
        <BaseCardContent>
          <p style="margin: 0; color: var(--quiz-ui-muted);">
            这是卡片的内容区域。可以放置任意内容，如文本、表单、列表等。
          </p>
        </BaseCardContent>
      </BaseCard>
    `,
  }),
  name: "带标题和内容",
};

// 带虚线分割
export const WithDivider: Story = {
  render: () => ({
    components: { BaseCard, BaseCardHeader, BaseCardContent },
    template: `
      <BaseCard>
        <BaseCardHeader divided>
          <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--quiz-ui-text);">
            带虚线分割的卡片
          </h2>
        </BaseCardHeader>
        <BaseCardContent>
          <p style="margin: 0; color: var(--quiz-ui-muted);">
            CardHeader 的 <code>divided</code> prop 设置为 true 时，会在底部显示虚线分割。
          </p>
        </BaseCardContent>
      </BaseCard>
    `,
  }),
  name: "带虚线分割",
};

// 模拟题目卡片（嵌套 CheckRadioGroup）
export const QuizCard: Story = {
  render: () => ({
    components: { BaseCard, BaseCardHeader, BaseCardContent, CheckRadioGroup },
    setup() {
      const selected = null;
      const options = [
        { value: 1, label: "选项 A：JavaScript" },
        { value: 2, label: "选项 B：TypeScript" },
        { value: 3, label: "选项 C：Python" },
        { value: 4, label: "选项 D：Java" },
      ];
      return { selected, options };
    },
    template: `
      <BaseCard>
        <BaseCardHeader divided>
          <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; line-height: 1.6; color: var(--quiz-ui-text);">
            Vue 3 使用什么语言编写？
          </h2>
        </BaseCardHeader>
        <BaseCardContent>
          <CheckRadioGroup
            v-model="selected"
            :options="options"
          />
        </BaseCardContent>
      </BaseCard>
    `,
  }),
  name: "题目卡片示例",
};

// 多卡片布局
export const Multiple: Story = {
  render: () => ({
    components: { BaseCard, BaseCardHeader, BaseCardContent },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BaseCard>
          <BaseCardHeader divided>
            <h3 style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--quiz-ui-text);">
              卡片 1
            </h3>
          </BaseCardHeader>
          <BaseCardContent>
            <p style="margin: 0; color: var(--quiz-ui-muted); font-size: 0.875rem;">
              第一张卡片的内容。
            </p>
          </BaseCardContent>
        </BaseCard>

        <BaseCard>
          <BaseCardHeader divided>
            <h3 style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--quiz-ui-text);">
              卡片 2
            </h3>
          </BaseCardHeader>
          <BaseCardContent>
            <p style="margin: 0; color: var(--quiz-ui-muted); font-size: 0.875rem;">
              第二张卡片的内容。
            </p>
          </BaseCardContent>
        </BaseCard>

        <BaseCard>
          <BaseCardHeader divided>
            <h3 style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--quiz-ui-text);">
              卡片 3
            </h3>
          </BaseCardHeader>
          <BaseCardContent>
            <p style="margin: 0; color: var(--quiz-ui-muted); font-size: 0.875rem;">
              第三张卡片的内容。
            </p>
          </BaseCardContent>
        </BaseCard>
      </div>
    `,
  }),
  name: "多卡片布局",
};
