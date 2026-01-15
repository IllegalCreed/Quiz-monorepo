import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

const tsconfigRootDir =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  // Global language options similar to backend-template but using ESM
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
  },

  // Prisma files: use a separate tsconfig for type-aware rules
  {
    files: ["prisma/**/*.ts"],
    languageOptions: {
      parser: tsParser as any,
      parserOptions: {
        tsconfigRootDir,
        sourceType: "module",
      },
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./prisma/tsconfig.prisma.json" },
      },
    },
  },

  // Source & scripts: project-aware rules + Prettier
  {
    files: ["src/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      parser: tsParser as any,
      parserOptions: {
        tsconfigRootDir,
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
    settings: {
      "import/parsers": { "@typescript-eslint/parser": [".ts"] },
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
    },
  },
);
