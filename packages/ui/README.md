@quiz/ui — 组件库（重构版）

简介

这是项目内的轻量组件库，包含表单与选择类组件（例如 Radio/RadioGroup、CheckRadio 等）。重构后关注以下目标：小而可组合的组件、严格的 TypeScript 类型、在 Storybook 中可复现的示例和易于本地联调的 monorepo 使用体验。

主要特性

- 基于 Vue 3 + Composition API + TypeScript
- Vite 构建与 Storybook 展示
- UnoCSS 原子类优先，支持 SCSS 和 `@apply` 复用
- Vitest 单元测试、ESLint + Prettier 校验
- 导出完整类型声明，方便在 monorepo 中引用

快速开始

1. 安装依赖（在仓库根目录运行）

```bash
pnpm install
```

2. 本地启动 Storybook（用于开发与交互验证）

```bash
pnpm --filter @quiz/ui run storybook
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

常用脚本（概览）

- `storybook` — 启动 Storybook 开发服务器
- `build` — 构建组件包与类型声明
- `test` — 运行 Vitest
- `type-check` — 运行 `vue-tsc --noEmit`
- `lint` / `format` — 代码检查与格式化

开发与调试建议

- 组件源码放在 `src/components`，stories 放在 `src/stories` 或与组件同目录（以示例驱动为主）。
- Story 中编写可交互的 cases（Controls / Actions），便于手工回归与 UI review。
- 在 monorepo 中直接以 workspace 依赖使用该包进行联调（`pnpm --filter` 或 workspace path）。

TypeScript 与构建约定

- `tsconfig.app.json`：用于源码与声明文件生成（`declaration: true`），输出到构建目录。
- `tsconfig.storybook.json`：为 Storybook 环境定制，确保 stories 与 `.storybook` 中的文件被包含。
- `tsconfig.node.json`：工具链与脚本的 Node 配置（Vite / Vitest / ESLint 等）。

常见问题与排查

- Storybook 无法加载组件：检查 `tsconfig.storybook.json` 中的 include/paths，删除 Storybook 缓存后重启。
- 样式不生效：确认 UnoCSS 插件/配置已在 Storybook 的 preview 中引入；如使用 SCSS，确认构建器已正确处理样式加载。
- 类型错误：先运行 `pnpm --filter @quiz/ui run type-check` 定位问题，确认 `paths` 与 `types` 设置无误。

贡献与发布

- 新增组件请同时添加 `*.stories.ts` 与单元测试用例。
- 提交前运行 `pnpm --filter @quiz/ui run type-check && pnpm --filter @quiz/ui run test`。

文件

- 组件源码：src/components
- Stories：src/stories 或组件目录内的 `*.stories.ts`
- Storybook 配置：.storybook/

更多帮助

如需我为 README 加上示例代码片段、CI 工作流或发布步骤（pnpm publish/打包配置），告诉我你的优先项，我可以继续补充。
