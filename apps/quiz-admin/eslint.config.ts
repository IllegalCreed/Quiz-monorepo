import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginCypress from "eslint-plugin-cypress";
import pluginVitest from "@vitest/eslint-plugin";
import pluginOxlint from "eslint-plugin-oxlint";
import skipFormatting from "eslint-config-prettier/flat";
import { fileURLToPath } from "url";
// 导入自动导入的全局变量声明
import autoImportGlobals from "./.eslintrc-auto-import.json" with { type: "json" };

/**
 * 将当前配置文件所在目录内联为 `tsconfigRootDir`（ESM 的 __dirname 等价写法）。
 * 说明：`new URL('.', import.meta.url)` 计算当前文件目录，`fileURLToPath(...)` 将 `file:` URL 转为系统路径。
 */

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,ts,mts,tsx}"],
    languageOptions: {
      parserOptions: {
        // 为当前 package 明确解析器配置目录（避免解析到 monorepo 根目录）
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
      // 添加自动导入的全局变量（来自 unplugin-auto-import）
      globals: autoImportGlobals.globals,
    },
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginCypress.configs.recommended,
    files: ["cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}", "cypress/support/**/*.{js,ts,jsx,tsx}"],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

  skipFormatting,
);
