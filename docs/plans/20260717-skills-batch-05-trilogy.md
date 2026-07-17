# Skills 章批 05 三件套生产计划（组件系统 + 应用服务集成）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 5 批）。
> 前置：批 1~4 已上线；**prod 分类树批 1 已建全 69 叶**，本批叶为既有空节点/新建即用，无需分类迁移。

## 本批范围（4 技术叶）

完成「框架与应用开发 > **组件系统**」组 2 叶 + 「框架与应用开发 > **应用服务集成**」组 2 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                                    | 官方性   | 星数 | 许可 |
| --- | ------------------------------- | ------------------------------------------- | -------- | ---- | ---- |
| 1   | shadcn Skill                    | `shadcn-ui/ui`（skills/shadcn）             | **官方** | 119k | MIT  |
| 2   | Nuxt UI Skill                   | `nuxt/ui`（skills/nuxt-ui，v4 分支）        | **官方** | 6.7k | MIT  |
| 3   | Better Auth Skills              | `better-auth/skills`                        | **官方** | 203  | MIT  |
| 4   | Stripe Skills                   | `stripe/ai`（原 stripe/agent-toolkit 改名） | **官方** | 1.7k | MIT  |

> **工程价值核验**（防"纯文档封装"）：4 叶均具工程决策/工作流——shadcn「CLI v4 + registry 发现 1500+ 组件 + Tailwind v4」、Nuxt UI「usage skill + 按需 references + /nuxt-ui 触发」、Better Auth「6 skill 覆盖创建/邮箱密码/2FA/组织/安全最佳实践」、Stripe「connect-recommend 决策 + best-practices + directory + projects + upgrade 迁移」。
> **官方状态核验**：4 叶均在**官方 org 仓库内**（shadcn-ui/nuxt/better-auth/stripe）。Stripe 源仓 `stripe/agent-toolkit` 已改名重定向到 `stripe/ai`（多 provider：claude/codex/cursor/grok）。Better Auth 官方 skill 在 org 的独立 `better-auth/skills` 仓（非主库 better-auth/better-auth）。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · shadcn Skill（官方）

| 结论                                                                                                              | 一手来源                     | 本地验证          |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------- |
| shadcn-ui/ui 主仓库内官方 skill（`skills/shadcn/SKILL.md` + `skills/migrate-radix-to-base/SKILL.md`），MIT，★119k | gh api tree                  | gh api 读         |
| shadcn skill 教：CLI v4、registry 系统、component patterns、Tailwind v4 配置；SKILL.md ~19KB                      | ui.shadcn.com/docs/skills    | WebFetch + gh api |
| 配套 shadcn MCP（ui.shadcn.com/docs/mcp）：search/browse/install 组件，一个 MCP URL 接 registry                   | ui.shadcn.com/docs/mcp       | 读取              |
| migrate-radix-to-base：Radix → Base UI 迁移 skill                                                                 | skills/migrate-radix-to-base | gh api 读         |

### 叶 2 · Nuxt UI Skill（官方）

| 结论                                                                                                    | 一手来源                                   | 本地验证          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------- |
| nuxt/ui 官方（v4 分支）内 `skills/nuxt-ui/SKILL.md`，MIT，★6.7k                                         | gh api tree                                | 克隆 v4 读        |
| usage skill 教 AI 用 Nuxt UI v4 建 UI：安装、theming、components、composables、forms、overlays、layouts | ui.nuxt.com/docs/getting-started/ai/skills | WebFetch + 克隆读 |
| skills CLI 装（35+ agents：Claude/Cursor/Codex/Windsurf/Cline…）；装后 `/nuxt-ui` 触发                  | ui.nuxt.com skills 文档                    | 读取              |
| 含按需加载的额外 references，保持上下文高效（渐进披露）                                                 | SKILL.md + references                      | 克隆读            |

### 叶 3 · Better Auth Skills（官方）

| 结论                                                                                                                     | 一手来源    | 本地验证              |
| ------------------------------------------------------------------------------------------------------------------------ | ----------- | --------------------- |
| better-auth org 官方 skills 仓 `better-auth/skills`（★203），非主库 better-auth/better-auth                              | gh api org  | 克隆读                |
| **6 skills**：best-practices、create-auth、emailAndPassword、organization、twoFactor、security                           | skills tree | 克隆 ls + 读 SKILL.md |
| 覆盖：邮箱密码流、社交 OAuth、2FA、Passkeys、Magic Links、多租户组织、RBAC、安全最佳实践；集成 Next.js/SvelteKit/Express | 各 SKILL.md | 逐字读（生产时）      |
| better-auth org 重度 agent 投入：另有 better-icons（Skill+MCP）、agent-auth、better-hub                                  | gh api org  | 读取                  |

### 叶 4 · Stripe Skills（官方）

| 结论                                                                                                                       | 一手来源                             | 本地验证         |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------- |
| stripe 官方，源仓 `stripe/agent-toolkit` 改名重定向到 `stripe/ai`（★1.7k，MIT），docs.stripe.com/skills                    | gh api（重定向）                     | 克隆读           |
| **5 skills**：connect-recommend、stripe-best-practices、stripe-directory、stripe-projects、upgrade-stripe                  | providers/\*/plugin/skills + skills/ | 克隆 ls + 读     |
| 多 provider 分发：providers/{claude,codex,cursor,grok}/plugin/skills；顶层 skills/ 同名                                    | tree                                 | 克隆读           |
| 覆盖：checkout/billing、Connect marketplaces（connect-recommend 决策）、API version 升级（upgrade-stripe）、best practices | 各 SKILL.md                          | 逐字读（生产时） |

## 文件映射

| #   | 笔记 slug            | 幻灯片包                   | 题库 JSON                 | 叶名               |
| --- | -------------------- | -------------------------- | ------------------------- | ------------------ |
| 1   | `shadcn-skill`       | `shadcn-skill-slide`       | `shadcn-skill.json`       | shadcn Skill       |
| 2   | `nuxt-ui-skill`      | `nuxt-ui-skill-slide`      | `nuxt-ui-skill.json`      | Nuxt UI Skill      |
| 3   | `better-auth-skills` | `better-auth-skills-slide` | `better-auth-skills.json` | Better Auth Skills |
| 4   | `stripe-skills`      | `stripe-skills-slide`      | `stripe-skills.json`      | Stripe Skills      |

## sidebar 变更（框架与应用开发 组）

- **组件系统**（新增子组，sort 3）：shadcn Skill / Nuxt UI Skill
- **应用服务集成**（新增子组，sort 4）：Better Auth Skills / Stripe Skills

## 逐叶状态

| 叶                   | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| -------------------- | --------- | --------------------- | ------------ | -------- |
| 1 shadcn Skill       | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 20 题     | 内容完成 |
| 2 Nuxt UI Skill      | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 3 Better Auth Skills | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 4 Stripe Skills      | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 19 题     | 内容完成 |

> 合计 **79 题** / 16 页笔记 / 43 页幻灯片（0 溢出）。产出：shadcn/Stripe 主上下文自产（各重派 2 次 flaky 空跑后自产），Nuxt UI/Better Auth 子代理产出。

## 全批门禁 + 生产

- [ ] VitePress build 0 死链 / 4 Slidev 0 溢出 / Quiz audit 0 errors / git diff ×3
- [ ] 三仓库 Conventional Commits 提交推送
- [ ] **生产（待确认，无需分类迁移）**：import:content:prod（4 文件）→ 查 4 叶真实 ID 回填 → rebuild/commit/push → rsync 部署（笔记 + 4 幻灯片，两路独立不并发）→ HTTP 200 抽验
