# AI 开发指南

本文档为 AI 助手提供项目核心开发规范。

## 项目概述

Quiz Monorepo - 开发者技术问答应用，前后端分离架构：

- **前端** (`apps/quiz-app`): Vue 3 + Vite + TypeScript
- **后端** (`apps/quiz-backend`): NestJS + Prisma 7 + MySQL
- **UI 库** (`packages/ui`): 共享组件 + Storybook

## 技术栈速查

| 层级   | 技术                                        |
| ------ | ------------------------------------------- |
| 前端   | Vue 3 Composition API + Vite + Pinia        |
| 后端   | NestJS + Prisma 7 + MySQL (MariaDB adapter) |
| 样式   | SCSS + UnoCSS (Tailwind 4)                  |
| 测试   | Vitest/Jest (单元) + Cypress (E2E)          |
| 包管理 | pnpm workspace + Turborepo                  |

## 核心规范

### 代码风格

- **注释**：所有代码必须添加**中文注释**（函数用 JSDoc，复杂逻辑加行内说明）
- **TypeScript**：完善类型声明，避免 `any`（必要时需注释说明）
- **Vue 组件**：使用 `<script setup lang="ts">`，Props/Emits 必须声明类型
- **命名**：组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE_CASE，CSS BEM 或 kebab-case

### 样式规范

偏好使用 SCSS + UnoCSS `@apply` 指令：

```scss
.button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg;
  @apply bg-primary text-white hover:bg-primary-600;

  &--disabled {
    @apply cursor-not-allowed opacity-50;
  }
}
```

## 常用命令

```bash
# 开发
pnpm dev              # 启动全部 (前端 10000, 后端 10020, UI 10030)
pnpm dev:frontend     # 仅前端
pnpm dev:backend      # 仅后端

# 测试（推荐日常使用）
pnpm test:unit        # 单元测试 (~56 tests, ~5s)
pnpm lint && pnpm type-check  # 代码检查

# 数据库
pnpm -C apps/quiz-backend run prisma:generate  # 生成 Prisma Client
pnpm -C apps/quiz-backend run db:seed:test     # 重置测试数据

# 完整测试（提交 PR 前）
pnpm test             # 包括 E2E (~5 分钟)
```

## Prisma 7 特殊说明

- **配置文件**：`apps/quiz-backend/prisma.config.ts`（不再在 schema.prisma 中配置 url）
- **迁移限制**：`prisma migrate dev` 需要 shadow database 权限，RDS 用户通常没有
- **变通方案**：手动创建 migration SQL，使用 `prisma migrate deploy`（无需 shadow DB）
- **generate 兼容**：配置中用 `process.env.DATABASE_URL ?? "placeholder"` 确保 `prisma generate` 不依赖真实 DB

## Git 规范

### Commit 格式（Conventional Commits）

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
refactor: 重构
test: 测试相关
chore: 构建/工具变更
```

### Git Hooks

- **pre-commit**: lint-staged（自动格式化暂存文件）
- **pre-push**: type-check + test:unit（~1-2 分钟，不含 E2E）

### 分支策略

- 简单修改（文档、拼写）：直接 main
- 功能/Bug/重构：创建 feature 分支 → PR

## 项目结构

```
quiz-monorepo/
├── apps/
│   ├── quiz-app/          # 前端 (Vue 3)
│   │   ├── src/
│   │   │   ├── pages/     # 页面组件
│   │   │   ├── api/       # API 调用
│   │   │   └── stores/    # Pinia stores
│   │   └── cypress/       # E2E 测试
│   └── quiz-backend/      # 后端 (NestJS)
│       ├── src/
│       │   ├── questions/ # 题目模块
│       │   └── answers/   # 答案模块
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── data/seed-test.json
│       └── prisma.config.ts  # Prisma 7 配置
├── packages/ui/           # 共享 UI 库
│   ├── src/components/
│   │   ├── CheckRadio.vue
│   │   └── CheckRadioGroup.vue
│   └── .storybook/
├── docs/                  # 产品文档
│   └── quiz-app-requirements.md
└── scripts/               # 工具脚本
```

## 常见问题

### 端口占用

```bash
pnpm preview:clean  # 清理 10010/10020/10040
```

### Prisma Client 缺失

```bash
pnpm -C apps/quiz-backend run prisma:generate
```

### 依赖问题

```bash
pnpm install
pnpm -C apps/quiz-backend run build  # 如需重新构建后端
```

## 测试策略

| 包           | 单元测试           | E2E 测试                        |
| ------------ | ------------------ | ------------------------------- |
| quiz-app     | Vitest (~6 tests)  | Cypress (mocked + real backend) |
| quiz-backend | Jest (~12 tests)   | -                               |
| ui           | Vitest (~38 tests) | Playwright (Storybook 交互测试) |

**推荐日常使用**：`pnpm test:unit`（快速，~5 秒）
**提交 PR 前**：`pnpm test`（完整，~5 分钟，包含 E2E）

## 数据库架构

### Question（题目）

- `stem`: 题干
- `explanation`: 题目整体解析（可选）
- `tags`: JSON 标签数组
- `options`: 关联选项

### Option（选项）

- `text`: 选项文本
- `isCorrect`: 是否正确答案
- `description`: 选项解析（答题后展示，说明为什么对/错）

## 答题流程

1. 用户选择选项 → 前端提交 POST `/api/answers`
2. 后端返回判定结果 + 所有选项的 description
3. 前端展示：
   - **答对**：绿色高亮 + 展示解析 + 1 秒后自动跳转
   - **答错**：红色高亮 + 绿色正确答案 + 展示所有解析 + 手动点击下一题

## 相关文档

- [README.md](./README.md) - 快速上手
- [ROADMAP.md](./ROADMAP.md) - 功能规划
- [docs/quiz-app-requirements.md](./docs/quiz-app-requirements.md) - 产品需求
