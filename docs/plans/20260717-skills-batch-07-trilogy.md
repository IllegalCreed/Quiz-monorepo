# Skills 章批 07 三件套生产计划（后端框架与运行时）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 7 批）。
> 前置：批 1~6 已上线；**prod 分类树批 1 已建全 69 叶**，本批叶为既有空节点/新建即用，无需分类迁移。

## 本批范围（3 技术叶）

完成「框架与应用开发 > **后端框架与运行时**」组 3 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                       | 官方性             | 星数 | 许可 |
| --- | ------------------------------- | ------------------------------ | ------------------ | ---- | ---- |
| 1   | Matteo Collina Node.js Skills   | `mcollina/skills`              | **个人权威**       | 1.9k | MIT  |
| 2   | NestJS Best Practices           | `Kadajett/agent-nestjs-skills` | **社区**（如实标） | 220  | ?    |
| 3   | Deno Skills                     | `denoland/skills`              | **官方**           | 88   | MIT  |

> **工程价值核验**（防"纯文档封装"）：3 叶均具工程决策/工作流——Matteo Collina「Fastify 插件架构 + Node 内核 + 高级 TS 类型 + OAuth + ESLint9」、NestJS「37 规则/10 类含严重度分级 + DI/守卫/拦截器/Prisma/鉴权」、Deno「deno-guidance + deno deploy 新 CLI + Fresh 2.x 前端」。
> **官方状态核验**：
>
> - Matteo Collina = **个人**仓库（叶名即以人名命名），但 Matteo Collina 是 **Node.js TSC 成员 / Fastify 作者 / Platformatic CTO**，权威性极高，如实标「个人权威（非 org 官方）」。
> - NestJS Best Practices = **无官方 skill**（nestjs org 无 skill 仓）；`Kadajett/agent-nestjs-skills` 的 `nestjs-best-practices` skill（37 规则/10 类）是最匹配叶名的**社区第三方**，须如实标注非官方，同批 4 Nuxt Skills 处理。
> - Deno = **denoland org 官方**。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Matteo Collina Node.js Skills（个人权威）

| 结论                                                                                                                                                                                                     | 一手来源              | 本地验证         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------- |
| mcollina/skills——Matteo Collina 个人「modern Node.js development」skill 集，MIT，★1.9k；作者 Node.js TSC/Fastify 作者/Platformatic CTO                                                                   | README + gh api owner | 克隆读           |
| **11 skills**：fastify、node、nodejs-core、oauth、typescript-magician（高级 TS 类型）、linting-neostandard-eslint9、documentation（Diátaxis）、init、octocat（Git/GitHub）、skill-optimizer、snipgrapher | gh api tree           | 克隆 ls          |
| 覆盖：Fastify 插件架构、Node.js 内核/internals、高级 TypeScript 类型、OAuth 2.0、ESLint v9（neostandard）、技术文档 Diátaxis 框架                                                                        | 各 SKILL.md           | 逐字读（生产时） |
| 安装 `npx skills add mcollina/skills`；遵开放 Agent Skills 标准（Claude Code/Copilot/Codex 等）                                                                                                          | README                | 读取             |

### 叶 2 · NestJS Best Practices（社区）

| 结论                                                                                                                                                                                                                   | 一手来源          | 本地验证         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- |
| **无官方 NestJS skill**（nestjs org 无 skill/agent 仓）；`Kadajett/agent-nestjs-skills`（★220）的 `nestjs-best-practices` 是最匹配社区源                                                                               | gh api org 查证   | 克隆读           |
| nestjs-best-practices：**37 规则 / 10 类**，每规则含 Impact Assessment 严重度分级（CRITICAL/HIGH/MEDIUM-HIGH/MEDIUM）                                                                                                  | README + SKILL.md | 克隆读           |
| 覆盖：模块边界/DI/controllers/services/DTOs/pipes/guards/interceptors/middleware/global providers；Prisma（client 生命周期/事务/迁移/schema）；鉴权（JWT/OAuth/refresh/RBAC）；配置/校验/错误/日志/监控/缓存/限流/性能 | SKILL.md          | 逐字读（生产时） |
| NestJS 11（Express v5 wildcard 路由等破坏性变更）；安装 `npx skills add Kadajett/agent-nestjs-skills`                                                                                                                  | README + SKILL.md | 读取             |

### 叶 3 · Deno Skills（官方）

| 结论                                                                                                                                                                  | 一手来源        | 本地验证         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| denoland/skills——Deno **官方**「Modern Deno skills」，MIT，★88；覆盖 Deno/JSR imports/Fresh/Deno Deploy                                                               | gh api + README | 克隆读           |
| **6 skills**：deno-guidance、deno-deploy、deno-frontend、deno-expert、deno-project-templates、deno-sandbox                                                            | gh api tree     | 克隆 ls          |
| deno-guidance（deno.json/CLI/JSR/选包基础）、deno-deploy（**新 `deno deploy` CLI 非弃用 deployctl**，env/KV）、deno-frontend（Fresh 2.x islands/Preact/SSR/Tailwind） | 各 SKILL.md     | 逐字读（生产时） |
| 安装：clone 仓库 + 拷 skills 到 Claude skills 目录                                                                                                                    | README          | 读取             |

## 文件映射

| #   | 笔记 slug                      | 幻灯片包                             | 题库 JSON                           | 叶名                          |
| --- | ------------------------------ | ------------------------------------ | ----------------------------------- | ----------------------------- |
| 1   | `matteo-collina-nodejs-skills` | `matteo-collina-nodejs-skills-slide` | `matteo-collina-nodejs-skills.json` | Matteo Collina Node.js Skills |
| 2   | `nestjs-best-practices`        | `nestjs-best-practices-slide`        | `nestjs-best-practices.json`        | NestJS Best Practices         |
| 3   | `deno-skills`                  | `deno-skills-slide`                  | `deno-skills.json`                  | Deno Skills                   |

## sidebar 变更（框架与应用开发 组）

- **后端框架与运行时**（新增子组，sort 6）：Matteo Collina Node.js Skills / NestJS Best Practices / Deno Skills

## 逐叶状态

| 叶                              | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Matteo Collina Node.js Skills | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 NestJS Best Practices         | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 3 Deno Skills                   | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |

> 合计 **60 题** / 12 页笔记 / 43 页幻灯片（0 溢出）。产出：3 子代理**零 flaky**一次全成。
> **NestJS 源核验纠正**（子代理逐字读源，以源为准）：实为 **40 规则/10 类**（非 37）、**5 档严重度**（含 LOW-MEDIUM）、**ORM 是 TypeORM 非 Prisma**（全库 0 Prisma/41 TypeORM，已列为边界）、NestJS 11/Express v5 wildcard **源中无**（仅作补充背景标注）、OAuth 未覆盖（仅 JWT+RBAC）；官方性=社区第三方非官方（Kadajett，MIT）。

## 全批门禁 + 生产

- [ ] VitePress build 0 死链 / 3 Slidev 0 溢出 / Quiz audit 0 errors / git diff ×3
- [ ] 三仓库 Conventional Commits 提交推送
- [ ] **生产（待确认，无需分类迁移）**：import:content:prod（3 文件）→ 查 3 叶真实 ID 回填 → rebuild/commit/push → rsync 部署（笔记 + 3 幻灯片，两路独立不并发）→ HTTP 200 抽验
