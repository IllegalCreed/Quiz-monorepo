import type { Preview } from "@storybook/vue3-vite";
import "virtual:uno.css";
import "../src/styles/main.scss";

/*
 * Storybook preview 配置
 *
 * 说明（针对初学者）：
 * - globalTypes 定义了 Storybook toolbar 上的主题开关（Light / Dark）。
 * - 我们在 decorator 中只同步 .dark class，以与 VueUse 的 useDark 保持一致（useDark 默认切换 .dark）。
 * - 如果上层应用使用 useDark 或其他方式切换主题，这里与其一致即可，不需要额外的 data-theme/data-color-scheme 属性。
 *
 * 在 Story 中选择 toolbar 的 Theme 会把该值放到 context.globals.theme，decorator 会据此切换 DOM class。
 */
export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Light / Dark",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
    },
  },
};

export const decorators = [
  (
    Story: () => unknown,
    context: { globals?: { theme?: "light" | "dark" } },
  ): unknown => {
    // 仅设置 dark class，与 VueUse useDark 默认行为一致
    const isDark = context.globals?.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    return Story();
  },
];

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    // 启用 a11y 测试：违规时在 Vitest 中报错
    // 'error' - 测试失败；'todo' - 显示警告；'off' - 禁用
    a11y: { test: "error" },
  },
  argTypes: {
    key: { table: { disable: true } },
    ref: { table: { disable: true } },
    ref_for: { table: { disable: true } },
    ref_key: { table: { disable: true } },
    class: { table: { disable: true } },
    style: { table: { disable: true } },
  },
};

export default preview;
