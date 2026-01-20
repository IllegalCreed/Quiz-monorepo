import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginCypress from 'eslint-plugin-cypress'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginOxlint from 'eslint-plugin-oxlint'
import { fileURLToPath } from 'url'

/**
 * 将当前配置文件所在目录内联为 `tsconfigRootDir`（ESM 的 __dirname 等价写法）。
 * 说明：`new URL('.', import.meta.url)` 计算当前文件目录，`fileURLToPath(...)` 将 `file:` URL 转为系统路径。
 * 兼容性提示：如需兼容 data: URL 或 CommonJS 加载，请使用带回退的实现（例如检查 globalThis.__dirname 或回退到 process.cwd()）。
 */

// 说明：如果需要在 `.vue` 文件的 `<script>` 中启用除 `ts` 之外的语言（例如 `tsx`），
// 可参考官方高级配置并按需启用 `configureVueProject({ scriptLangs: [...] })`。
// 参考：https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
    languageOptions: {
      parserOptions: {
        // 为当前 package 明确解析器配置目录（避免解析到 monorepo 根目录）
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
        // 注意：不要在配置顶层启用 `parserOptions.project`，仅在需要类型信息的 overrides 中单独启用
      },
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.configs['flat/recommended'],
  skipFormatting,
)
