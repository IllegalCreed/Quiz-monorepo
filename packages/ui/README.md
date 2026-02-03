@quiz/ui — 组件库（Radio / RadioGroup）

说明

- 这是一个小型的组件库，包含 `CheckRadio`、`CheckRadioGroup` 等组件，主要用于项目内表单/选择类交互。
- 以 **Storybook** 作为主要的展示与调试环境，stories 同时作为组件使用示例与手工测试用例。

技术栈

- **框架**：Vue 3 + Composition API + TypeScript
- **构建工具**：Vite
- **样式**：UnoCSS（Tailwind 4 预设）+ SCSS（可使用 `@apply` 复用 UnoCSS/Tailwind 类）
- **组件展示/调试**：Storybook
- **单元测试**：Vitest
- **代码检查**：ESLint（+ TypeScript 支持）
- **代码格式化**：Prettier / stylelint（如适用）
- **类型声明**：`tsconfig.app.json` 开启 `declaration: true`，构建产出声明文件

快速开始 🚀

1. 安装依赖

```bash
pnpm install
```

2. 启动 Storybook（开发 & 调试）

```bash
pnpm --filter @quiz/ui run storybook
# 打开浏览器访问 Storybook（通常为 http://localhost:10030）
```

3. 运行单元测试

```bash
pnpm --filter @quiz/ui run test
```

4. 类型检查 / Lint / 格式化

```bash
pnpm --filter @quiz/ui run type-check
pnpm --filter @quiz/ui run lint
pnpm --filter @quiz/ui run format
```

开发与调试流程 🔧

- 在 `src/components` 中实现组件，组件应保持小而单一、带清晰的 props/事件定义。
- 在 `src/stories`（或与组件同目录）添加对应的 `*.stories.ts`，覆盖常见使用场景与边界条件（正常/禁用/异常输入等）。
- 使用 Storybook 的 Controls、Actions 快速调试 props 与事件；同时打开 Vue Devtools 查看组件内部状态。
- 如需在真实上下文中联调，使用 monorepo 的局部依赖（pnpm workspace）直接在上层应用中引入 `@quiz/ui`。
- 编辑样式时，优先使用 UnoCSS 的原子类或 `@apply` 以保持风格一致。
- 运行测试时可使用 `--watch` 模式快速回归检查。

TSConfig 约定

- `tsconfig.json` (根)：使用 project references 引用子配置（`tsconfig.app.json`、`tsconfig.storybook.json`、`tsconfig.node.json`），便于独立构建与 IDE 支持。
- `tsconfig.app.json`：用于组件源码、类型声明与构建（开启 `declaration: true`，输出到 `dist/types`），`extends` 自 `@vue/tsconfig/tsconfig.dom.json` 以获得 Browser/DOM 相关的默认配置。
- `tsconfig.storybook.json`：用于 Storybook 环境（包含 `.storybook` 的文件），继承 `tsconfig.app.json` 并在编译选项中额外声明 Storybook 所需的 `types` 与 `composite` 设置。
- `tsconfig.node.json`：用于工具链/Node 相关的配置（Vite、Vitest、Cypress、ESLint 配置文件等），`extends` 自 `@tsconfig/node24/tsconfig.json`。

注意：本包并未包含 `tsconfig.dom.json` 或 `tsconfig.base.json` 的本地副本；如果需要本地化配置，可通过复制并修改相应的 `@vue/tsconfig`/`@tsconfig` 文件来实现。

常见问题与排查建议 ⚠️

- Storybook 无法显示组件：检查 `tsconfig.storybook.json` 是否包含 stories 的路径；重启 Storybook，清理 Vite 缓存。
- 样式未生效：确认 UnoCSS 已在 Storybook 配置中被引入（`.storybook/preview.*`），并检查是否有样式隔离问题。
- 类型报错（TS）：优先运行 `pnpm --filter @quiz/ui run type-check`，并确认 `tsconfig` 的 `paths`/`types` 配置是否正确。
