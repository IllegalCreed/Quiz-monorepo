# Quiz Monorepo 🧠

这是一个简单的题目复习网站的 monorepo（pnpm + Turborepo），包含前端（Vue 3 + Vite + Vitest + Cypress）和后端（NestJS + Prisma + MySQL）的实现。

---

## 目录结构（简要）

- package.json — 根级脚本与配置（dev/build/test/type-check 等）
- apps/
  - quiz-app/ — 前端应用（Vite + Vue 3）
    - package.json — 前端脚本（dev/build/test/test:unit/test:e2e 等）
    - src/ — 源代码（页面、composables、stores）
    - cypress/ — e2e 测试
  - quiz-backend/ — 后端服务（NestJS）
    - package.json — 后端脚本（dev/build/prisma/db:seed/test 等）
    - prisma/ — Prisma schema & seed
- packages/ — （可放共享组件/库，例如 UI）

---

## 快速开始（本地开发）

1. 安装依赖：

```bash
pnpm install
```

2. 启动开发环境（在 monorepo 根目录并行启动前后端）：

```bash
pnpm run dev
# 或者分别启动
pnpm -C apps/quiz-app run dev
pnpm -C apps/quiz-backend run dev
```

3. 如果需要运行数据库迁移/生成 client：

```bash
# 配置 DATABASE_URL（或使用 apps/quiz-backend/.env.development.local）
pnpm -C apps/quiz-backend run prisma:generate
pnpm -C apps/quiz-backend run prisma:migrate
pnpm -C apps/quiz-backend run db:seed
```

注意：Prisma 已迁移至 v7，数据源 URL 已移到 `prisma/prisma.config.ts`，运行时需要为 PrismaClient 提供一个适配器（本项目使用 `@prisma/adapter-mariadb`）。

---

## 脚本说明（根目录）

- `pnpm run dev` — 并行启动所有包的 dev（通过 turbo）。
- `pnpm run build` — 并行运行各包的构建。
- `pnpm run test` — 运行各包的 `test`（由 turbo 协调）。
- `pnpm run type-check` — 运行各包的类型检查（前端用 `vue-tsc`，后端用 `tsc`）。
- `pnpm run format` — 运行 Prettier。

前端（apps/quiz-app）脚本要点：

- `test`（默认） => 会运行 `test:all`（先执行 `test:unit:ci`，再执行 `test:e2e`）。
- `test:unit` => 本地 watch 模式下运行单元测试（`vitest`）。
- `test:unit:ci` => 非交互式运行单元测试（`vitest run`，适合 CI/pre-push）。
- `test:e2e` => 使用 `start-server-and-test` 启动 preview 并执行 `cypress run --e2e`（**无头运行**）。

后端（apps/quiz-backend）脚本要点：

- `dev`、`build`、`test`（Jest）。
- `prisma:generate` / `prisma:migrate` / `db:seed`。

- 如果你希望脚本在 RDS 上创建 test/prod DB 与用户：
  - 复制 `apps/quiz-backend/.env.create-db.example` → `apps/quiz-backend/.env.create-db.local`，填写能创建数据库/用户的账号（例如 root）。
  - 默认执行以下命令会在 RDS 上 **只创建 test DB + user**（并打印密码）：
    ```bash
    pnpm -C apps/quiz-backend run db:create:all
    ```
  - 若确实要同时创建 prod DB，请在运行前设置确认变量以避免误操作：
    ```bash
    CONFIRM_CREATE_PROD=true pnpm -C apps/quiz-backend run db:create:all
    ```
  - 脚本会打印生成的密码（如未显式提供），请把这些值保存到 `apps/quiz-backend/.env.test.local` 与 `apps/quiz-backend/.env.production.local` 并妥善保管。
  - 注意：我无法直接替你在阿里云上运行脚本——你需要在有权限的环境中执行上述命令（CLI 或者通过有权限的同事）。

- 新增可用于分环境的数据脚本：
  - `db:seed:system`：写入基础系统必需的数据（幂等，适合角色/配置/管理员用户等）。
  - `db:seed:test`：写入测试数据（用于 CI / E2E，便于还原）。
  - `db:reset`：清空测试数据并重新运行 `db:seed:test`（仅用于 test/dev，不会在生产上运行，脚本在运行前会进行安全检查）。

- 后端提供一个受保护的测试接口：`POST /test/reset`，仅在 `ENABLE_TEST_ENDPOINT=true` 时启用，调用它会对 test DB 进行重置（适合 E2E 在每个用例前重置数据以保证可复现性）。
- `type-check` 使用了一个包内 wrapper 脚本（避免 pnpm 递归运行时额外 flags 影响 `tsc`）。

---

## Husky 钩子与工作流

- `.husky/pre-commit` — 运行 `lint-staged`（格式化 & ESLint 自动修复）。
- `.husky/pre-push` — 现在会执行：
  1. `pnpm run type-check`（根脚本，分别检查前/后端）
  2. `pnpm run test`（根脚本，由 turbo 运行每个包的 `test`，前端会先做单元测试再做 e2e）

→ 这是为了确保 PR/推送前保持类型与测试的健康状态。

提示：如果希望在本地跳过耗时的 e2e，可直接只运行单元测试：`pnpm -C apps/quiz-app run test:unit:ci`。

---

## 测试策略 & 实践

- 单元测试：`vitest`（前端），`jest`（后端）。
- E2E 测试：`cypress`（运行于无头 Electron，`test:e2e` 会启动 preview 并执行测试）。

- 如果你想让 E2E 直接使用后端和真实 DB（非 mock），可以：
  1. 在 `apps/quiz-backend/.env.test.local` 中配置好 `DATABASE_URL` 指向你的 `quiz_test` 数据库，并设置 `ENABLE_TEST_ENDPOINT=true`。
  2. 启动后端：`pnpm -C apps/quiz-backend run dev`（确保 `NODE_ENV=test` 或 `ENABLE_TEST_ENDPOINT=true`）。
  3. 运行 E2E：`pnpm -C apps/quiz-app run test:e2e`。

  测试过程中会调用 `POST /test/reset` 重置 test DB，保证每个用例运行前数据可复现。

- 为了避免 pre-push 在 `vitest` watch 模式下等待按键，我们在 pre-push 中使用了非交互式的 `vitest run`（`test:unit:ci`）。

---

## 贡献 & 提交规范

- 在提交前会自动运行 `lint-staged`（格式化 & lint）。
- 请保持小的、可审查的提交；feature 放到单独分支并发 PR。

---

## 其它说明

- Prisma v7 迁移说明：datasource URL 从 `schema.prisma` 移除，放到 `prisma/prisma.config.ts`；运行时需要给 PrismaClient 提供驱动 adapter（例如 `PrismaMariaDb`）。
- 如果你在 CI 中遇到问题（例如 e2e 不稳定），建议把 e2e 单独运行或通过环境变量控制是否执行。

---

如需我把 README 推送并把所有本地未提交变动一并提交并推到远端，请确认，我会执行提交与推送（并运行一次 pre-push 验证）。
