/**
 * BaseDialog 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试：点击打开 → 验证内容 → 关闭
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, within } from "storybook/test";
import { ref } from "vue";
import BaseDialog from "../components/BaseDialog.vue";
import BaseButton from "../components/BaseButton.vue";

const meta = {
  title: "组件/BaseDialog",
  component: BaseDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Dialog/Drawer 组件，通过 placement 切换居中对话框（center）和侧边抽屉（right/left）模式。支持遮罩关闭、Esc 关闭、body 滚动锁定。",
      },
    },
  },
} satisfies Meta<typeof BaseDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 居中对话框 */
export const Center: Story = {
  args: { modelValue: false },
  render: () => ({
    components: { BaseDialog, BaseButton },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <BaseButton @click="visible = true">打开对话框</BaseButton>
        <BaseDialog v-model="visible" title="居中对话框" placement="center">
          <p>这是一个居中显示的对话框，适用于确认操作、表单提交等场景。</p>
          <template #footer>
            <BaseButton variant="outline" @click="visible = false">取消</BaseButton>
            <BaseButton @click="visible = false">确定</BaseButton>
          </template>
        </BaseDialog>
      </div>
    `,
  }),
  name: "模式：居中对话框",
  play: async ({ canvas, userEvent }) => {
    /* 打开对话框 */
    await userEvent.click(canvas.getByRole("button", { name: "打开对话框" }));
    /* 通过文本定位到本 story 的 dialog（避免与其他 story 残留的 Teleport 冲突） */
    const body = within(document.body);
    const title = await body.findByText("居中对话框");
    const dialog = title.closest('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeInTheDocument();
    /* 点击确定关闭 */
    await userEvent.click(within(dialog).getByRole("button", { name: "确定" }));
  },
};

/** 右侧抽屉 */
export const Right: Story = {
  args: { modelValue: false },
  render: () => ({
    components: { BaseDialog, BaseButton },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <BaseButton @click="visible = true">打开右侧抽屉</BaseButton>
        <BaseDialog v-model="visible" title="答题历史" placement="right" width="24rem">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="i in 20" :key="i" style="padding: 12px; border-radius: 8px; border: 1px solid var(--quiz-ui-border);">
              <p style="margin: 0; font-weight: 500;">题目 #{{ i }}</p>
              <p style="margin: 4px 0 0; color: var(--quiz-ui-muted); font-size: 14px;">2 分钟前</p>
            </div>
          </div>
        </BaseDialog>
      </div>
    `,
  }),
  name: "模式：右侧抽屉",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "打开右侧抽屉" }));
    const body = within(document.body);
    const title = await body.findByText("答题历史");
    const dialog = title.closest('[role="dialog"]') as HTMLElement;
    expect(dialog).toHaveClass("dialog--right");
    /* 点击关闭按钮 */
    await userEvent.click(within(dialog).getByLabelText("关闭"));
  },
};

/** 左侧抽屉 */
export const Left: Story = {
  args: { modelValue: false },
  render: () => ({
    components: { BaseDialog, BaseButton },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <BaseButton @click="visible = true">打开左侧抽屉</BaseButton>
        <BaseDialog v-model="visible" title="导航菜单" placement="left" width="20rem">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li v-for="item in ['首页', '题库', '分类', '设置']" :key="item"
                style="padding: 12px 8px; cursor: pointer; border-radius: 6px;"
                @mouseenter="$event.target.style.backgroundColor = 'var(--quiz-ui-control-bg)'"
                @mouseleave="$event.target.style.backgroundColor = 'transparent'">
              {{ item }}
            </li>
          </ul>
        </BaseDialog>
      </div>
    `,
  }),
  name: "模式：左侧抽屉",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "打开左侧抽屉" }));
    const body = within(document.body);
    /* 通过文本定位到本 story 的 dialog（避免与其他 story 残留的 Teleport 冲突） */
    const menuItem = await body.findByText("首页");
    const dialog = menuItem.closest('[role="dialog"]') as HTMLElement;
    expect(dialog).toHaveClass("dialog--left");
    await userEvent.click(within(dialog).getByLabelText("关闭"));
  },
};

/** 无标题（纯内容） */
export const NoTitle: Story = {
  args: { modelValue: false },
  render: () => ({
    components: { BaseDialog, BaseButton },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <BaseButton @click="visible = true">打开无标题对话框</BaseButton>
        <BaseDialog v-model="visible" placement="center" width="24rem">
          <div style="text-align: center;">
            <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">确认删除？</p>
            <p style="color: var(--quiz-ui-muted); margin: 0 0 24px;">此操作不可撤销</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <BaseButton variant="outline" @click="visible = false">取消</BaseButton>
              <BaseButton @click="visible = false">删除</BaseButton>
            </div>
          </div>
        </BaseDialog>
      </div>
    `,
  }),
  name: "无标题对话框",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "打开无标题对话框" }),
    );
    const body = within(document.body);
    const deleteText = await body.findByText("确认删除？");
    expect(body.getByText("此操作不可撤销")).toBeInTheDocument();
    /* 通过内容文本向上定位到本 story 的 dialog */
    const dialog = deleteText.closest('[role="dialog"]') as HTMLElement;
    expect(dialog.querySelector(".dialog__header")).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "取消" }));
  },
};

/** 自定义 Header */
export const CustomHeader: Story = {
  args: { modelValue: false },
  render: () => ({
    components: { BaseDialog, BaseButton },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <BaseButton @click="visible = true">自定义 Header</BaseButton>
        <BaseDialog v-model="visible" placement="center">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="i-carbon-settings w-5 h-5" aria-hidden="true" />
              <span style="font-weight: 600;">系统设置</span>
            </div>
          </template>
          <p>通过 header slot 自定义标题栏内容。</p>
        </BaseDialog>
      </div>
    `,
  }),
  name: "自定义 Header",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "自定义 Header" }),
    );
    const body = within(document.body);
    const headerText = await body.findByText("系统设置");
    const dialog = headerText.closest('[role="dialog"]') as HTMLElement;
    expect(
      within(dialog).getByText("通过 header slot 自定义标题栏内容。"),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByLabelText("关闭"));
  },
};
