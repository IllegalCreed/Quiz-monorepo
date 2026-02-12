/**
 * UnoCSS 配置文件
 * 使用 Tailwind 4 预设 + Quiz 紫色主题
 */
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind4,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    filesystem: ["src/**/*.{vue,js,ts,jsx,tsx}"],
  },
  safelist: [
    // 菜单图标（动态绑定，需要 safelist）
    "i-carbon-home",
    "i-carbon-settings",
    "i-carbon-user-multiple",
    "i-carbon-user-admin",

    // Header 图标
    "i-carbon-menu",
    "i-carbon-sun",
    "i-carbon-moon",
    "i-carbon-user",

    // Tab 关闭按钮
    "i-carbon-close",

    // 登录页 loading
    "i-carbon-renew",

    // Dashboard 统计卡片图标
    "i-carbon-analytics",
    "i-carbon-user-activity",
    "i-carbon-email",
  ],
  presets: [
    presetWind4(),
    presetIcons({ scale: 1.2, warn: true }),
    presetTypography(),
    presetWebFonts({ fonts: { sans: "Inter:400,600,700" } }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: "#6366f1",
    },
  },
});
