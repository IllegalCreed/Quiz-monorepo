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
  // safelist 只需要包含图标类（因为图标需要在构建时生成 SVG）
  safelist: ["i-carbon-sun", "i-carbon-moon"],
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
