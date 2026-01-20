import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "@unocss/vite";

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "QuizUI",
      fileName: (format) => (format === "es" ? "index.esm.js" : "index.cjs.js"),
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled into the library
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
