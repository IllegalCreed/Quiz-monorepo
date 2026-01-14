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

### 数据库与 Seed 策略（清晰说明） 🔧

本项目建议在云环境（例如阿里云 RDS）上为不同用途准备不同的数据库：

- **prod（生产）** — 生产数据，绝对禁止自动化脚本/CI 在其上执行破坏性操作（如 reset/seed）。
- **dev（开发）** — 团队/个人日常开发使用的数据库，可以包含更多数据、调试用账号等。
- **test（测试 / CI）** — 专门用于自动化测试（CI / E2E），**必须可被重置**以保证每次测试的数据确定性。

为什么要区分：测试需要完全可控、可重置的数据集；生产数据会不断变化且敏感，**任何自动化 reset/seed 操作都不应在 production 上默认运行**。

#### Seed 的两类（system vs test）

- **system seed（基础系统数据）**：写入系统必须的、长期存在的数据（例如管理员账号、基础角色、配置项）。应当是**幂等**的（重复运行不产生重复条目）。脚本：`pnpm -C apps/quiz-backend run db:seed:system`。
- **test seed（测试数据）**：写入用于测试的数据集合（固定题目、示例用户等），脚本会在运行前 **清空相关表** 再插入数据，保证每次运行后数据一致。脚本：`pnpm -C apps/quiz-backend run db:seed:test`。
- **组合（初始化 test）**：`pnpm -C apps/quiz-backend run db:setup:test` 会执行迁移 + system seed + test seed，适合 CI 或初次准备 test 环境。

#### db:reset（用于测试）

- `pnpm -C apps/quiz-backend run db:reset`：会**清空测试数据并重新运行 test seed**（脚本内部含安全检查，会拒绝对生产库执行）。
- 我们也提供了后端 HTTP 接口 `POST /test/reset`（仅在 `ENABLE_TEST_ENDPOINT=true` 时启用），E2E 测试可以在每个用例前调用此接口以保证每个用例从确定性数据开始。

> 安全注意：脚本在执行前会检查数据库名与 `NODE_ENV`，若命中 **production** 特征（例如数据库名包含 `prod` 或 NODE_ENV=production），会拒绝执行，除非你显式设置覆盖变量（不建议在常规流程中使用）。

#### 如何在 RDS 上创建数据库 / 用户

- 使用仓库提供的 `create-db` 脚本（需要具有建库权限的账号，例如 root）：

  ```bash
  # 将示例 env 复制并填入有权限的账号
  cp apps/quiz-backend/.env.create-db.example apps/quiz-backend/.env.create-db.local
  # 编辑 .env.create-db.local，设置 DB_ROOT_USERNAME / DB_ROOT_PASSWORD / DATABASE_HOST 等

  # 在有权限的环境（可访问 RDS 且用有权限账号）运行：
  pnpm -C apps/quiz-backend run db:create
  ```

- 脚本会创建 `quiz_dev`、`quiz_test`、`quiz_prod`（及对应用户），并在输出中打印随机生成的密码（如果你没有在 env 中提供）。
- 运行后，请把输出的密码手动保存到：
  - `apps/quiz-backend/.env.test.local`（测试库）
  - `apps/quiz-backend/.env.production.local`（生产库）

#### E2E 测试建议

- 若你要在本地或 CI 用真实后端跑 E2E：
  1. 确保 `apps/quiz-backend/.env.test.local` 配置了正确的 `DATABASE_URL`（指向 test DB）并且 `ENABLE_TEST_ENDPOINT=true`。
  2. 启动后端：`pnpm -C apps/quiz-backend run dev`（或 production 模式时不要启用 test endpoint）。
  3. 运行 E2E：`pnpm -C apps/quiz-app run test:e2e`。
  4. 测试会在每个用例前调用 `POST /test/reset`（示例见 `apps/quiz-app/cypress/e2e/real.cy.ts`），确保每个用例的前置数据一致性。

---

如需我把 README 的某处再精简或加入样例命令（例如把 `POST /test/reset` 的 curl 示例写进 README），告诉我具体位置，我会补上。

- 新增可用于分环境的数据脚本：
- `db:seed:system`：写入基础系统必需的数据（幂等，适合角色/配置/管理员用户等）。此脚本现在以 TypeScript 实现（`ts-node prisma/seed-system.ts`）。
- `db:seed:test`：写入测试数据（用于 CI / E2E，便于还原）。当前以 TypeScript 实现（`ts-node prisma/seed-test.ts`）。
- `db:reset`：清空测试数据并重新运行 `db:seed:test`（仅用于 test/dev，不会在生产上运行，脚本在运行前会进行安全检查）。当前以 TypeScript 实现（`ts-node prisma/reset-test.ts`）。

- 后端提供一个受保护的测试接口：`POST /test/reset`，仅在 `ENABLE_TEST_ENDPOINT=true` 时启用，调用它会对 test DB 进行重置（适合 E2E 在每个用例前重置数据以保证可复现性）。
- `type-check` 使用了一个包内 wrapper 脚本（避免 pnpm 递归运行时额外 flags 影响 `tsc`）。

- 后端：添加了 **ESLint**（TypeScript 支持），可通过下面命令运行：
  - `pnpm -C apps/quiz-backend run lint` — 检查后端代码中的 lint 警告/错误。
  - `pnpm -C apps/quiz-backend run lint:fix` — 自动尝试修复可修复的问题。

  我已添加 `apps/quiz-backend/.eslintrc.js` 与兼容的 `eslint.config.cjs`，并把相关 devDependencies 安装到 `apps/quiz-backend`。

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
  1. 在 `apps/quiz-backend/.env.test.local` 中配置好 `DATABASE_URL` 指向你的 `quiz_test` 数据库，并设置 `ENABLE_TEST_ENDPOINT=true`（参考 `apps/quiz-backend/.env.test.example`）。
  2. 启动后端（test 模式）：`pnpm -C apps/quiz-backend run start:test`（或直接执行下一步让 `test:e2e` 自动启动后端）。
  3. 前端会以 test 模式先编译一份（`pnpm -C apps/quiz-app run build:test`），以避免与 production 的 `dist` 混淆；然后运行 E2E：`pnpm -C apps/quiz-app run test:e2e`（这会尝试自动启动后端的 `start:test`）。

  测试过程中会调用 `POST /api/test/reset` 重置 test DB，保证每个用例运行前数据可复现。

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
