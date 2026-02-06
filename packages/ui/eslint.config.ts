import { globalIgnores } from "eslint/config";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginOxlint from "eslint-plugin-oxlint";
import { fileURLToPath } from "url";
// 导入自动导入的全局变量声明
import autoImportGlobals from "./.eslintrc-auto-import.json" with { type: "json" };

// 将当前配置文件所在目录直接内联为 `tsconfigRootDir`（ESM 的 `__dirname` 等价写法）。
// 说明：`new URL('.', import.meta.url)` 计算当前文件目录，`fileURLToPath(...)` 将 `file:` URL 转为系统路径。
// 兼容性提示：如果配置可能以 data: URL 或 CommonJS 加载，应使用带回退的实现（例如检查 `globalThis.__dirname` 或回退到 `process.cwd()`）。
export default defineConfigWithVueTs(
  {
    name: "packages/ui",
    files: ["**/*.{vue,ts,mts,tsx}"],
    languageOptions: {
      parserOptions: {
        // 为当前 package 明确解析器配置目录（避免解析到 monorepo 根目录）
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
        // 注意：不要在配置的顶层启用 `parserOptions.project`（即不要把 `project` 放在这里）。
        // 原因：将 `project` 放在顶层会在所有文件上开启"基于类型"的解析，可能导致对 `.vue` 单文件组件的解析失败或显著变慢。
        // 正确做法：仅对需要类型信息的文件通过 `overrides` 单独启用 `project`（例如为 `**/*.ts` / `**/*.tsx` 设置 parserOptions.project）。
      },
      // 添加自动导入的全局变量（来自 unplugin-auto-import）
      globals: autoImportGlobals.globals,
    },
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  // Treat `scripts/` as Node scripts where CommonJS `require()` usage is allowed.
  {
    files: ["scripts/**/*.{js,cjs}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
      globals: {
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Treat `scripts/` ESM (`.mjs`) as Node ESM scripts.
  {
    files: ["scripts/**/*.{mjs}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // UI 库基础组件命名规则（遵循 shadcn/ui 命名习惯）
  {
    files: ["src/components/**/*.vue", "src/index.ts"],
    rules: {},
  },

  skipFormatting,

  ...pluginOxlint.configs["flat/recommended"],
);
