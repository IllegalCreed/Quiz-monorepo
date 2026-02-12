# AI 开发指南

本文档为 AI 助手提供项目核心开发规范。

## 项目概述

Quiz Monorepo - 开发者技术问答应用，前后端分离架构：

- **前端** (`apps/quiz-app`): Vue 3 + Vite + TypeScript
- **管理后台** (`apps/quiz-admin`): Vue 3 + Element Plus + UnoCSS
- **后端** (`apps/quiz-backend`): NestJS + Prisma 7 + MySQL
- **UI 库** (`packages/ui`): 共享组件 + Storybook

## 技术栈速查

| 层级     | 技术                                        |
| -------- | ------------------------------------------- |
| 前端     | Vue 3 Composition API + Vite + Pinia        |
| 管理后台 | Vue 3 + Element Plus + UnoCSS + Pinia       |
| 后端     | NestJS + Prisma 7 + MySQL (MariaDB adapter) |
| 样式     | SCSS + UnoCSS (Tailwind 4)                  |
| 测试     | Vitest/Jest (单元) + Cypress (E2E)          |
| 包管理   | pnpm workspace + Turborepo                  |

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

**CSS 布局最佳实践**：

- **全屏高度布局**：使用 flex 链式传递

  ```scss
  #app {
    @apply min-h-screen flex flex-col;
  }
  main {
    @apply flex-1 flex flex-col;
  }
  // 让子组件撑满 main
  :deep(> *) {
    @apply flex-1 flex flex-col;
  }
  ```

- **Grid 布局**：精确控制行列比例

  ```scss
  .page {
    @apply grid;
    grid-template-rows: 1fr 2fr; // 标题 1/3，内容 2/3
    grid-template-columns: 1fr;
  }
  .title {
    place-self: center;
  } // 水平垂直居中
  .content {
    align-self: start;
  } // 顶对齐
  ```

- **视觉效果技巧**：
  - 渐变文字：`background: linear-gradient(...)` + `-webkit-background-clip: text`
  - 泛光效果：伪元素 + `radial-gradient` + `filter: blur(40-50px)`（GPU 加速）
  - 深浅模式区分：浅色用 Tailwind 300 级，深色用 500 级，确保对比度

## 常用命令

```bash
# 开发
pnpm dev              # 启动全部 (前端 10000, 后端 10020, UI 10030)
pnpm dev:frontend     # 仅前端
pnpm dev:backend      # 仅后端
pnpm -C apps/quiz-admin dev  # 管理后台 (10050)

# 代码质量检查
pnpm run check        # 快速检查：lint + type-check + test:unit (~5s)
pnpm run check:e2e    # 完整检查：包含 E2E 测试 (~5min)
pnpm lint:fix         # 自动修复代码格式问题

# 数据库管理（后端）
pnpm -C apps/quiz-backend run migrate:deploy:dev   # 应用迁移到开发库
pnpm -C apps/quiz-backend run migrate:status       # 查看所有环境迁移状态
pnpm -C apps/quiz-backend run db:studio            # 打开数据库可视化工具
pnpm -C apps/quiz-backend run db:seed:dev          # 插入开发数据
pnpm -C apps/quiz-backend run db:reset:test        # 重置测试数据

# 测试
pnpm test:unit        # 单元测试 (~56 tests, ~5s)
pnpm test             # 完整测试（包括 E2E，~5 分钟）
```

### 后端脚本详解

所有后端脚本使用 `dotenv-cli` 自动加载环境变量，支持两层配置：

- `.env.{environment}` - 团队共享配置（已提交）
- `.env.{environment}.local` - 个人敏感配置（不提交，会覆盖同名变量）

**数据库迁移**：

```bash
pnpm run migrate:deploy:dev    # 开发库
pnpm run migrate:deploy:test   # 测试库
pnpm run migrate:deploy:prod   # 生产库
pnpm run migrate:status         # 查看所有环境状态
```

**数据库管理**：

```bash
pnpm run db:studio:dev          # 打开开发库可视化界面
pnpm run db:seed:dev            # 插入基础数据
pnpm run db:reset:test          # 重置测试库（清空+插入）
```

**代码检查**：

```bash
pnpm run check                  # 快速检查（日常使用）
pnpm run check:e2e              # 完整检查（提交 PR 前）
```

更多脚本说明见 [apps/quiz-backend/scripts/README.md](apps/quiz-backend/scripts/README.md)

```

## Prisma 7 特殊说明

- **配置文件**：`apps/quiz-backend/prisma.config.ts`（不再在 schema.prisma 中配置 url）
- **Placeholder URL**：配置使用 `process.env.DATABASE_URL ?? "placeholder"` 确保 `prisma generate` 不依赖真实数据库
- **环境变量管理**：采用两层配置策略（见下文"环境变量文件"）
- **迁移限制**：`prisma migrate dev` 需要 shadow database 权限，RDS 用户通常没有
- **变通方案**：手动创建 migration SQL，使用 `prisma migrate deploy`（无需 shadow DB）

### 环境变量文件

采用**两层配置策略**，清晰分离团队共享配置和敏感信息：

| 文件 | 提交到仓库 | 用途 |
|------|-----------|------|
| `.env.development` | ✅ 是 | 开发环境共享配置（端口、环境变量等） |
| `.env.test` | ✅ 是 | 测试环境共享配置 |
| `.env.production` | ✅ 是 | 生产环境共享配置 |
| `.env.development.local` | ❌ 否 | 开发环境敏感配置（数据库密码等） |
| `.env.test.local` | ❌ 否 | 测试环境敏感配置 |
| `.env.production.local` | ❌ 否 | 生产环境敏感配置 |
| `.env.create-db.local` | ❌ 否 | 数据库初始化脚本配置 |

**配置分层原则**：
- **非敏感配置**（PORT、NODE_ENV、ENABLE_TEST_ENDPOINT 等）放在 `.env.{environment}` 中，团队共享
- **敏感配置**（DATABASE_PASSWORD、TEST_RESET_SECRET 等）放在 `.env.{environment}.local` 中，本地覆盖

**新成员上手**：
1. `git clone` 项目后，配置文件已包含团队默认设置
2. 复制 `.env.{environment}.example` 到 `.env.{environment}.local`
3. 填入真实数据库密码（从团队密码管理器获取）
4. `pnpm dev` 直接启动 ✅

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
│ ├── quiz-app/ # 前端 (Vue 3)
│ │ ├── src/
│ │ │ ├── pages/ # 页面组件
│ │ │ ├── api/ # API 调用
│ │ │ └── stores/ # Pinia stores
│ │ └── cypress/ # E2E 测试
│ ├── quiz-admin/ # 管理后台 (Vue 3 + Element Plus)
│ │ ├── src/
│ │ │ ├── views/ # 页面（login/dashboard/users/admins/system）
│ │ │ ├── api/mock/ # Mock API（account/users/admins）
│ │ │ ├── stores/ # Pinia stores
│ │ │ ├── router/ # 动态路由 + 权限
│ │ │ └── styles/ # SCSS 主题 + Element Plus 覆盖
│ │ └── IMPLEMENTATION.md # 详细实施指南
│ └── quiz-backend/ # 后端 (NestJS)
│ ├── src/
│ │ ├── questions/ # 题目模块
│ │ └── answers/ # 答案模块
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── data/seed-test.json
│ └── prisma.config.ts # Prisma 7 配置
├── packages/ui/ # 共享 UI 库
│ ├── src/components/
│ │ ├── CheckRadio.vue
│ │ └── CheckRadioGroup.vue
│ └── .storybook/
├── docs/ # 产品文档
│ └── quiz-app-requirements.md
└── scripts/ # 工具脚本

````

## 常见问题

### 端口占用

```bash
pnpm clean:ports  # 清理所有端口（dev + preview）
````

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
| quiz-admin   | -                  | Cypress (计划中)                |
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
