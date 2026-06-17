# 在线编辑器章节内容生产计划 / 交接（前端开发工具 > 在线编辑器）

> **状态**：2026-06-17 选型调研完成，叶子集合已敲定（**5 叶，方案 A**），用户已拍板，进入逐叶三件套生产。
> **范围**：本批做**完整三件套**——Quiz 题目（quiz-monorepo）+ VitePress 笔记（IllegalCreedWebsite）+ Slidev 幻灯片（SlideStack），跨 3 仓库。每叶三件套各自过门禁才算完成。
> **本文件亦作跨会话交接（handoff）**：进度见文末「§十、进度跟踪」，新会话从那里接着干。

---

## 进度速览（给"按这个继续"的未来会话）

- [x] 选型调研（2026-06-17，两路 WebFetch 核实）
- [x] 叶集合拍板：5 叶（方案 A）
- [x] 旁路：bolt.new / v0 / Lovable 归位「大语言模型与生成式 AI > AI 应用生成器」子组（categories.ts + VitePress sidebar 均已落地占位，**仅建节点/目录，内容三件套属另一批**）
- [x] categories.ts：在线编辑器占位单叶 → 5 子叶（已落地，tsc 校验通过）
- [x] 标杆叶 **StackBlitz** 三件套已完成并过门禁（笔记 6 页 / 幻灯片 11 页 0 溢出 / 题库 46）——待用户审 + 导 prod
- [x] 其余 4 叶三件套完成（CodeSandbox 41 / CodePen 38 / Expo Snack 37 / 框架官方 Playground 39）
- [x] 题目导入 prod（5 叶共 **201 题**，幂等；含 codesandbox WASI 题收敛修正）
- [ ] 三仓库各自提交（quiz-monorepo / IllegalCreedWebsite / SlideStack 均未提交，待用户确认）

---

## 一、Context 与现状

「前端开发工具 > 在线编辑器」节点早已存在，但**有名无实**：

- categories.ts 里是**单叶占位** [`{ name: "在线编辑器（StackBlitz / CodeSandbox / Expo）", sort: 4 }`](../../apps/quiz-backend/prisma/content/categories.ts#L447)；
- IllegalCreedWebsite sidebar 里也只是占位 `{ text: "在线编辑器", items: [StackBlitz / CodeSandbox / Expo] }`（无 link，config.mts ~L4047）；
- content 目录下**无任何相关 json**，且**已确认零题目挂到该叶子**（sublime-text/trae/vscode.json 里命中的「在线编辑器」仅是 IDE 题目正文措辞，非分类挂载）→ 纯占位，重构无数据迁移负担；
- 2026 格局：StackBlitz（WebContainers 浏览器内跑 Node）、CodeSandbox（已转 Firecracker microVM 云沙箱 / 被 Together AI 收购）、CodePen（2.0 重写）等"浏览器内即时跑/分享"工具成熟，需把单叶扩成工具组。

**目标**：调研 2026 主流在线编辑器 → 扩充叶子集合（1→5）→ 从零生产在线编辑器章节三件套。

与近期演进一致：IDE 2→10、版本控制 1→7、静态分析 5→10、包管理器→4、打包工具 6→7，均按"具名工具各自成叶"扩展。

---

## 二、选型调研结论（2026-06-17）

**判据**：本章只收「**浏览器内、手写代码、即时跑 / 可分享的 playground**」——受众是会写代码的前端。凡主轴变成「自然语言生成应用」的归 AI 章，凡「完整云端 IDE / agent 平台」归云开发环境，这样与隔壁章边界互斥、不重复立叶。

### 立叶判断（逐工具）

| 候选                                             | 判断         | 理由（2025–2026 当前事实）                                                                                                                                         |
| ------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **StackBlitz**                                   | ✅ 立叶      | WebContainers（WASM 在浏览器内原生跑 Node/npm/dev server）独门技术，可运行文档示例事实标杆；母公司估值 ~7 亿$                                                      |
| **CodeSandbox**                                  | ✅ 立叶      | 但须点明定位已迁移：2024-12 被 **Together AI 收购**，现为 Firecracker **microVM** 云沙箱 / Devbox / CDE + CodeSandbox SDK（AI agent 批量沙箱）；非纯浏览器打包器了 |
| **CodePen**                                      | ✅ 立叶      | 最经典纯前端 **iframe** playground + 社区；**2.0** 已用 Next.js 重写、多文件 / 文件夹 / 原生 Collab                                                                |
| **Expo Snack**                                   | ✅ 立叶      | 浏览器内 RN 编译 + web-player / Expo Go 真机预览，RN 垂直代表；与原占位叶名一致（含 Expo）                                                                         |
| **框架官方 Playground**（TS / Vue SFC / Svelte） | ✅ 合并 1 叶 | 官方、纯客户端编译、强绑框架、看编译产物 / 复现 bug；合并讲「客户端编译 + 分享复现」范式，避免三个同质小叶                                                         |
| JSFiddle                                         | ✕ 不立叶     | 与 CodePen 同类更轻、社区弱、无独特技术点；在 CodePen 叶内对比带过                                                                                                 |
| Replit                                           | ✕ 归 AI 章   | 已决定性转型 AI 应用生成（Agent 4 / vibe coding）                                                                                                                  |
| bolt.new / v0 / Lovable                          | ✕ 已归 AI 章 | prompt-to-app，**本批已在 categories.ts 建「AI 应用生成器」子组**（见 §三末）                                                                                      |
| Gitpod→Ona / GitHub Codespaces                   | ✕ 排除       | 云开发环境（Gitpod 2025-09 改名 Ona 转 AI agent；Codespaces 是云端完整 VS Code），与教学片段沙箱互斥                                                               |
| val.town / Firebase Studio                       | ✕ 排除       | val.town 是 serverless/scripting；Firebase Studio（原 Project IDX）**已宣布 2027-03-22 停运**                                                                      |
| Glitch                                           | ✕ 排除       | 核心托管 **2025-07-08 已关停**，仅作历史注脚                                                                                                                       |

### 敲定叶子集合（5 叶，方案 A）

排序按"浏览器内跑 Node（WebContainers）→ 服务端 microVM 云沙箱 → 纯前端 iframe playground → RN 垂直 → 框架官方编译 playground"聚类，便于对比教学（核心张力：三种"浏览器里跑代码"的底层机制差异）。

| sort | 叶子名                  | 路径 / 文件名（kebab） | 阵营                            | 出题侧重                                                                                                                                                                                                                                                   |
| ---- | ----------------------- | ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **StackBlitz**          | `stackblitz`           | WebContainers·浏览器内跑 Node   | WebContainers/WASM 微内核原理、浏览器内 Node/npm/dev server、毫秒启动 / 离线、Vite & 框架模板、WebContainer API 嵌入、可运行文档示例、与 CodeSandbox(microVM) 机制对比、bolt.new 血缘（本体≠AI 生成器）                                                    |
| 2    | **CodeSandbox**         | `codesandbox`          | Firecracker microVM 云沙箱      | 定位迁移史（浏览器打包器→microVM）、Devbox / Sandbox / CDE 三产品、被 Together AI 收购、CodeSandbox SDK（编程式批量沙箱 / AI 代码解释）、Sandpack 可嵌入组件、快照 / 分支即起、与 StackBlitz / 本地 IDE 取舍                                               |
| 3    | **CodePen**             | `codepen`              | 纯前端 iframe playground + 社区 | iframe 沙箱渲染（**不跑 Node**）、预处理器（SCSS/Babel/TS）、Pen / Project、社区 / 展示 / 嵌入、CodePen 2.0（Next.js 重写 / 多文件 / Collab）、与 JSFiddle 对比、能力边界（前端片段而非全栈）                                                              |
| 4    | **Expo Snack**          | `expo-snack`           | 浏览器内 RN playground          | React Native / Expo 浏览器内预览、web-player vs Expo Go 真机、SDK 版本 / 依赖 / 资源、分享 / 嵌入文档 / 协作、与本地 Expo 开发取舍、RN 垂直定位                                                                                                            |
| 5    | **框架官方 Playground** | `framework-playground` | 框架官方客户端编译 playground   | 客户端编译范式；TS Playground（compiler flags / .d.ts / 类型实验 / 分享）、Vue SFC Playground（`@vue/compiler-sfc` / 看编译产物）、Svelte Playground（原 REPL→改名 / 编译器实时编译）；共性（官方 / 纯客户端 / 强绑框架 / 复现 bug）、与通用在线编辑器差异 |

> **命名待确认（小决策）**：第 5 叶显示名暂用 **「框架官方 Playground」**；备选「框架 Playground（TS/Vue/Svelte）」。`sort` 仅影响显示顺序，可微调。
>
> **品牌名约定**：`bolt.new` 等带 `.new` 后缀照写（已用于 AI 章）；`v0` 照写小写。

---

## 三、categories.ts 改动

将 [categories.ts:447](../../apps/quiz-backend/prisma/content/categories.ts#L447) 的单叶 `{ name: "在线编辑器（StackBlitz / CodeSandbox / Expo）", sort: 4 }` 扩为 5 叶组（父节点名去掉括号后缀，纯「在线编辑器」）：

```ts
{
  // 2026-06-17 选型调研定稿：占位单叶 → 5 叶。判据＝「浏览器内、手写代码、即时跑/分享」。
  // 排序按机制聚类：WebContainers(跑 Node) → 服务端 microVM → 纯前端 iframe → RN 垂直 → 框架官方编译。
  // 边界去重：bolt.new/v0/Lovable/Replit Agent(prompt-to-app)→ 大语言模型·AI 应用生成器；
  // Gitpod(Ona)/GitHub Codespaces(云开发环境)、val.town(serverless)、Firebase Studio(2027 停运)、
  // Glitch(2025-07 关停) 均不立叶；JSFiddle 并入 CodePen 对比带过；Replit 本体转 AI 不单列。
  name: "在线编辑器",
  sort: 4,
  children: [
    { name: "StackBlitz", sort: 1 },
    { name: "CodeSandbox", sort: 2 },
    { name: "CodePen", sort: 3 },
    { name: "Expo Snack", sort: 4 },
    { name: "框架官方 Playground", sort: 5 },
  ],
},
```

> 占位叶无题目挂载（已核），就地改为父节点 + 5 子叶，无数据迁移。叶子名即题目 `categories` 字段第二元素，须逐字一致。

**已落地的旁路改动**（本会话用户插入需求，**已写入 categories.ts**）：在「大语言模型与生成式 AI」(sort 17) 新增子组 **「AI 应用生成器」(sort 3)**，含 `bolt.new` / `v0` / `Lovable` 三叶（后续子组 sort 顺延：编排→4 / 其他→5 / 提示词→6 / MCP→7 / Skills→8）。仅建节点，其内容三件套属**另一批**，不在本计划范围。

---

## 四、出题规划

### 题量预估（重质不限量，按深度给足，不设上限）

| 叶子                | 预估区间 | 说明                                                  |
| ------------------- | -------- | ----------------------------------------------------- |
| StackBlitz          | 40–60    | WebContainers 技术点密、嵌入 API、模板生态            |
| CodeSandbox         | 40–60    | 产品线（Devbox/Sandbox/CDE/SDK）+ 定位迁移 + Sandpack |
| 框架官方 Playground | 40–60    | 3 工具合一，范式 + 各自要点                           |
| CodePen             | 35–50    | iframe / 预处理器 / 社区 / 2.0                        |
| Expo Snack          | 30–45    | RN 垂直，预览机制独特                                 |

合计预估 **~185–275 题**（以实际深度为准）。

### 题目格式（内嵌 categories）

```json
{
  "stem": "StackBlitz: <题干，必含技术名前缀>",
  "explanation": "<Markdown 解析，有信息量>",
  "tags": ["stackblitz", "<主题>"],
  "categories": [
    ["技术方向", "StackBlitz"],
    ["难度", "入门|初级|中级|高级|专家"]
  ],
  "options": [{ "text": "...", "isCorrect": true, "description": "<选项解析>" }]
}
```

> 第 5 叶（框架官方 Playground）题目 stem 前缀按工具写 `TS Playground:` / `Vue SFC Playground:` / `Svelte Playground:`，但 `categories` 统一为 `["技术方向", "框架官方 Playground"]`（仿 Vim/Neovim 合并叶先例）。Expo Snack 叶 stem 前缀 `Expo Snack:`，`categories` 为 `["技术方向", "Expo Snack"]`。

---

## 五、三件套另两件产出规范（VitePress 笔记 + Slidev 幻灯片）

总流程见 [20260327-content-production-workflow.md](./20260327-content-production-workflow.md)，本章落地要点：

### VitePress 笔记（IllegalCreedWebsite）

- **路径**：`src/zh/frontend-develop-tools/online-editor/<leaf>/`（新建 `online-editor/` 子目录，与现有 `ide/`、`static-analysis/`、`version-control/` 平级）
- **文件**：`index.md`（概览：一句话定义 / 评价优缺点 / 文档·GitHub·幻灯片链接，**无**速查）+ `getting-started.md`（速查 / 安装或访问 / 配置 / 基本用法）；大叶按需加 `guide-line/*.md` 多页。**框架官方 Playground 叶**建议 `guide-line/` 分 `typescript-playground.md` / `vue-sfc-playground.md` / `svelte-playground.md` 三深度页。
- **🔴 速查表门禁（强制，最近批次易漏）**：**除 `index.md` 概览页外**，`getting-started.md` **及每个** `guide-line/*.md` 深度页，都必须在 `# 标题` + `> 基于X版本` 之后、正文之前紧跟 `## 速查` 段——要点式浓缩本页核心 API/命令/配置/版本/链接。用户常**只读速查表**，任一深度页漏掉即不算完成（见 CLAUDE.md「内容生产质量门禁 > VitePress 笔记」、[[vitepress-note-cheatsheet-required]]）。
- **sidebar**：`.vitepress/config.mts`（在线编辑器节现为占位，~L4047），扩为 5 叶并补 `link`，顺序与 categories.ts 对齐。
- **路径名**（kebab-case）：`stackblitz` / `codesandbox` / `codepen` / `expo-snack` / `framework-playground`

### Slidev 幻灯片（SlideStack）

- 新建 `packages/<leaf>-slide/`（`cp -r` 近期 deck 改，标杆 **prettier-slide**）；改 `package.json` name + `build` 的 `--base /SlideStack/<leaf>-slide/`、删 `assets/dist`；`@slidev/cli` 锁 `^52.15.2`；seriph 主题。
- `slides.md` 轻量入门风格；约 10 页（封面 + 9 内容 + end）；密度参照 prettier-slide 防溢出（代码行≈22px / 表格行≈33px / 正文行≈26px）。
- **门禁**：`pnpm -C packages/<leaf>-slide run build` 后 `node scripts/check-slidev-overflow.mjs <leaf>-slide` → **0 溢出**才算完成。

---

## 六、内容审查流程（每叶必做，遵循 CLAUDE.md）

逐叶执行：**WebFetch 官方文档首页 → 逐页 WebFetch（3–8 页）→ context7 / zread 双重校验 → 本地验证（可访问/可试则实测）→ 交叉比对后出题**。

官方文档起点（待逐叶 WebFetch 验证）：

| 叶子                | 官方文档起点                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| StackBlitz          | https://stackblitz.com/docs + WebContainers https://webcontainers.io/                                                   |
| CodeSandbox         | https://codesandbox.io/docs + SDK https://codesandbox.io/docs/sdk                                                       |
| CodePen             | https://blog.codepen.io/documentation/ （官方文档偏散，辅以 blog/changelog）                                            |
| Expo Snack          | https://docs.expo.dev/ + https://github.com/expo/snack（README/docs）                                                   |
| 框架官方 Playground | TS https://www.typescriptlang.org/play + Vue https://vuejs.org/（SFC Playground）+ Svelte https://svelte.dev/playground |

**禁止**：把"文档摘要未提及"当"已废弃"；未本地验证就改用户已有正确内容；仅凭 context7/AI 总结下"过时"结论。

---

## 七、质量门禁

- 每题 `stem` 含技术名前缀；`categories` 叶子名与 categories.ts 完全一致；中文内引号必须**全角**（写完跑 `JSON.parse` 自检，见 [[quiz-json-fullwidth-quotes]]）。
- 题干、解析、**每个选项的 description** 都准确、有信息量，杜绝凑数与模板化重复。
- 难度分布合理（入门→专家），覆盖各叶出题侧重维度（见 §二表）。
- **🔴 破同质化（本章核心风险）**：StackBlitz（WebContainers / WASM 浏览器内跑 Node）、CodeSandbox（**服务端** Firecracker microVM）、CodePen（纯前端 **iframe**，不跑 Node）三者都是"浏览器里能跑代码"，但**底层机制与能力边界截然不同**——题目务必抓住各自机制差异（跑不跑 Node、在端上还是服务端、能否装 npm 包 / 起 dev server），避免三叶题目雷同（类比版本控制 GUI 四件破同质要求）。
- **笔记速查表门禁**：见 §五 🔴，每个深度页顶部 `## 速查` 不可缺。

---

## 八、执行顺序（三件套）

1. 改 `categories.ts`（在线编辑器单叶 → 5 叶）。✅ 随本方案落地。
2. **标杆先行**：先精做 **StackBlitz** 一叶的完整三件套（笔记 + 幻灯片 + 题目）——WebContainers 是本章最独特技术点，做透作质量标杆与节奏模板，供用户审阅认可后再推其余 4 叶。
3. **逐叶串行**（StackBlitz → CodeSandbox → CodePen → Expo Snack → 框架官方 Playground）。每叶按序产出：
   - **调研**：逐页 WebFetch 官方文档 + context7/zread 双校验（§六）
   - **笔记**：`online-editor/<leaf>/` index + getting-started（+ 每个深度页速查表，+ sidebar link）
   - **幻灯片**：`<leaf>-slide` deck → build → 防溢出 0 溢出
   - **题目**：`<leaf>.json`（内嵌 categories）→ 自查质量门禁
4. **导入**：题目写完跑 `pnpm -C apps/quiz-backend run import:content:prod`（**铁律：只导 prod，幂等追加；严禁 dev/test**）。
5. **提交**：三仓库各自提交（quiz-monorepo / IllegalCreedWebsite / SlideStack），commit 用 `feat: 在线编辑器章节 <leaf> 三件套`。

---

## 九、涉及文件

| 仓库                | 文件                                                                                                     | 操作                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| quiz-monorepo       | `apps/quiz-backend/prisma/content/categories.ts`                                                         | 在线编辑器单叶 → 5 叶（旁路 AI 应用生成器子组**已改**） |
| quiz-monorepo       | `apps/quiz-backend/prisma/content/{stackblitz,codesandbox,codepen,expo-snack,framework-playground}.json` | 新建，逐叶题目                                          |
| quiz-monorepo       | `docs/plans/20260617-online-editor-trilogy-handoff.md`                                                   | 本计划/交接归档                                         |
| IllegalCreedWebsite | `src/zh/frontend-develop-tools/online-editor/<leaf>/*.md`                                                | 新建，逐叶笔记（每深度页含速查表）                      |
| IllegalCreedWebsite | `.vitepress/config.mts`                                                                                  | 在线编辑器 sidebar 扩 5 叶 + 补 link                    |
| SlideStack          | `packages/<leaf>-slide/`                                                                                 | 新建，逐叶幻灯片                                        |

---

## 十、进度跟踪（跨会话交接用，每完成一项就勾选 / 追注）

| 叶子                | 调研 | 笔记    | 幻灯片(0溢出) | 题目(过门禁) | 导入prod | 备注                                                               |
| ------------------- | ---- | ------- | ------------- | ------------ | -------- | ------------------------------------------------------------------ |
| StackBlitz（标杆）  | ✅   | ✅      | ✅            | ✅           | ✅       | 已导 prod（46/46）；定价已功能化措辞                               |
| CodeSandbox         | ✅   | ✅(5页) | ✅(12页0溢出) | ✅(41)       | ✅       | microVM≠client；Devbox/CDE 标历史；WASI 题收敛 JS+WASM；定价功能化 |
| CodePen             | ✅   | ✅(5页) | ✅(12页0溢出) | ✅(38)       | ✅       | 纯 iframe 不跑 Node；2.0/废弃项标注；Prefill API；定价功能化       |
| Expo Snack          | ✅   | ✅(5页) | ✅(12页0溢出) | ✅(37)       | ✅       | RN 三端预览；preview 双默认值；SDK号/体积未编造                    |
| 框架官方 Playground | ✅   | ✅(6页) | ✅(11页0溢出) | ✅(39)       | ✅       | TS/Vue/Svelte 合并；REPL 消歧；hash/query 分清                     |

> categories.ts 在线编辑器 1→5 叶：☐ 待执行（随 StackBlitz 标杆一并落地）。
