import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  // 确保动态类名被包含（用于组件库的状态样式）
  safelist: [
    "radio--correct",
    "radio--incorrect",
    "radio--disabled",
    "i-carbon-add",
    "i-carbon-edit",
    "i-carbon-trash-can",
  ],
  shortcuts: [
    // Add your shortcuts here
  ],
  theme: {
    colors: {
      // Define theme colors here
    },
  },
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      // 启用所有 iconify 集合（包括 carbon）
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // Configure web fonts here
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
