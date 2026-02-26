import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import globals from "globals";

const tsconfigRootDir =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      // 允许 _ 前缀标记有意忽略的变量（如解构排除 password: _）
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // 测试文件专用规则
  {
    files: ["**/__tests__/**/*.spec.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off", // Jest mock 中常用 as never / as any 模式
      "@typescript-eslint/no-unsafe-argument": "off", // Prisma 流式 API 类型与 mockResolvedValue 不兼容，需要 as any
      "@typescript-eslint/no-unsafe-return": "off", // mock 函数返回值类型不严格
      "@typescript-eslint/no-explicit-any": "off", // Prisma mock 返回值需要 as any 绕过流式 API 类型检查
      "@typescript-eslint/unbound-method": "off", // NestJS 测试中 expect(controller.method) 模式触发此规则
    },
  },
);
