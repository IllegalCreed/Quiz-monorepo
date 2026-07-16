# Skills 章批 03 三件套生产计划（Web 框架核心）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-16。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 3 批）。
> 前置：批 1/批 2 已上线；**prod 分类树批 1 已建全 69 叶**，本批无需分类迁移。

## 本批范围（5 技术叶 · 均属「框架与应用开发 > Web 框架与元框架」）

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                                 | 版本/提交               | 星数(API)     | 许可 |
| --- | ------------------------------- | ---------------------------------------- | ----------------------- | ------------- | ---- |
| 1   | Vercel Agent Skills             | `vercel-labs/agent-skills`               | HEAD（2026-07-07）      | 29.1k         | MIT  |
| 2   | Next.js Workflow Skills         | `vercel/next.js`（canary/skills）        | canary                  | —（框架仓库） | MIT  |
| 3   | Vue Skills                      | `vuejs-ai/skills`                        | `c9d355f`（2026-03-26） | 2.7k          | MIT  |
| 4   | Antfu Skills                    | `antfu/skills`                           | HEAD（2026-06-23）      | 5.6k          | MIT  |
| 5   | Angular Developer Skill         | `angular/skills`（源在 angular/angular） | v1.0（2026-07-16）      | 570           | MIT  |

> **工程价值核验**（防"纯文档封装"）：5 叶均具工程决策/工作流/评测闭环，非 API 文档离线封装——见证据矩阵。
> **同名/官方状态核验**：Vue Skills = vuejs-ai/skills 是**社区项目**（org 标 "(Unofficial)"，Evan You 表态成熟后可能转正式），须如实呈现；Next.js 的 reference 知识已转 AGENTS.md，仅 workflow skills 留存。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Vercel Agent Skills

| 结论                                                                                                                                                                                                                                                                                          | 一手来源                     | 本地验证        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------- |
| Vercel 官方 agent skills 集，遵 agentskills.io 格式，MIT                                                                                                                                                                                                                                      | README 头                    | 克隆逐字读      |
| 9 技能：vercel-optimize（审计成本/性能/缓存/函数/账单，先收 metrics 再查）、react-best-practices（40+ 规则 8 类）、web-design-guidelines（100+ a11y/UX 规则）、writing-guidelines（80+ Vercel 写作手册）、react-native、react-view-transitions、composition-patterns、vercel-deploy-claimable | README `## Available Skills` | 读 skills/ 目录 |
| deploy-claimable：对话里部署，auto-detect 40+ 框架，返回 preview URL + claim URL（可转所有权）                                                                                                                                                                                                | README deploy 段             | 读取            |
| 安装 `npx skills add vercel-labs/agent-skills`                                                                                                                                                                                                                                                | README `## Installation`     | 读取            |

### 叶 2 · Next.js Workflow Skills

| 结论                                                                                                                                                                                                                                         | 一手来源                                          | 本地验证           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------ |
| Next.js agent skills 已迁入主仓库 `vercel/next.js/skills`（版本随框架，不漂移）                                                                                                                                                              | vercel-labs/next-skills README（迁移公告）        | 克隆读迁移公告     |
| **按类型拆分**：Workflow skills 仍 `npx skills add vercel/next.js`；Reference 知识（best-practices/upgrade）不再是 skill，改由 16.3+ 内置文档 + 自动生成 AGENTS.md/CLAUDE.md 交付                                                            | next-skills README `## Where each old skill went` | 读取               |
| 4 workflow skills：next-cache-components-adoption/optimizer、next-dev-loop、next-partial-prefetching-adoption                                                                                                                                | gh api vercel/next.js/skills 目录                 | gh api 列目录      |
| next-dev-loop：改后验证运行时（非仅编译/类型）；结合 `/_next/mcp`（Next.js 视角：路由/RSC/server actions/日志）+ agent-browser（浏览器视角：DOM/console/vitals）双视角交叉核；需 next dev + 16.3+ Turbopack + agent-browser≥0.31.1（硬门槛） | 拉 SKILL.md 逐字读                                | gh api 读 SKILL.md |
| next-cache-components-optimizer：`cacheComponents:true` 优化——页壳 PPR 循环 + 即时导航循环                                                                                                                                                   | 拉 SKILL.md                                       | gh api 读          |
| 工程决策价值：Skills vs AGENTS.md 分工（横向 reference→AGENTS.md，垂直 workflow→skills；Vercel eval "AGENTS.md outperforms skills"）                                                                                                         | Vercel 博客 + README                              | 读取               |

### 叶 3 · Vue Skills

| 结论                                                                                                                               | 一手来源                     | 本地验证                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------- |
| vuejs-ai/skills——Vue 3 开发 agent 技能，**社区项目（org 标 Unofficial）**，Evan You 表态成熟后可能转 Vue 官方；README 自带幻觉警告 | README 头 + org 信息         | 克隆读 README + gh api org |
| 8 技能：vue-best-practices/options-api/router/pinia/testing/jsx/debug-guides/create-adaptable-composable                           | README `## Available Skills` | 读 skills/ 目录            |
| **方法论**：Skill 分 Capability（AI 无技能解不了：版本专有/未文档化/新特性/边界）vs Efficiency（能解但不够好）                     | README `## Methodology`      | 逐字读                     |
| **eval 驱动筛选**：Baseline vs With-skill，仅当技能让模型解决原本解决不了的才保留（Fail→Pass 保，Pass→Pass 考虑删）                | README 验证表                | 读取                       |
| 用法 `Use vue skill, <prompt>` 显式触发；安装 `npx skills add vuejs-ai/skills` 或插件市场                                          | README `## Usage`            | 读取                       |

### 叶 4 · Antfu Skills

| 结论                                                                                                                                                                          | 一手来源                                     | 本地验证           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| Anthony Fu（Vue/Nuxt/Vite 核心 + Vercel）精选集，反映其偏好；proof-of-concept 从源文档生成技能并保持同步                                                                      | README 头                                    | 克隆逐字读         |
| 3 类：①手工维护（opinionated）antfu/antfu-design；②官方文档生成 vue/nuxt/pinia/vite/vitepress/vitest/unocss/pnpm；③vendored slidev/tsdown/turborepo/vueuse/vue-best-practices | README `## Skills`                           | 读 skills/ 19 目录 |
| **关键差异**：用 git submodule 直引源文档→可靠上下文 + 随上游更新；Vite/Nuxt 主力者的一站集                                                                                   | README `## FAQ`                              | 读取               |
| Anthony 论 Skills vs AGENTS.md：skills 价值=shareable + on-demand；承认 AGENTS.md 全量前置更稳，视为工具集成 gap                                                              | README `### Skills vs llms.txt vs AGENTS.md` | 读取               |
| 安装 `pnpx skills add antfu/skills --skill='*'`；MIT（vendored 保留原许可）                                                                                                   | README                                       | 读取               |

### 叶 5 · Angular Developer Skill

| 结论                                                                                                                                              | 一手来源                            | 本地验证        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------- |
| Angular **官方**（Copyright 2026 Google LLC，MIT）；源在 angular/angular，经基建输出到 angular/skills                                             | SKILL.md frontmatter + README       | 克隆读 SKILL.md |
| angular-developer + angular-new-app 两技能；精简 SKILL.md 作**依赖图**指向 30+ references 文件按需加载（渐进披露）                                | SKILL.md body + references/         | 读取            |
| 核心规则：①先分析项目 Angular 版本（最佳实践随版本变）；②用 Angular CLI 脚手架；③生成后必 `ng build` 验证（关键不跳）                             | SKILL.md 头 3 条                    | 逐字读          |
| 现代 Angular：Signals（signal/computed/linkedSignal/resource/effect）、Signal Forms（v21+ 优先）、DI、routing、SSR、a11y(ARIA)、Tailwind、testing | SKILL.md 各段                       | 读取            |
| `ng new` 版本检测三步逻辑（显式版本→npx@version；已装→ng new；兜底→npx@latest）                                                                   | SKILL.md `## Creating New Projects` | 读取            |
| 安装 `npx skills add https://github.com/angular/skills`                                                                                           | README `## Using`                   | 读取            |

## 文件映射

| 叶  | VitePress slug            | Slidev 包                       | Quiz JSON                      | categories 叶名         |
| --- | ------------------------- | ------------------------------- | ------------------------------ | ----------------------- |
| 1   | `vercel-agent-skills`     | `vercel-agent-skills-slide`     | `vercel-agent-skills.json`     | Vercel Agent Skills     |
| 2   | `nextjs-workflow-skills`  | `nextjs-workflow-skills-slide`  | `nextjs-workflow-skills.json`  | Next.js Workflow Skills |
| 3   | `vue-skills`              | `vue-skills-slide`              | `vue-skills.json`              | Vue Skills              |
| 4   | `antfu-skills`            | `antfu-skills-slide`            | `antfu-skills.json`            | Antfu Skills            |
| 5   | `angular-developer-skill` | `angular-developer-skill-slide` | `angular-developer-skill.json` | Angular Developer Skill |

VitePress sidebar：新建「框架与应用开发」组 →「Web 框架与元框架」子组 → 5 叶（该组尚未在 sidebar，需新建层级）。

## 逐叶完成状态

| 叶                        | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Vercel Agent Skills     | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 21 题     | 内容完成 |
| 2 Next.js Workflow Skills | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 18 题     | 内容完成 |
| 3 Vue Skills              | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 15 题     | 内容完成 |
| 4 Antfu Skills            | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 14 题     | 内容完成 |
| 5 Angular Developer Skill | ✅ 4 页   | ✅ 12 页 / 0 溢出     | ✅ 20 题     | 内容完成 |

## 全批门禁 + 生产

- [x] VitePress build 0 死链（754s 真实成功）/ 5 Slidev 0 溢出 / Quiz audit 0 errors / git diff ×3
- [x] 三仓库 Conventional Commits 提交推送（quiz `868dd1e` / slide `9a74323` / VitePress `b3dadd7`）
- [x] **生产完成（无需分类迁移）**：import:content:prod 新增 88 题（20+14+18+21+15）→ 查真实 ID（597/598/599/600/602）回填 → rebuild 694s + commit `ae47113`/push → rsync 部署笔记（0 误删 SlideStack）+ 5 幻灯片 → **全 10 页 HTTP 200 上线**（2026-07-17）
