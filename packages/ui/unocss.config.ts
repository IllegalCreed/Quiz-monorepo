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
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";

export default defineConfig({
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
      collections: {
        custom: FileSystemIconLoader("./src/assets/icons"),
      },
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
