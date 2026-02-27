/**
 * BasePopover 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";
import BasePopover from "../components/BasePopover.vue";
import BaseButton from "../components/BaseButton.vue";

const meta = {
  title: "组件/BasePopover",
  component: BasePopover,
  parameters: {
    docs: {
      description: {
        component:
          "Popover 弹出面板组件，点击 trigger 切换显示，点击外部或 Esc 关闭。支持四个定位方向。",
      },
    },
  },
  decorators: [
    () => ({
      template: '<div style="padding: 120px 200px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BasePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 下方右对齐（默认） */
export const BottomEnd: Story = {
  render: () => ({
    components: { BasePopover, BaseButton },
    template: `
      <BasePopover placement="bottom-end">
        <template #trigger>
          <BaseButton variant="outline">用户菜单</BaseButton>
        </template>
        <div style="padding: 8px; min-width: 160px;">
          <div v-for="item in ['做题历史', '分类偏好', '退出登录']" :key="item"
               style="padding: 8px 12px; cursor: pointer; border-radius: 6px;"
               @mouseenter="$event.target.style.backgroundColor = 'var(--quiz-ui-control-bg)'"
               @mouseleave="$event.target.style.backgroundColor = 'transparent'">
            {{ item }}
          </div>
        </div>
      </BasePopover>
    `,
  }),
  name: "方向：底部右对齐（默认）",
  play: async ({ canvas, userEvent }) => {
    /* 点击 trigger 打开 */
    await userEvent.click(canvas.getByRole("button", { name: "用户菜单" }));
    /* 验证弹出内容出现 */
    expect(canvas.getByText("做题历史")).toBeInTheDocument();
    expect(canvas.getByText("退出登录")).toBeInTheDocument();
    /* 验证定位修饰类 */
    const content = canvas.getByText("做题历史").closest(".popover__content");
    expect(content).toHaveClass("popover__content--bottom-end");
    /* 再次点击 trigger 关闭 */
    await userEvent.click(canvas.getByRole("button", { name: "用户菜单" }));
  },
};

/** 下方左对齐 */
export const BottomStart: Story = {
  render: () => ({
    components: { BasePopover, BaseButton },
    template: `
      <BasePopover placement="bottom-start">
        <template #trigger>
          <BaseButton>操作</BaseButton>
        </template>
        <div style="padding: 8px; min-width: 140px;">
          <div style="padding: 8px 12px;">菜单项 1</div>
          <div style="padding: 8px 12px;">菜单项 2</div>
        </div>
      </BasePopover>
    `,
  }),
  name: "方向：底部左对齐",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "操作" }));
    expect(canvas.getByText("菜单项 1")).toBeInTheDocument();
    const content = canvas.getByText("菜单项 1").closest(".popover__content");
    expect(content).toHaveClass("popover__content--bottom-start");
    await userEvent.click(canvas.getByRole("button", { name: "操作" }));
  },
};

/** 上方右对齐 */
export const TopEnd: Story = {
  render: () => ({
    components: { BasePopover, BaseButton },
    template: `
      <BasePopover placement="top-end">
        <template #trigger>
          <BaseButton variant="ghost">弹出上方</BaseButton>
        </template>
        <div style="padding: 12px;">
          <p style="margin: 0;">提示信息面板</p>
        </div>
      </BasePopover>
    `,
  }),
  name: "方向：顶部右对齐",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "弹出上方" }));
    expect(canvas.getByText("提示信息面板")).toBeInTheDocument();
    const content = canvas
      .getByText("提示信息面板")
      .closest(".popover__content");
    expect(content).toHaveClass("popover__content--top-end");
    await userEvent.click(canvas.getByRole("button", { name: "弹出上方" }));
  },
};
