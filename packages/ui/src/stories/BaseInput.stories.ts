/**
 * BaseInput 组件 Storybook 故事
 *
 * 每个 story 附带 play 交互测试
 */
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";
import { ref } from "vue";
import BaseInput from "../components/BaseInput.vue";

const meta = {
  title: "组件/BaseInput",
  component: BaseInput,
  parameters: {
    docs: {
      description: {
        component:
          "Input 输入框组件，支持 label、error 状态、password 可见切换、三种尺寸。适用于登录注册表单、搜索框等场景。",
      },
    },
  },
  decorators: [
    () => ({
      template: '<div style="padding: 24px; max-width: 360px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BaseInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认文本输入 */
export const Default: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const value = ref("");
      return { value };
    },
    template: '<BaseInput v-model="value" placeholder="请输入内容" />',
  }),
  name: "默认输入框",
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("请输入内容");
    expect(input).toBeInTheDocument();
    /* 测试输入 */
    await userEvent.type(input, "hello");
    expect(input).toHaveValue("hello");
  },
};

/** 带 Label */
export const WithLabel: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const value = ref("");
      return { value };
    },
    template:
      '<BaseInput v-model="value" label="用户名" placeholder="请输入用户名" />',
  }),
  name: "带 Label",
  play: async ({ canvas }) => {
    /* 验证 label 渲染且关联 input */
    const label = canvas.getByText("用户名");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    const input = canvas.getByPlaceholderText("请输入用户名");
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
  },
};

/** 错误状态 */
export const WithError: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const value = ref("abc");
      return { value };
    },
    template:
      '<BaseInput v-model="value" label="邮箱" error="请输入有效的邮箱地址" type="email" />',
  }),
  name: "错误状态",
  play: async ({ canvas }) => {
    /* 验证错误提示文字 */
    const error = canvas.getByText("请输入有效的邮箱地址");
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute("role", "alert");
    /* 验证错误修饰类 */
    const wrapper = canvas.getByText("邮箱").closest(".input");
    expect(wrapper).toHaveClass("input--error");
  },
};

/** 密码输入 */
export const Password: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const value = ref("");
      return { value };
    },
    template:
      '<BaseInput v-model="value" label="密码" type="password" placeholder="请输入密码" />',
  }),
  name: "密码输入",
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("请输入密码");
    /* 初始为 password 类型 */
    expect(input).toHaveAttribute("type", "password");
    /* 点击切换按钮显示密码 */
    const toggle = canvas.getByLabelText("显示密码");
    await userEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    /* 再次点击隐藏 */
    const hideToggle = canvas.getByLabelText("隐藏密码");
    await userEvent.click(hideToggle);
    expect(input).toHaveAttribute("type", "password");
  },
};

/** 禁用状态 */
export const Disabled: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const value = ref("不可编辑的内容");
      return { value };
    },
    template: '<BaseInput v-model="value" label="只读字段" disabled />',
  }),
  name: "禁用状态",
  play: async ({ canvas }) => {
    const input = canvas.getByDisplayValue("不可编辑的内容");
    expect(input).toBeDisabled();
    const wrapper = canvas.getByText("只读字段").closest(".input");
    expect(wrapper).toHaveClass("input--disabled");
  },
};

/** 尺寸对比 */
export const Sizes: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const sm = ref("");
      const md = ref("");
      const lg = ref("");
      return { sm, md, lg };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BaseInput v-model="sm" size="sm" label="Small" placeholder="小尺寸" />
        <BaseInput v-model="md" size="md" label="Medium" placeholder="中尺寸（默认）" />
        <BaseInput v-model="lg" size="lg" label="Large" placeholder="大尺寸" />
      </div>
    `,
  }),
  name: "尺寸对比",
  play: async ({ canvas }) => {
    /* 验证三种尺寸修饰类 */
    const smInput = canvas.getByText("Small").closest(".input");
    expect(smInput).toHaveClass("input--sm");
    const mdInput = canvas.getByText("Medium").closest(".input");
    expect(mdInput).toHaveClass("input--md");
    const lgInput = canvas.getByText("Large").closest(".input");
    expect(lgInput).toHaveClass("input--lg");
  },
};

/** 登录表单示例 */
export const LoginForm: Story = {
  render: () => ({
    components: { BaseInput },
    setup() {
      const username = ref("");
      const password = ref("");
      return { username, password };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BaseInput v-model="username" label="用户名" placeholder="请输入用户名" />
        <BaseInput v-model="password" label="密码" type="password" placeholder="请输入密码" />
      </div>
    `,
  }),
  name: "登录表单示例",
  play: async ({ canvas, userEvent }) => {
    /* 模拟表单填写 */
    await userEvent.type(canvas.getByPlaceholderText("请输入用户名"), "admin");
    await userEvent.type(canvas.getByPlaceholderText("请输入密码"), "123456");
    expect(canvas.getByPlaceholderText("请输入用户名")).toHaveValue("admin");
    expect(canvas.getByPlaceholderText("请输入密码")).toHaveValue("123456");
  },
};
