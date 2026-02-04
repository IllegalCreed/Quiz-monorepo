import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "@unocss/vite";

// This config is used for Storybook dev server and other dev tooling.
// Production library build is handled by tsdown (see tsdown.config.ts).
export default defineConfig({
  plugins: [vue(), UnoCSS()],
});
