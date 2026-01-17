import { globalIgnores } from "eslint/config";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginOxlint from "eslint-plugin-oxlint";

export default defineConfigWithVueTs(
  {
    name: "packages/ui",
    files: ["**/*.{vue,ts,mts,tsx}"],
    languageOptions: {
      parserOptions: {
        // Make parser resolution unambiguous inside this package
        tsconfigRootDir: __dirname, // don't set `project` at the global level to avoid failing on .vue files;
        // enable type-aware rules only for TS files via an override below
      },
    },
  },

  // Enable type-aware linting for TypeScript files only
  {
    files: ["**/*.ts", "**/*.mts", "**/*.tsx", "src/**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.eslint.json"],
      },
    },
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.eslint.json"],
      },
    },
  },

  skipFormatting,

  ...pluginOxlint.configs["flat/recommended"],
);
