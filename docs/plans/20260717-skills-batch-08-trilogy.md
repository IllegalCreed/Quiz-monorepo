# Skills 章批 08 三件套生产计划（AI 应用开发 · 框架与应用开发章收官批）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 8 批）。
> 前置：批 1~7 已上线；**prod 分类树批 1 已建全 69 叶**，本批叶为既有空节点/新建即用，无需分类迁移。
> **本批为「框架与应用开发」章最后一组**——收官后该章 7 子组全部完成。
> **本批起用「build 一次」新流程**（见 [[content-deploy-workflow]]）：产出+静态扫崩点→提交 quiz/slide→确认生产→import 拿 ID→回填→**build 一次**→部署。

## 本批范围（5 技术叶）

完成「框架与应用开发 > **AI 应用开发**」组 5 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                        | 官方性   | 星数  | 许可        |
| --- | ------------------------------- | ------------------------------- | -------- | ----- | ----------- |
| 1   | Vercel AI SDK Skills            | `vercel/ai`                     | **官方** | 25.6k | Apache-2.0  |
| 2   | Mastra Skills                   | `mastra-ai/skills`              | **官方** | 67    | NOASSERTION |
| 3   | LangChain & LangGraph Skills    | `langchain-ai/langchain-skills` | **官方** | -     | (待核)      |
| 4   | CopilotKit Skills               | `CopilotKit/skills`             | **官方** | -     | (待核)      |
| 5   | assistant-ui Skills             | `assistant-ui/assistant-ui`     | **官方** | 11.1k | MIT         |

> **工程价值核验**（防"纯文档封装"）：5 叶均具工程决策/工作流——Vercel「AI SDK 统一 provider/框架 + migrate v6→v7」、Mastra「agents vs workflows/tools/memory/RAG + 别信记忆查最新文档」、LangChain「deep-agents core/memory/orchestration + langchain/langgraph fundamentals + RAG/middleware，实测 29%→95%」、CopilotKit「8 skill 全生命周期：setup/develop/integrations(LangGraph/CrewAI)/debug/upgrade/AG-UI/contribute」、assistant-ui「AI 聊天 React 组件」。
> **官方状态核验**：5 叶均在**官方 org/仓内**。**Vercel AI SDK Skills = `vercel/ai`（AI SDK 本体仓，`npx skills add vercel/ai`），与批 3 已做的 vercel-agent-skills（vercel-labs/agent-skills，deploy/react 集合）不同叶、无重叠**。Mastra 许可 NOASSERTION（如实标）。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Vercel AI SDK Skills（官方）

| 结论                                                                                                                                       | 一手来源                                      | 本地验证        |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | --------------- |
| vercel/ai——AI SDK 本体仓（TS SDK 建 LLM 应用，统一 provider 接口 + 框架集成 react/vue/svelte/angular/rsc），Apache-2.0，★25.6k             | AGENTS.md + gh api                            | gh api 读       |
| 官方 AI SDK skill：`npx skills add vercel/ai`；渐进披露，装到 .claude/skills 等；支持 Claude Code/Codex/Cursor                             | ai-sdk.dev/docs/getting-started/coding-agents | WebFetch        |
| skills 在 `skills/` + `.agents/skills`：含用户向 `migrate-ai-sdk-v6-to-v7`（升级 v6→v7）等 + 贡献者向（add-provider-package/adr-skill 等） | gh api tree                                   | gh api 读       |
| **与批 3 vercel-agent-skills（vercel-labs/agent-skills）区分**：那是 deploy/react/vercel-cli 集合，本叶专注 AI SDK                         | gh api 对比                                   | 两仓 skill 列表 |

### 叶 2 · Mastra Skills（官方）

| 结论                                                                                                                      | 一手来源                | 本地验证 |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| mastra-ai/skills——Mastra AI 框架**官方** agent skills，★67；许可 NOASSERTION（gh 未识别标准许可，如实标）                 | gh api + mastra.ai/docs | 克隆读   |
| `skills/mastra/SKILL.md`：教找最新文档、验证 API 签名、建 agents/workflows；核心概念 agents vs workflows/tools/memory/RAG | SKILL.md                | 克隆读   |
| **核心理念**：「你对 Mastra 的记忆很可能过时/错误，别信记忆，永远查最新文档」——Mastra 演进快，API/构造签名/模式常变       | SKILL.md                | 逐字读   |
| RFC 8615 well-known URI 发现：`mastra.ai/.well-known/skills/`，自动发现无需手配                                           | 官方                    | 读取     |

### 叶 3 · LangChain & LangGraph Skills（官方）

| 结论                                                                                                                                                                                              | 一手来源                  | 本地验证 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------- |
| langchain-ai/langchain-skills——LangChain **官方** org 仓（另有 langsmith-skills/skills-benchmarks）                                                                                               | gh api org                | 克隆读   |
| skills：ecosystem primer、langchain-dependencies、deep-agents-core/memory/orchestration、managed-deep-agents、langchain-fundamentals、langchain-middleware、langchain-rag、langgraph-fundamentals | gh api tree               | 克隆 ls  |
| 渐进披露；Deep Agents SKILL.md < 10MB；**实测把 Claude Code 在 LangChain 任务上从 29% 提到 95%**                                                                                                  | langchain.com/blog + docs | 读取     |
| 安装 `npx skills add langchain-ai/langchain-skills --agent claude-code --skill '*' --yes --global`                                                                                                | docs                      | 读取     |

### 叶 4 · CopilotKit Skills（官方）

| 结论                                                                                                                                     | 一手来源    | 本地验证 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| CopilotKit/skills——CopilotKit **官方**专用 skills 仓（skills + hooks + MCP 配置 + reference docs）                                       | gh api      | 克隆读   |
| **8 skills**：copilotkit（路由）+ copilotkit-setup/develop/integrations/debug/upgrade/agui/contribute/self-update                        | gh api tree | 克隆 ls  |
| 覆盖全生命周期：初装、建功能（前端 tools/actions）、集成 agent 框架（**LangGraph/CrewAI**）、AG-UI 协议自定义后端、debug、版本迁移、贡献 | 各 SKILL.md | 逐字读   |
| 路由 skill 按意图连到对应 CopilotKit 文档；跨 Claude Code/Cursor/Gemini                                                                  | README      | 读取     |

### 叶 5 · assistant-ui Skills（官方）

| 结论                                                                                           | 一手来源    | 本地验证         |
| ---------------------------------------------------------------------------------------------- | ----------- | ---------------- |
| assistant-ui/assistant-ui——**官方**，AI 聊天 React 组件库，MIT，★11.1k                         | gh api      | gh api 读        |
| 官方 skill 在 `packages/cli/plugin/skills/assistant-ui/SKILL.md`（CLI plugin 内）              | gh api tree | gh api 读        |
| 另有仓库维护向 `.claude/skills/`（butflow/trusted-publishing/update-deps）——非产品 skill，不采 | gh api      | 区分             |
| 覆盖：assistant-ui 组件/运行时接入 AI 聊天 UI                                                  | SKILL.md    | 逐字读（生产时） |

## 文件映射

| #   | 笔记 slug                    | 幻灯片包                           | 题库 JSON                         | 叶名                         |
| --- | ---------------------------- | ---------------------------------- | --------------------------------- | ---------------------------- |
| 1   | `vercel-ai-sdk-skills`       | `vercel-ai-sdk-skills-slide`       | `vercel-ai-sdk-skills.json`       | Vercel AI SDK Skills         |
| 2   | `mastra-skills`              | `mastra-skills-slide`              | `mastra-skills.json`              | Mastra Skills                |
| 3   | `langchain-langgraph-skills` | `langchain-langgraph-skills-slide` | `langchain-langgraph-skills.json` | LangChain & LangGraph Skills |
| 4   | `copilotkit-skills`          | `copilotkit-skills-slide`          | `copilotkit-skills.json`          | CopilotKit Skills            |
| 5   | `assistant-ui-skills`        | `assistant-ui-skills-slide`        | `assistant-ui-skills.json`        | assistant-ui Skills          |

## sidebar 变更（框架与应用开发 组）

- **AI 应用开发**（新增子组，sort 7）：Vercel AI SDK Skills / Mastra Skills / LangChain & LangGraph Skills / CopilotKit Skills / assistant-ui Skills

## 逐叶状态

| 叶                             | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------------ | --------- | --------------------- | ------------ | -------- |
| 1 Vercel AI SDK Skills         | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 Mastra Skills                | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 3 LangChain & LangGraph Skills | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 19 题     | 内容完成 |
| 4 CopilotKit Skills            | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 5 assistant-ui Skills          | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |

> 合计 **99 题** / 20 页笔记 / 64 页幻灯片（0 溢出）。产出：LangChain 主上下文自产，其余 4 叶子代理（本批 flaky 率高：Mastra×1、LangChain×2→自产、assistant-ui×1，重派/自产补齐）。
> **源核验纠正**（子代理逐字读源，以源为准）：① Vercel AI SDK 主版本 **v7**（非 v5），Node≥22 ESM-only，主用户技能 **`use-ai-sdk`**（name: ai-sdk，「读 node_modules/ai/docs」），许可 **Apache-2.0**；与批 3 vercel-agent-skills（vercel-labs/agent-skills）明确区分。② Mastra 许可 **Apache-2.0**（gh 因 LICENSE 非标准头误报 NOASSERTION，仓库明写为准）。③ CopilotKit 独立仓 **已并入 `CopilotKit/CopilotKit/skills/`**（装 `npx skills add CopilotKit/CopilotKit/skills`），MIT，「1 路由 + 8 专用 sub-skill」。④ LangChain **14 skill**（非 10，另有 langgraph-cli/human-in-the-loop/persistence/swarm）。⑤ assistant-ui MIT。

## 全批门禁 + 生产（build 一次流程）

- [ ] 静态扫崩点（mustache/裸角括号）+ 5 Slidev 0 溢出 + Quiz audit 0 errors
- [ ] 提交推送 quiz JSON + 幻灯片（ID 无关先落袋）
- [ ] **确认生产** → import:content:prod（5 文件）→ 查 5 叶真实 ID 回填 → sidebar → **VitePress build 一次** → git diff → 提交推送 VitePress → rsync 部署（笔记 + 5 幻灯片）→ HTTP 200 抽验
