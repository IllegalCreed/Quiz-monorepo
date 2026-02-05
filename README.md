# Quiz Monorepo

一个基于 Vue + NestJS + MySQL 的问答/测验应用，采用 monorepo 架构。

## 项目结构

```
apps/
  quiz-app/       # 前端 (Vue + Vite + Vitest + Cypress)
  quiz-backend/   # 后端 (NestJS + Prisma + Jest)
packages/
  ui/             # 共享 UI 组件库 (Storybook)
```

## 环境要求

- Node.js LTS
- pnpm 10+

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发环境（前后端并行）
pnpm dev

# 或分别启动
pnpm dev:frontend   # 前端 http://localhost:10000
pnpm dev:backend    # 后端 http://localhost:10020
pnpm dev:ui         # Storybook http://localhost:10030
```

### Mock 模式开发

前端支持 mock 数据，无需启动后端：

```bash
VITE_MOCK=true pnpm dev:frontend
```

## 常用命令

| 命令              | 说明         |
| ----------------- | ------------ |
| `pnpm dev`        | 启动开发环境 |
| `pnpm build`      | 构建所有包   |
| `pnpm test`       | 运行所有测试 |
| `pnpm lint`       | 代码检查     |
| `pnpm type-check` | 类型检查     |

## 测试

```bash
# 运行所有测试
pnpm test

# 单独运行
pnpm test:frontend    # 前端单元测试 (Vitest)
pnpm test:backend     # 后端单元测试 (Jest)
```

### E2E 测试

E2E 测试需要测试数据库：

```bash
# 1. 准备测试数据库
pnpm -C apps/quiz-backend run db:seed:test

# 2. 启动测试后端
pnpm -C apps/quiz-backend run start:test

# 3. 运行 E2E
pnpm -C apps/quiz-app run test:e2e
```

## 数据库

首次安装或修改 schema 后：

```bash
pnpm -C apps/quiz-backend run prisma:generate
```

## 部署

```bash
# 构建（推荐使用 turbo，自动处理依赖顺序）
pnpm build

# 或单独构建
pnpm build:ui        # 需先构建
pnpm build:frontend
pnpm build:backend

# 生产环境启动后端
pnpm -C apps/quiz-backend run start:prod
```

生产环境需配置环境变量：`DATABASE_URL`、JWT secret 等。

## 开发规范

- Commit 使用 [Conventional Commits](https://conventionalcommits.org/)
- 代码风格遵循仓库 ESLint/Prettier 配置
- 详细开发指南见 [CLAUDE.md](./CLAUDE.md)
- 项目规划见 [ROADMAP.md](./ROADMAP.md)

## License

ISC
