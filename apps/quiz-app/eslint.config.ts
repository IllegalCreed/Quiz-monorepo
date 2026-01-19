import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginCypress from 'eslint-plugin-cypress'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginOxlint from 'eslint-plugin-oxlint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        // type-aware rules are enabled for TS files via an override below
      },
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        // 指定这个包下的 tsconfig，以免在 monorepo 中出现多个候选目录导致解析器报错
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.app.json', './tsconfig.cypress.json'],
      },
    },
  },

  {
    files: ['cypress.config.ts', 'cypress.config.*.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.app.json', './tsconfig.cypress.json'],
      },
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  skipFormatting,

  ...pluginOxlint.configs['flat/recommended'],
)
