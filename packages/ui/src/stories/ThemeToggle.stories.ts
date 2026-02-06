/**
 * ThemeToggle 组件 Storybook 故事
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ThemeToggle from "../components/ThemeToggle.vue";

const meta = {
  title: "组件/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component:
          "ThemeToggle 组件用于切换深色/浅色模式。使用 VueUse 的 useDark 自动管理主题，支持系统偏好检测和本地存储持久化。点击按钮即可体验主题切换效果。",
      },
    },
  },
  decorators: [
    () => ({
      template: '<div style="padding: 24px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// 默认样式
export const Default: Story = {
  render: () => ({
    components: { ThemeToggle },
    template: "<ThemeToggle />",
  }),
  name: "默认样式",
};

// 固定定位示例
export const FixedPosition: Story = {
  render: () => ({
    components: { ThemeToggle },
    template: `
      <div style="position: relative; height: 200px; background: var(--quiz-ui-bg); border: 1px solid var(--quiz-ui-border); border-radius: 8px; padding: 24px;">
        <ThemeToggle style="position: absolute; top: 1rem; right: 1rem; z-index: 10;" />
        <h3 style="color: var(--quiz-ui-text); margin: 0 0 8px 0;">右上角的按钮可以切换主题</h3>
        <p style="color: var(--quiz-ui-muted); margin: 0;">点击太阳/月亮图标尝试切换深色/浅色模式。</p>
      </div>
    `,
  }),
  name: "固定定位示例",
};

// 自定义位置
export const CustomPosition: Story = {
  render: () => ({
    components: { ThemeToggle },
    template: `
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="color: var(--quiz-ui-text);">主题切换：</span>
        <ThemeToggle />
      </div>
    `,
  }),
  name: "自定义位置",
};
