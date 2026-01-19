import { globalIgnores } from "eslint/config";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginOxlint from "eslint-plugin-oxlint";

// Use `globalThis.__dirname` when available, otherwise fall back to CWD. Avoid `import.meta` because some tools load configs via data: URLs.
let __dirname: string;
const gdir = (globalThis as unknown as { __dirname?: string }).__dirname;
if (typeof gdir === "string") {
  __dirname = gdir;
} else {
  __dirname = process.cwd();
}

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

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  skipFormatting,

  ...pluginOxlint.configs["flat/recommended"],
);
