import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

// Keep a minimal, clear config: ignore build and node modules, handle Prisma with its
// own tsconfig, and apply project-aware rules to source and scripts.
const tsconfigRootDir =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

export default [
  { ignores: ["**/dist/**", "**/node_modules/**"] },
  eslintPluginPrettierRecommended,

  // Prisma files use their own tsconfig so type-aware rules work correctly
  {
    files: ["prisma/**/*.ts"],
    languageOptions: {
      parser: tsParser as any,
      parserOptions: {
        project: ["./prisma/tsconfig.prisma.json"],
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

  // Source and scripts: project-aware rules + Prettier integration
  {
    files: ["src/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      parser: tsParser as any,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin as any,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
    settings: {
      "import/parsers": { "@typescript-eslint/parser": [".ts"] },
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
    },
  },
];
