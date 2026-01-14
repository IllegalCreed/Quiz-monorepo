import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

// `__dirname` isn't available in some editor TS server ESM modes; fall back to process.cwd()
const tsconfigRootDir =
  typeof __dirname !== "undefined" ? __dirname : process.cwd();

const config = [
  { ignores: ["**/dist/**", "**/node_modules/**"] },
  // Prisma-specific files use their own tsconfig so eslint's type-aware rules
  // can resolve types. This avoids the "file not included in tsconfig" error.
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
    plugins: {
      "@typescript-eslint": tsPlugin as any,
    },
    rules: {},
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        typescript: {
          project: "./prisma/tsconfig.prisma.json",
        },
      },
    },
  },
  {
    // Only lint source and scripts TypeScript files with project-aware rules
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
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
];

export default config;
