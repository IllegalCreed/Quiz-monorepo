# Skills 章批 04 三件套生产计划（路由/状态 + Web 框架收尾）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 4 批）。
> 前置：批 1/2/3 已上线；**prod 分类树批 1 已建全 69 叶**，本批叶均为既有空节点/新建即用，无需分类迁移（全新叶 import 直接创建，无移动/改名风险）。

## 本批范围（5 技术叶）

收尾「框架与应用开发 > **Web 框架与元框架**」剩 2 叶 + 完成「框架与应用开发 > **路由、状态与数据流**」组 3 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                                                                                      | 官方性                      | 星数         | 许可 |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------- | ------------ | ---- |
| 1   | Nuxt Skills                     | `onmax/nuxt-skills`                                                                           | **社区**（如实标）          | 688          | MIT  |
| 2   | Svelte AI Tools                 | `sveltejs/ai-tools`                                                                           | **官方**                    | 294          | MIT  |
| 3   | React Router Skill              | `remix-run/react-router`（.agents/skills/react-router，原 remix-run/agent-skills 已归档迁入） | **官方**                    | 137(旧)/主仓 | MIT  |
| 4   | TanStack Router & Start Skills  | `TanStack/router`（packages/\*/skills）+ `TanStack/intent`                                    | **官方**（TanStack Intent） | 14.8k/311    | MIT  |
| 5   | Redux Toolkit Skills            | `reduxjs/redux-toolkit`（packages/toolkit/skills）                                            | **官方**                    | 11.2k        | MIT  |

> **工程价值核验**（防"纯文档封装"）：5 叶均具工程决策/工作流/评测闭环——React Router「skill 瘦身+node_modules 文档」、TanStack Intent「skills 随 npm 包发布随版本同步」、Redux「5 大类任务导向 skill 树」、Svelte「MCP+skills+LSP agent 三件」、Nuxt「生态全家桶+RFC 推动官方化」。
> **官方状态核验**：Nuxt Skills = onmax/nuxt-skills 是**社区**（nuxt/nuxt 官方 PR #33498 已关闭未合并；README 自带 WARNING 可能迁站；有 Nuxt RFC #34059 推动官方化），须如实呈现非官方，同批 3 Vue Skills 处理。React Router 官方 skill 已从独立 `remix-run/agent-skills`（archived）迁入主仓库 `remix-run/react-router/.agents/skills/react-router`。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Nuxt Skills（社区）

| 结论                                                                                                                                                                                                                                                        | 一手来源                 | 本地验证         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------- |
| onmax/nuxt-skills——Vue/Nuxt/NuxtHub AI 编码技能集，**社区/个人**（onmax，Nuxt 生态活跃贡献者），非 nuxt org 官方；MIT                                                                                                                                       | README 头 + gh api owner | 克隆读 README    |
| **21 skills**：nuxt、nuxthub、nuxt-content、nuxt-ui、nuxt-modules、nuxt-seo、nuxt-studio、nuxt-better-auth、reka-ui、tresjs、vue、vueuse、vite、vitest、pnpm、tsdown、ts-library、motion、phaser-best-practices、document-writer、writing-web-documentation | skills/ 目录             | 克隆 ls          |
| nuxt skill：Nuxt 4+（v4.3+）渐进指导，useState/useFetch/useAsyncData、server routes、SSR/hydration、app/ 新目录结构                                                                                                                                         | skills/nuxt/SKILL.md     | 逐字读（生产时） |
| 官方化进程：nuxt/nuxt PR #33498（Claude Code skill）**已关闭未合并**；Nuxt RFC #34059 讨论「模块内置 skills」；README 警告可能迁 nuxt-skill.onmax.me                                                                                                        | PR/RFC/README            | gh api + 读      |
| 安装 `npx skills add onmax/nuxt-skills`；支持 Claude Code/Copilot/Codex/Gemini/OpenCode                                                                                                                                                                     | README `## Installation` | 读取             |

### 叶 2 · Svelte AI Tools（官方）

| 结论                                                                                                                                                      | 一手来源                      | 本地验证           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------ |
| sveltejs/ai-tools——**官方** Svelte MCP + AI 工具，"The official svelte MCP for all your agentic needs"；MIT；活跃（2026-07-16 push）                      | README + gh api               | 克隆读             |
| 三件套：①远程 MCP（mcp.svelte.dev，stdio+HTTP，docs/autofix/资源/模板）②skills（教 LLM 写 Svelte 5）③专用 agent（编辑 .svelte 文件，LSP 诊断/导航/hover） | README + plugins/             | 克隆 find SKILL.md |
| Claude 插件：plugins/claude/svelte/skills 含 svelte-code-writer、svelte-core-bestpractices；另有 plugins/cursor                                           | plugins/claude/svelte/skills/ | 克隆 ls            |
| MCP 工具：从官方 Svelte 文档拉 tools/prompts/resources；skills 懒加载描述教 agent 用 @sveltejs/mcp CLI                                                    | docs/ + README                | 读取（生产时）     |
| 面向 Svelte 5 runes/reactivity + SvelteKit                                                                                                                | README + skills SKILL.md      | 逐字读             |

### 叶 3 · React Router Skill（官方，已迁主仓库）

| 结论                                                                                                                                                                                                                   | 一手来源                                | 本地验证        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------- |
| 官方 React Router Agent Skill 已从独立 `remix-run/agent-skills`（**archived**）迁入主仓库 `remix-run/react-router/.agents/skills/react-router`（SKILL.md + references/）                                               | agent-skills README WARNING + gh api    | 克隆读 + gh api |
| 演进三点：①skill 进主仓库 ②官方文档发布到 node_modules ③skill 瘦身、引导 agent 直接读 node_modules 文档（避免训练数据过时）                                                                                            | agent-skills README + discussion #15099 | 读取            |
| 旧版三模式（framework/data/declarative）：Framework Mode（全栈、loaders/actions/forms/sessions/middleware/rendering）、Data Mode（createBrowserRouter/RouterProvider）、Declarative Mode（BrowserRouter/Link/NavLink） | archived skills/ 目录                   | 克隆读          |
| 安装（新）`npx skills add https://github.com/remix-run/react-router --skill react-router`；create-react-router CLI 新项目默认可加                                                                                      | README + discussion                     | 读取            |

### 叶 4 · TanStack Router & Start Skills（官方，TanStack Intent）

| 结论                                                                                                                                                              | 一手来源                                                                 | 本地验证         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| **TanStack Intent**：库维护者用 `@tanstack/intent` CLI 生成/校验/随 npm 包发布 Agent Skills，装包即得 skill、更新包即更新 skill（不漂移）                         | TanStack/intent README + tanstack.com/ai docs + 博客 from-docs-to-agents | 克隆 intent 读   |
| Router skills（packages/react-router/skills）：react-router（SKILL.md）、compositions/router-query（与 TanStack Query 组合）、lifecycle/migrate-from-react-router | TanStack/router 全树                                                     | gh api 树 + 读   |
| Start skills（packages/react-start/skills）：react-start（SKILL.md）、react-start/server-components（SKILL.md+docs+examples）、lifecycle/migrate-from-nextjs      | TanStack/router 全树                                                     | gh api 树 + 读   |
| 类型安全路由 + server functions + SSR/streaming + RSC；Start 建在 Router 之上                                                                                     | SKILL.md 各段                                                            | 逐字读（生产时） |
| 另有社区 UNOFFICIAL：tanstack-skills/tanstack-skills、DeckardGer/tanstack-agent-skills——**不采用**，以官方 Intent 为准                                            | gh search                                                                | 甄别             |

### 叶 5 · Redux Toolkit Skills（官方）

| 结论                                                                                                                                                                                                                                                                                                                                     | 一手来源                                  | 本地验证         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------- |
| reduxjs/redux-toolkit 主仓库内建官方 skills（packages/toolkit/skills，根 skills/ 有 symlink），MIT，★11.2k                                                                                                                                                                                                                               | gh api contents                           | gh api 树        |
| **5 大任务类**（9 SKILL.md）：build-modern-redux-apps（modern-redux/redux-dataflow）、model-redux-state（build-slices-and-selectors/design-state-ownership）、manage-server-data（adopt-rtk-query）、orchestrate-side-effects（handle-side-effects）、evolve-and-diagnose-redux-apps（debug-redux-toolkit-apps/migrate-to-modern-redux） | packages/toolkit/skills/ 树               | gh api 树        |
| rtk-query-codegen-openapi：generate-rtk-query-from-openapi（从 OpenAPI 生成 RTK Query）                                                                                                                                                                                                                                                  | packages/rtk-query-codegen-openapi/skills | gh api           |
| 现代 Redux：createSlice/configureStore/createAsyncThunk/RTK Query；强调 slices、state ownership、side effects                                                                                                                                                                                                                            | SKILL.md 各段                             | 逐字读（生产时） |

## 文件映射

| #   | 笔记 slug（IllegalCreedWebsite/src/zh/large-language-model/skills/） | 幻灯片包（SlideStack/packages/）     | 题库 JSON（content/）               | 叶名                           |
| --- | -------------------------------------------------------------------- | ------------------------------------ | ----------------------------------- | ------------------------------ |
| 1   | `nuxt-skills`                                                        | `nuxt-skills-slide`                  | `nuxt-skills.json`                  | Nuxt Skills                    |
| 2   | `svelte-ai-tools`                                                    | `svelte-ai-tools-slide`              | `svelte-ai-tools.json`              | Svelte AI Tools                |
| 3   | `react-router-skill`                                                 | `react-router-skill-slide`           | `react-router-skill.json`           | React Router Skill             |
| 4   | `tanstack-router-start-skills`                                       | `tanstack-router-start-skills-slide` | `tanstack-router-start-skills.json` | TanStack Router & Start Skills |
| 5   | `redux-toolkit-skills`                                               | `redux-toolkit-skills-slide`         | `redux-toolkit-skills.json`         | Redux Toolkit Skills           |

## sidebar 变更（框架与应用开发 组）

- **Web 框架与元框架**（已存在）：把占位的 `Nuxt Skills`(sort 5) / `Svelte AI Tools`(sort 7) 从 text 占位改为带 link 的三页节点
- **路由、状态与数据流**（新增子组，sort 2）：React Router Skill / TanStack Router & Start Skills / Redux Toolkit Skills 三叶

## 逐叶状态

| 叶                               | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| -------------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Nuxt Skills                    | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 Svelte AI Tools                | ✅ 4 页   | ✅ 9 页 / 0 溢出      | ✅ 19 题     | 内容完成 |
| 3 React Router Skill             | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 4 TanStack Router & Start Skills | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 5 Redux Toolkit Skills           | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 21 题     | 内容完成 |

> 合计 **100 题** / 20 页笔记 / 62 页幻灯片（0 溢出）。产出方式：Svelte 主上下文自产，Nuxt/React Router/TanStack/Redux 子代理产出（Svelte×2、Redux×1 曾 flaky 空跑，重派/自产已补齐）。

## 全批门禁 + 生产

- [x] VitePress build 0 死链（878s + 回填后 870s 真实成功）/ 5 Slidev 0 溢出 / Quiz audit 0 errors / git diff ×3
- [x] 三仓库 Conventional Commits 提交推送（quiz `1f06538` / slide `15600ae` / VitePress `563f1e6`）
- [x] **生产完成（无需分类迁移）**：import:content:prod 新增 100 题（20+19+20+20+21）→ 查真实 ID（Nuxt 601 / Svelte 603 / React Router 605 / TanStack 606 / Redux 607；路由子组 604 由 import 自动建）回填 → rebuild + commit `580ef07`/push → rsync 部署笔记（0 误删 SlideStack）+ 5 幻灯片 → **全 10 页 HTTP 200 上线**（2026-07-17）
