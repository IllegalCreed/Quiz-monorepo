# Skills 章批 12 三件套生产计划（浏览器、测试与检索自动化）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-18。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 12 批）。
> 前置：批 1~11 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**（见 [[content-deploy-workflow]]）；**Slidev 崩点已知**（未知 Shiki 语言→```text；two-cols 用 `::right::`）；**子代理 flaky 高发，重派/自产**。

## 本批范围（4 技术叶）

完成「浏览器、测试与检索自动化」组（categories.ts sort 7）4 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                            | 官方性            | 许可   |
| --- | ------------------------------- | ----------------------------------- | ----------------- | ------ |
| 1   | Agent Browser                   | `vercel-labs/agent-browser`         | 官方(Vercel Labs) | (待核) |
| 2   | Playwright CLI                  | `microsoft/playwright-cli`          | **官方**          | (待核) |
| 3   | Browser Use                     | `browser-use/browser-use`           | **官方**          | MIT    |
| 4   | Firecrawl CLI                   | `firecrawl/firecrawl-claude-plugin` | **官方**          | (待核) |

> **官方状态核验**：Agent Browser=Vercel Labs（vercel-labs org）；Playwright CLI=Microsoft 官方（microsoft org，skills 文档 playwright.dev/agent-cli/skills）；Browser Use=官方 browser-use（★105k MIT，Python agent 浏览器自动化，6 skill）；Firecrawl CLI=Firecrawl 官方（firecrawl org，firecrawl-claude-plugin，10 skill）。**注意 Firecrawl 叶名是「Firecrawl CLI」但源仓是 `firecrawl/firecrawl-claude-plugin`**（把 firecrawl CLI 作为 skill 装进 Claude Code 的官方 plugin 仓，非主仓 firecrawl/firecrawl）。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Agent Browser（Vercel Labs）

- vercel-labs/agent-browser；CDP（Chrome DevTools Protocol）浏览器自动化 CLI，面向 coding agent；`skills/agent-browser/SKILL.md` + `skill-data/{agentcore,core,dogfood,electron,slack,vercel-sandbox}/SKILL.md`；跨 Claude Code/Cursor/Codex/OpenCode；自然语言 navigate/fill/click/extract。

### 叶 2 · Playwright CLI（Microsoft 官方）

- microsoft/playwright-cli，Node 18+；`skills/playwright-cli/SKILL.md` + `references/{element-attributes,playwright-tests,request-mocking}.md` + `.claude/skills/dev/{release,roll}`；token-efficient CLI 驱动浏览器自动化（测试/表单/截图/数据提取），skills 文档 playwright.dev/agent-cli/skills；支持 Claude Code/Copilot 等。

### 叶 3 · Browser Use（官方，MIT）

- browser-use/browser-use，★105k；Python AI agent 浏览器自动化；6 skill：`browser-use`（核心）/`cloud`/`open-source`/`qa`/`remote-browser`/`x402`；让 LLM agent 自主操作浏览器完成任务。

### 叶 4 · Firecrawl CLI（Firecrawl 官方）

- firecrawl/firecrawl-claude-plugin；把 firecrawl CLI 作为 skill 装进 Claude Code 的官方 plugin；**10 skill**：firecrawl-agent/cli/crawl/download/interact/map/monitor/parse/scrape/search；scrape/crawl/search/map/browse live web data；Firecrawl 是官方 Claude Code plugin。

## 文件映射

| #   | slug             | 幻灯片包               | 题库 JSON             | 叶名           |
| --- | ---------------- | ---------------------- | --------------------- | -------------- |
| 1   | `agent-browser`  | `agent-browser-slide`  | `agent-browser.json`  | Agent Browser  |
| 2   | `playwright-cli` | `playwright-cli-slide` | `playwright-cli.json` | Playwright CLI |
| 3   | `browser-use`    | `browser-use-slide`    | `browser-use.json`    | Browser Use    |
| 4   | `firecrawl-cli`  | `firecrawl-cli-slide`  | `firecrawl-cli.json`  | Firecrawl CLI  |

## sidebar 变更

- **浏览器、测试与检索自动化**（新增顶层组）：Agent Browser / Playwright CLI / Browser Use / Firecrawl CLI（插在「设计、Web 质量与多媒体」组之后）

## 逐叶状态

| 叶               | VitePress | Slidev（页/溢出） | Quiz（题数） | 状态     |
| ---------------- | --------- | ----------------- | ------------ | -------- |
| 1 Agent Browser  | ✅ 4 页   | ✅ 13 页 / 0 溢出 | ✅ 20 题     | 内容完成 |
| 2 Playwright CLI | ✅ 4 页   | ✅ 13 页 / 0 溢出 | ✅ 19 题     | 内容完成 |
| 3 Browser Use    | ✅ 4 页   | ✅ 11 页 / 0 溢出 | ✅ 20 题     | 内容完成 |
| 4 Firecrawl CLI  | ✅ 4 页   | ✅ 14 页 / 0 溢出 | ✅ 20 题     | 内容完成 |

> 合计 **79 题** / 16 页笔记 / 51 页幻灯片（0 溢出）。产出：4 叶全子代理成功（本批无 flaky）。
> **源核验纠正**：Agent Browser 实为 **7 skill = 主 agent-browser + 6 域**（core/electron/slack/dogfood/vercel-sandbox/agentcore），Apache-2.0（非 MIT）；Playwright CLI 实为 **9 reference**（element-attributes/playwright-tests/request-mocking/running-code/session-management/storage-state/test-generation/tracing/video-recording），Apache-2.0（Microsoft，非 MIT），无 `.claude/skills/dev`；Browser Use 6 skill（core CDP/cloud/open-source/qa 1-5 评分/remote-browser/x402 USDC on Base 付费），MIT；Firecrawl CLI 源仓是 `firecrawl/firecrawl-claude-plugin`（**非主仓 firecrawl/firecrawl**），10 skill，AGPL-3.0（README 明示，无 LICENSE 文件），三仓分工（firecrawl-claude-plugin / firecrawl/cli / firecrawl/firecrawl）。
> **溢出修复**：agent-browser #8（+116px 表格精简 7→5 行+去说明）、firecrawl #11（+2px 去说明）、#13（+54px 代码块减行+去说明）。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（0 mustache / 0 裸标签 / 围栏语言全 Shiki 认识 / 代码内转义引号合规）+ 4 Slidev 0 溢出 + Quiz audit **0 errors**（19821 题 / 0 重复 stem）
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar 新建组 → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
