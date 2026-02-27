import {
  defineConfig,
  // presetAttributify, // 禁用：与组件 props 冲突
  presetIcons,
  presetTypography,
  presetWind4,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";

export default defineConfig({
  // 扫描 UI 库源码，自动检测使用的工具类
  content: {
    filesystem: [
      "src/**/*.{vue,js,ts,jsx,tsx}",
      "../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx}", // 扫描 UI 库源码
    ],
  },
  // 图标类需要构建时生成 SVG，动态拼接的图标类名必须在 safelist 中
  safelist: [
    "i-carbon-sun",
    "i-carbon-moon",
    "i-carbon-user-avatar", // 用户头像（UserDropdown trigger）
    "i-carbon-logout", // 退出登录
    "i-carbon-time", // 做题历史
    "i-carbon-settings", // 分类偏好
    "i-carbon-checkmark", // 答对徽标
    "i-carbon-close-filled", // 答错徽标
  ],
  shortcuts: [
    // ...
  ],
  theme: {
    colors: {
      // ...
    },
  },
  presets: [
    presetWind4(),
    // presetAttributify(), // 禁用：会导致 size="md" 等属性被转换成 CSS 规则，与组件 props 冲突
    presetIcons({
      // 启用所有 iconify 集合（包括 carbon、lucide 等）
      scale: 1.2,
      warn: true,
      // 同时支持自定义图标
      collections: {
        custom: FileSystemIconLoader("./src/assets/icons"),
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
