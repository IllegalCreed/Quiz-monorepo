import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "@unocss/vite";
import unpluginDts from "unplugin-dts/vite";
import { execSync } from "child_process";

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    unpluginDts({
      tsconfigPath: "./tsconfig.app.json",
      bundleTypes: true,
      insertTypesEntry: true,
      processor: "vue",
      // Run d.ts validation after the plugin finishes emitting declaration files
      afterBuild: () => {
        // Run tsc directly after d.ts files are emitted to validate the declarations
        execSync("tsc -p tsconfig.dtscheck.json", { stdio: "inherit" });
      },
    }),
  ],
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
