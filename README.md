# Quiz Monorepo — 运行模式与命令速查 🧠

此文档基于当前仓库的真实 `package.json` 脚本（根、`apps/quiz-app`、`apps/quiz-backend`），只列出三种常用运行模式（Development / Test / Production）下的**实际命令**与简要说明，便于快速查阅。

---

## 1) 开发（Development） ✅

用途：本地开发、热重载。

常用命令：

- 安装依赖：

  ```bash
  pnpm install
  ```

- 并行启动前后端（根目录，使用 Turborepo）：

  ```bash
  pnpm run dev
  ```

- 单独启动前端：

  ```bash
  pnpm run dev:frontend
  # 等价于: pnpm -C apps/quiz-app run dev
  ```

- 单独启动后端：

  ```bash
  pnpm run dev:backend
  # 等价于: pnpm -C apps/quiz-backend run dev
  ```

说明：前端使用 Vite（开发默认端口 10000，预览端口 10010）；后端使用 Nest（默认端口 10020）。开发时可使用 `apps/*/.env.development.local` 覆盖环境变量，前端可启用 `VITE_MOCK=true` 加速开发。

---

## 2) 测试（Test / CI / E2E） 🧪

用途：CI、单元测试与 E2E（需要可重置的测试数据库）。

准备与常用命令（以仓库内脚本为准）：

- 配置测试 env（示例）：
  - `apps/quiz-backend/.env.test.local`（设置 `DATABASE_URL` 指向测试库并 `ENABLE_TEST_ENDPOINT=true`）

- 重置并 seed 测试 DB（**注意：`db:seed:test` 会清空并重建测试数据，适用于 CI/E2E**）：

  ```bash
  pnpm -C apps/quiz-backend run db:seed:test
  ```

  （`db:seed` 在本地相当于 `db:seed:dev`；不要在生产库上运行 `db:seed:test`）

- 启动后端以供 E2E 使用（默认端口 10020）：

  ```bash
  pnpm -C apps/quiz-backend run start:test
  ```

- 运行所有测试（根目录，Turbo 管理：会调用各包的 test 脚本）：

  ```bash
  pnpm run test
  ```

  根仓库有 `pretest` 钩子（`scripts/regenerate-test-secret.sh`），CI 本地运行时会触发它以生成测试 secret。

- 前端单元测试 / E2E（前端脚本）：

  ```bash
  pnpm -C apps/quiz-app run test:unit       # 本地/CI 单元测试
  pnpm -C apps/quiz-app run test:e2e        # 无头 E2E（会先执行 build:test）
  ```

说明：E2E 测试在运行时可能会调用后端的 `POST /api/test/reset`（该接口仅在 `ENABLE_TEST_ENDPOINT=true` 时启用），并假定测试 DB 可被 `db:seed:test` 重置以保证每次测试的数据确定性。

---

## 3) 生产（Production） 🚀

用途：构建与运行生产版本。

常用命令：

- 构建所有（根）：

  ```bash
  pnpm run build
  ```

- 单独构建前端：

  ```bash
  pnpm run build:frontend
  # 等价于: pnpm -C apps/quiz-app run build
  ```

- 构建后端并以生产模式启动：

  ```bash
  pnpm run build:backend
  pnpm -C apps/quiz-backend run start:prod
  ```

说明：生产环境请通过 CI/部署系统注入 secrets（例如 `DATABASE_URL`），不要把 `.env.production.local` 等敏感文件提交到仓库。

---

## 常用脚本速查 🔎

- 安装依赖：`pnpm install`
- 并行启动（开发）：`pnpm run dev`
- 并行构建：`pnpm run build`
- 运行所有测试（Turbo）：`pnpm run test`
- 后端重置并 seed 测试 DB：`pnpm -C apps/quiz-backend run db:seed:test`
- 启动后端（test env）：`pnpm -C apps/quiz-backend run start:test`
- 前端无头 E2E：`pnpm -C apps/quiz-app run test:e2e`

---

## 注意：Prisma（后端） 🔧

- 初次 clone、安装依赖 或 在修改 `prisma/schema.prisma` 后，请在后端目录运行：

  ```bash
  pnpm -C apps/quiz-backend run prisma:generate
  ```

  该命令会生成 Prisma Client（类型和查询 API），确保本地的 `@prisma/client` 与 schema 同步，避免运行时或类型错误。

- 常见问题与解决：
  - 找不到 `@prisma/client` 或 类型不匹配：先运行 `pnpm install`，再执行 `pnpm -C apps/quiz-backend run prisma:generate`。
  - Query Engine 二进制缺失或平台不匹配：删除 `node_modules/.prisma`（或 `pnpm -C apps/quiz-backend run prisma:generate --force`）后重试。
  - E2E 报错数据库不可用：确保已运行 `pnpm -C apps/quiz-backend run db:seed:test` 并用 `pnpm -C apps/quiz-backend run start:test` 启动后端。

- 可选自动化：如果想减少手动步骤，可以在后端 `package.json` 添加 `postinstall` 钩子：
  ```json
  "postinstall": "prisma generate"
  ```
