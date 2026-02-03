# DEV_GUIDELINES — 维护与编码规约（内部） 🔧

**目的：** 给维护者和工程助理（例如：Assistant）记录项目约束、常见坑与审查清单，便于日常开发和 CI/发布维护。

---

## 1. 适用范围

- 适用于 `apps/*` 与 `packages/*` 的代码变更（前端、后端、共享库）。
- 任何影响构建、测试、DB schema、或 CI 流程的改动，都应遵循本规范。

---

## 2. 代码风格 & 格式化

- 使用仓库配置的 ESLint 和 Prettier（不要覆盖仓库规则）。
- TypeScript：尽量完善类型声明，避免使用 `any`（必要时添加注释说明）。
- Vue 组件：遵循 `script setup`、组件按职责拆分、prop/emit 明确类型。

命令：

```bash
pnpm run lint
pnpm run format
pnpm run type-check
```

---

## 3. Commit 与 PR 规范

- 使用 Conventional Commits（例如 `feat:`, `fix:`, `chore:`）。
- Git 操作：请直接在终端使用 `git` 命令（branch / commit / push / pull / rebase / stash 等）；不要使用 MCP（例如 GitKraken 的 MCP 工具）来执行仓库变更，以免跳过本地钩子或自动化检查。- 直接在 `main` 提交的原则：对于**非重大修改**（例如拼写修复、文档更新、注释或样式微调等），可直接在 `main` 上提交并推送以加快流程；提交前请务必运行 `pnpm run lint` 与 `pnpm run type-check`（如适用），并在提交信息中说明变更为“minor/quick fix”。对于影响行为、API、数据库、依赖或构建流程的变更，请使用 feature 分支并发起 PR，按常规流程进行审查与合并。- PR 模板应包括：描述、复现步骤、影响范围、测试说明（单元/E2E）、相关 issue/任务。
- 至少一位 reviewer，通过 CI（lint/test/type-check）后再合并。
- 对外暴露的 API/行为变更需在 PR 中标注 BREAKING CHANGE 并更新文档。

---

## 4. 测试约定

- 新功能必须有对应单元测试（前端 Vitest，后端 Jest）。
- E2E 测试：对于影响交互/流程的变更，补充或更新 Cypress 测试。
- 本地运行 E2E 前，请确保：测试 DB 已 seed（`db:seed:test`）且后端以 `start:test` 启动。

---

## 5. Prisma 与 DB 规约

- 修改 `prisma/schema.prisma` 后：
  - 更新 migration（如果需要），并运行 `pnpm -C apps/quiz-backend run prisma:generate`。
  - 在 PR 描述里注明数据库变更、是否需要数据迁移脚本。
- CI/测试：`db:seed:test` 会重置测试 DB，谨慎使用，仅用于 CI 或可控测试环境。

---

## 6. 常见坑与修复指令（快速参考）

- Prisma client 缺失：
  ```bash
  pnpm -C apps/quiz-backend run prisma:generate
  ```
- Query Engine 二进制问题：删除 `node_modules/.prisma` 后重试。
- 依赖不一致：尝试 `pnpm install` → `pnpm -C <pkg> run build` 或清理缓存。

---

## 7. 安全与敏感信息

- 不要提交 `.env*` 包含 secret 的文件。
- CI/部署平台应注入 `DATABASE_URL`、JWT secret 等环境变量。

---

## 8. 发布与部署（要点）

- 构建流程：前端 `pnpm -C apps/quiz-app run build`，后端 `pnpm -C apps/quiz-backend run build`。
- 确保生产镜像/服务器注入正确的 env 并运行 `start:prod`。

---

## 9. PR 审核清单（简要）

- [ ] 功能描述清晰
- [ ] 加入/更新必要的测试
- [ ] 类型检查无误
- [ ] Lint/格式通过
- [ ] 若有 DB 更改，说明并验证迁移/seed

---

## 10. 联系人 & 更新记录

- 记录主要维护者（如果有）：后端负责人、前端负责人、CI 管理者。
- 每次更新本文件时，在底部添加变更记录（日期 + 简短说明）。

---

_最后更新：2026-02-03 — 初始版本，包含常用规约与快速命令。_
