# Quiz Monorepo — 项目说明与快速上手 🧠

**一句话简介：** 本仓库包含一个基于 Vue + Vite 的前端 (`apps/quiz-app`)、使用 NestJS + Prisma 的后端 (`apps/quiz-backend`)，以及共享的 UI 包 (`packages/ui`)。该项目是一个可测、可部署的问答/测验小应用，适合用于学习示例与 CI/E2E 流程演示。

---

## 🚀 快速开始

前提：Node 版本建议使用与仓库一致的 LTS（使用 `pnpm` 管理包）。

1. 安装依赖：

```bash
pnpm install
```

2. 本地开发（同时启动前后端）:

```bash
pnpm run dev            # 使用 Turborepo 并行启动 frontend & backend
pnpm run dev:frontend   # 仅启动前端（Vite，默认端口 10000）
pnpm run dev:backend    # 仅启动后端（Nest，默认端口 10020）
pnpm run dev:ui         # 启动 UI 库的 Storybook（packages/ui，默认端口 10030）
```

3. 可选：在前端启用 mock 数据加速开发：

```bash
export VITE_MOCK=true
pnpm run dev:frontend
```

---

## 📁 项目结构（概要）

- `apps/quiz-app` — 前端（Vue + Vite + Vitest + Cypress）
- `apps/quiz-backend` — 后端（NestJS + Prisma + Jest）
- `packages/ui` — 共享 UI 组件、样式
- `scripts/` — 便捷脚本（例如 DB seed、测试 secret 生成）

> 详见仓库根目录与各 `package.json` 脚本。

---

## 🛠 常用脚本（速查）

- 安装依赖：`pnpm install`
- 开发（前后端并行）：`pnpm run dev`
- 构建（全部）：`pnpm run build`
- 运行测试（全部）：`pnpm run test`

---

## 🧪 测试与 CI

- 单元测试：前端使用 Vitest，后端使用 Jest。运行 `pnpm run test` 会触发 repo 内各包的测试脚本（Turbo 管理）。
- E2E：参考 `apps/quiz-app` 下的 Cypress 配置。E2E 依赖可重置的测试 DB（使用 `db:seed:test`），且后端需启用 `ENABLE_TEST_ENDPOINT=true` 来暴露测试接口（如 `POST /api/test/reset`）。
- CI 注意：根仓库的 `pretest` 钩子会执行 `scripts/regenerate-test-secret.sh`，确保测试 secret 可用。

---

## 🔧 Prisma / 数据库

- 在首次安装或修改 `prisma/schema.prisma` 后运行：

```bash
pnpm -C apps/quiz-backend run prisma:generate
```

- 常见问题：
  - 找不到 `@prisma/client` 或类型不匹配 → 先 `pnpm install`，再 `prisma:generate`。
  - Query Engine 二进制问题 → 删除 `node_modules/.prisma` 后重试或使用 `--force`。

---

## 📦 部署（要点）

- 构建（推荐，按依赖顺序构建所有包）：`pnpm run build`（使用 Turbo，会先构建 `packages/ui` 等依赖）
- 单独构建前端（若你只构建前端，请先构建 UI 包）：
  - 构建 UI：`pnpm -C packages/ui run build`
  - 构建前端：`pnpm -C apps/quiz-app run build`
- 单独构建后端：`pnpm -C apps/quiz-backend run build`，生产启动 `pnpm -C apps/quiz-backend run start:prod`
- Secrets 与环境变量应该由 CI/CD 或运行平台注入（不要提交 `.env.production.local` 等到仓库）。

---

## 🧰 开发流程与约定

- 代码风格：遵循仓库的 ESLint / Prettier 配置。
- 分支策略：feature 分支、PR、至少一位 reviewer、CI 通过后合并。
- PR 检查重点：功能、类型、测试覆盖、E2E 影响、变更说明。

---

## ❓ 常见问题与排查（简短）

- “E2E 报错数据库不可用”：确认已运行 `pnpm -C apps/quiz-backend run db:seed:test`，并用 `start:test` 启动后端。
- “Prisma client 缺失”：运行 `pnpm -C apps/quiz-backend run prisma:generate`。

---

## 🙌 贡献 & 联系

欢迎提交 PR。请在 PR 描述中包含复现步骤、相关测试以及变更影响范围。

---

> 该 README 侧重于快速上手与常用命令。更详细的维护规约请参见 `DEV_GUIDELINES.md`（仓库根目录）。
