# AI 开发指南

本文档为 AI 助手（如 Claude）提供项目上下文和开发规范。

## 项目概述

Quiz Monorepo 是一个问答/测验应用，采用前后端分离架构：

- **前端** (`apps/quiz-app`): Vue 3 + Vite + TypeScript
- **后端** (`apps/quiz-backend`): NestJS + Prisma + MySQL
- **UI 库** (`packages/ui`): 共享组件，使用 Storybook 开发

## 技术栈

| 层级     | 技术                                       |
| -------- | ------------------------------------------ |
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite (app) / tsdown (ui)                   |
| 状态管理 | Pinia                                      |
| 后端框架 | NestJS                                     |
| ORM      | Prisma                                     |
| 数据库   | MySQL                                      |
| 样式方案 | SCSS + UnoCSS (Tailwind 4 preset)          |
| 包管理   | pnpm (workspace)                           |
| 任务编排 | Turborepo                                  |

### 测试框架

| 包           | 单元测试                | E2E/集成测试           |
| ------------ | ----------------------- | ---------------------- |
| quiz-app     | Vitest                  | Cypress                |
| quiz-backend | Jest                    | -                      |
| ui           | Vitest + Vue Test Utils | Playwright (Storybook) |

## CSS 规范

项目使用 **SCSS + UnoCSS** 组合，偏好使用 `@apply` 指令。

### UnoCSS 配置

- 预设: `presetWind4()` (Tailwind 4 兼容)
- 启用: `transformerDirectives()` (支持 @apply)
- 图标: `presetIcons()` 支持自定义 SVG

### 样式编写规范

```scss
// 推荐：使用 @apply 组合 Tailwind 类
.button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg;
  @apply bg-primary text-white hover:bg-primary-600;

  &--disabled {
    @apply cursor-not-allowed opacity-50;
  }
}
```

### UI 库构建

UI 库使用 tsdown 构建，配置了自定义 SCSS 插件来处理 `@apply`：

- 构建时展开所有 `@apply` 指令为最终 CSS
- 输出单一 `style.css` 文件
- 支持 ESM 和 CJS 双格式

## 代码规范

### 注释要求

**重要：所有代码必须添加详细的中文注释。**

```typescript
/**
 * 计算用户答题正确率
 * @param correctCount - 正确题数
 * @param totalCount - 总题数
 * @returns 正确率百分比，保留两位小数
 */
function calculateAccuracy(correctCount: number, totalCount: number): number {
  // 避免除以零的情况
  if (totalCount === 0) return 0;

  // 计算正确率并保留两位小数
  return Math.round((correctCount / totalCount) * 10000) / 100;
}
```

注释规范：

- 函数/方法：使用 JSDoc 格式，说明用途、参数、返回值
- 复杂逻辑：添加行内注释解释为什么这样做
- 组件：说明组件用途、props 含义、事件说明
- 类型定义：说明每个字段的含义

### TypeScript

- 尽量完善类型声明，避免 `any`
- 必要时使用 `any` 需添加注释说明原因

### Vue 组件

- 使用 `<script setup lang="ts">` 语法
- Props/Emits 必须声明类型
- 组件按职责拆分，保持单一职责

### 命名约定

- 组件文件: PascalCase (`QuizCard.vue`)
- 工具函数: camelCase (`formatDate.ts`)
- 常量: UPPER_SNAKE_CASE
- CSS 类: kebab-case 或 BEM (`.radio__control`, `.radio--disabled`)

## 常用命令

```bash
# 开发
pnpm dev              # 启动全部
pnpm dev:frontend     # 仅前端 (10000)
pnpm dev:backend      # 仅后端 (10020)
pnpm dev:ui           # Storybook (10030)

# 构建
pnpm build            # 构建全部（turbo 自动处理依赖）

# 预览（Preview）
pnpm preview          # 预览构建结果（自动清理占用端口，前端 10010，后端 10020，UI 10040）
pnpm preview:frontend # 仅预览前端 (10010)
pnpm preview:clean    # 清理占用的 preview 端口（10010/10020/10040）
pnpm preview:test     # 预览测试环境（用于 E2E 测试）

# 测试
pnpm test             # 运行全部测试（包括 E2E，较慢，5+ 分钟）
pnpm test:unit        # 只运行单元测试（快速，推荐日常使用，1-2 分钟）
pnpm test:frontend    # 前端测试 (Vitest + Cypress)
pnpm test:backend     # 后端测试 (Jest)
pnpm test:ui          # UI 包测试 (Vitest + Playwright)

# 代码质量
pnpm lint             # ESLint 检查
pnpm lint:fix         # 自动修复
pnpm type-check       # 类型检查
pnpm format           # Prettier 格式化

# 数据库
pnpm -C apps/quiz-backend run prisma:generate  # 生成 Prisma Client
pnpm -C apps/quiz-backend run db:seed:test     # 重置测试数据库
```

## Git 规范

### Commit 格式

使用 Conventional Commits：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响逻辑）
refactor: 重构
test: 测试相关
chore: 构建/工具变更
```

### 分支策略

- **简单修改**（文档、拼写、样式微调）：可直接在 `main` 提交
- **功能/Bug/重构**：创建 feature 分支，提交 PR

### PR 要求

- 描述变更内容和原因
- 通过 CI（lint/test/type-check）
- 至少一位 reviewer 审核

### Git Hooks

项目使用 Husky 配置了以下 Git Hooks：

- **pre-commit**: 运行 lint-staged（对暂存文件进行格式化和 lint）
- **pre-push**: 运行 type-check + test:unit（类型检查和单元测试，1-2 分钟）
  - 注意：pre-push 不运行 E2E 测试以提高开发效率
  - 建议在提交 PR 前手动运行完整的 `pnpm test` 确保所有测试通过
  - E2E 测试应由 CI 环境执行

## 常见问题

### 端口占用

如果遇到端口占用错误（如 "Port already in use"）：

```bash
# 清理 preview 端口（10010/10020/10040）
pnpm preview:clean

# 手动清理特定端口
sh ./scripts/cleanup-ports.sh "端口号"
```

`pnpm preview` 命令会自动清理端口，但如果需要手动清理可以使用上述命令。

### Prisma Client 缺失

```bash
pnpm -C apps/quiz-backend run prisma:generate
```

### Query Engine 问题

删除缓存后重试：

```bash
rm -rf node_modules/.prisma
pnpm install
```

### 依赖问题

```bash
pnpm install
pnpm -C <package> run build
```

## 安全注意事项

- 不要提交 `.env*` 文件（含敏感信息）
- 生产环境变量由 CI/部署平台注入
- 测试 secret 由 `scripts/regenerate-test-secret.sh` 生成

## 目录结构

```
quiz-monorepo/
├── apps/
│   ├── quiz-app/           # 前端应用
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── stores/     # Pinia stores
│   │   │   ├── api/
│   │   │   └── router/
│   │   └── cypress/        # E2E 测试
│   └── quiz-backend/       # 后端应用
│       ├── src/
│       │   └── modules/    # 功能模块
│       └── prisma/
│           └── schema.prisma
├── packages/
│   └── ui/                 # 共享 UI 组件
│       ├── src/
│       │   ├── components/
│       │   └── __tests__/  # 单元测试
│       ├── .storybook/     # Storybook 配置
│       ├── unocss.config.ts
│       └── tsdown.config.ts
├── scripts/                # 工具脚本
│   ├── cleanup-ports.sh    # 清理占用端口的进程
│   ├── preview-test.sh     # 启动预览测试环境
│   └── ...
├── turbo.json              # Turborepo 配置
└── pnpm-workspace.yaml     # pnpm workspace 配置
```

## 开发流程

1. 了解需求，确认影响范围
2. 在对应包中开发功能
3. 编写/更新测试
4. 运行 `pnpm lint` 和 `pnpm type-check`
5. 提交代码（遵循 commit 规范）
6. 如有 DB 变更，更新 migration 并说明

## 相关文档

- [README.md](./README.md) - 项目简介和快速上手
- [ROADMAP.md](./ROADMAP.md) - 项目规划
