@quiz/ui — 组件库（Radio / RadioGroup）

说明：

- 使用 Vue 3（支持 `defineModel` 类型提示）
- 使用 UnoCSS（Tailwind4 预设）与 SCSS，样式可通过 `@apply` 复用 Tailwind 类
- Storybook 用于组件展示（已配置）

TSConfig 约定：

- `tsconfig.json` (根)：引用（references）子配置，便于独立构建与 IDE 支持
- `tsconfig.app.json`：用于组件源码、类型声明与构建（包含 `declaration: true`）
- `tsconfig.storybook.json`：用于 Storybook 环境（包含 stories / .storybook 的文件）
- `tsconfig.dom.json` 与 `tsconfig.base.json`：包内部的基础与 DOM 配置（来自 `@vue/tsconfig` 推荐项的本地化副本）

开发：

- pnpm install
- pnpm --filter @quiz/ui run storybook
