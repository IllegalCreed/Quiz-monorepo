# IDE 章节内容生产计划（前端开发工具 > IDE）

> **状态**：2026-06-15 选型调研完成，叶子集合已敲定（8 叶），待用户审查后进入逐叶出题。
> **范围**：本批做**完整三件套**——Quiz 题目（quiz-monorepo）+ VitePress 笔记（IllegalCreedWebsite）+ Slidev 幻灯片（SlideStack），跨 3 仓库。每叶三件套各自过门禁才算完成。

---

## 一、Context 与现状

「前端开发工具 > IDE」节点早已存在（[categories.ts:383-390](../../apps/quiz-backend/prisma/content/categories.ts#L383-L390)），但**有架子无内容**：

- 现有叶子仅 **VSCode、WebStorm** 两个；
- content 目录下**无任何 IDE 相关 json**（无 `vscode.json` / `webstorm.json`）；
- 2026 年 IDE 格局相比这两个老叶子已巨变（AI 原生 IDE 崛起），需重定叶子集合。

**目标**：调研 2026 主流 IDE → 扩充叶子集合 → 从零生产 IDE 章节题目。

---

## 二、选型调研结论（2026-06-15）

### 权威数据

| IDE/编辑器         | 流行度                                                      | 定位                            | 来源                  |
| ------------------ | ----------------------------------------------------------- | ------------------------------- | --------------------- |
| VSCode             | **75.9%**（连续 9 年第一）                                  | 绝对霸主                        | SO 2025 调查          |
| Cursor             | **17.9%**（史上最快登场）/ 百万日活 / $293亿估值 / 企业第 3 | AI 原生龙头（VSCode fork）      | SO 2025 / 行业报道    |
| Trae（字节）       | 国内 **41.2% 第一** / 600万+用户                            | 国内 AI 原生 IDE 龙头           | IDC 中国 Q1 2025 报告 |
| Vim / Neovim       | 24.3% / 14%                                                 | 终端经典                        | SO 2025 调查          |
| WebStorm           | JetBrains 前端专精，2025.1 起 AI 免费                       | 商业 IDE 标杆                   | JetBrains             |
| Windsurf           | 5% / 百万用户 / Cascade agent                               | AI 原生第二                     | SO 2025               |
| Zed                | Rust，0.4s 启动，免费开源                                   | 高性能新锐编辑器                | 行业评测              |
| Antigravity / Kiro | 2025 末新出，adoption 早期                                  | Google / AWS 的 agent-first IDE | InfoWorld / JRebel    |

### 关键判断

- **JetBrains Fleet 已于 2025.12 停止维护**（转做 agentic 工具 Air）→ **不立叶**。
- **去重边界**：Claude Code / Codex / Gemini CLI 等 CLI agent 已在「大语言模型 > Agent」分类（[categories.ts:770-779](../../apps/quiz-backend/prisma/content/categories.ts#L770-L779)）→ 不属 IDE；云 IDE 已被隔壁「在线编辑器（StackBlitz / CodeSandbox / Expo）」叶覆盖 → IDE 叶聚焦**本地 GUI IDE/编辑器**。
- **不立叶**：IntelliJ IDEA / Visual Studio 完整版（前端语境被 WebStorm/VSCode 覆盖）、Antigravity / Kiro（太新，沉淀不足，等下一批再评估）。

### 敲定叶子集合（10 叶）

用户决策：**6 叶 + 经典编辑器**；Vim/Neovim 合并为单叶。后追加 **Antigravity、Kiro** 两叶（Google / AWS 的新兴 agent-first IDE），共 10 叶。

| sort | 叶子名       | 文件名              | 阵营                   | 出题侧重                                                         |
| ---- | ------------ | ------------------- | ---------------------- | ---------------------------------------------------------------- |
| 1    | VSCode       | `vscode.json`       | 霸主                   | 扩展生态、工作区、调试、settings/keybindings、任务、远程开发     |
| 2    | Cursor       | `cursor.json`       | AI 原生（VSCode fork） | Tab/Composer/Agent、`.cursorrules`、@-上下文、与 VSCode 差异     |
| 3    | WebStorm     | `webstorm.json`     | 商业 IDE               | 语义索引、重构、调试、框架支持、与 VSCode 取舍                   |
| 4    | Windsurf     | `windsurf.json`     | AI 原生                | Cascade agent、Flows、与 Cursor 差异                             |
| 5    | Trae         | `trae.json`         | AI 原生（国内龙头）    | SOLO / Builder 模式、国内模型集成、与 Cursor 差异                |
| 6    | Zed          | `zed.json`          | 高性能新锐             | Rust 内核/性能、协作、AI 集成、配置哲学                          |
| 7    | Antigravity  | `antigravity.json`  | 新兴 agentic（Google） | Gemini 集成、agent-first、Editor/Manager 视图、与 Cursor 差异    |
| 8    | Kiro         | `kiro.json`         | 新兴 agentic（AWS）    | spec-driven 开发、agent hooks、steering、与其他 AI IDE 差异      |
| 9    | Vim/Neovim   | `vim-neovim.json`   | 经典终端               | 模式编辑/快捷键共性 + Neovim 现代化差异（Lua/内置 LSP/插件生态） |
| 10   | Sublime Text | `sublime-text.json` | 经典轻量               | 多光标、Goto Anything、Package Control、性能                     |

> 排序按「霸主 → AI 原生 → 新锐 → 经典」聚类，便于对比教学（VSCode↔Cursor 相邻）。`sort` 仅影响显示顺序，不影响题目关联，可微调。

---

## 三、categories.ts 改动

将 [categories.ts:384-397](../../apps/quiz-backend/prisma/content/categories.ts#L384-L397) 的 IDE children 从 2 叶扩为 10 叶：

```ts
{
  name: "IDE",
  sort: 1,
  children: [
    { name: "VSCode", sort: 1 },
    { name: "Cursor", sort: 2 },
    { name: "WebStorm", sort: 3 },
    { name: "Windsurf", sort: 4 },
    { name: "Trae", sort: 5 },
    { name: "Zed", sort: 6 },
    { name: "Antigravity", sort: 7 },
    { name: "Kiro", sort: 8 },
    { name: "Vim/Neovim", sort: 9 },
    { name: "Sublime Text", sort: 10 },
  ],
},
```

> 新增 8 个叶子，不动其它节点。叶子名即题目 `categories` 字段第二元素，须逐字一致。

---

## 四、出题规划

### 题量预估（重质不限量，按深度给足，不设上限）

| 叶子         | 预估区间 | 说明                             |
| ------------ | -------- | -------------------------------- |
| VSCode       | 80-120   | 生态最丰富                       |
| Cursor       | 60-90    | AI 特性密集                      |
| Vim/Neovim   | 60-90    | 合并叶，内容厚                   |
| WebStorm     | 50-70    | 商业 IDE 全功能                  |
| Windsurf     | 40-60    | AI 原生                          |
| Trae         | 40-60    | AI 原生 + 国内特性               |
| Zed          | 40-60    | 新锐                             |
| Antigravity  | 40-60    | 新兴 agentic（Google/Gemini）    |
| Kiro         | 40-60    | 新兴 agentic（AWS，spec-driven） |
| Sublime Text | 30-45    | 相对轻量                         |

合计预估 **~400-600 题**（以实际深度为准）。

### 题目格式（内嵌 categories）

```json
{
  "stem": "VSCode: <题干，必含技术名前缀>",
  "explanation": "<Markdown 解析，有信息量>",
  "tags": ["vscode", "<主题>"],
  "categories": [
    ["技术方向", "VSCode"],
    ["难度", "入门|初级|中级|高级|专家"]
  ],
  "options": [{ "text": "...", "isCorrect": true, "description": "<选项解析>" }]
}
```

> Vim/Neovim 叶的题目，stem 前缀按题目针对性写 `Vim:` / `Neovim:` / `Vim/Neovim:`，但 `categories` 统一为 `["技术方向", "Vim/Neovim"]`。

---

## 五、三件套另两件产出规范（VitePress 笔记 + Slidev 幻灯片）

总流程见 [20260327-content-production-workflow.md](./20260327-content-production-workflow.md)，IDE 章节落地要点：

### VitePress 笔记（IllegalCreedWebsite）

- **路径**：`src/zh/frontend-develop-tools/ide/<leaf>/`（新建 `ide/` 子目录，与现有 `static-analysis/` 平级）
- **文件**：`index.md`（概览：一句话定义 / 优缺点评价 / 文档·GitHub·幻灯片链接）+ `getting-started.md`（速查 / 安装 / 配置 / 基本用法）；大叶（VSCode、Vim/Neovim）按需加 `guideline-*.md` 多页
- **sidebar**：`.vitepress/config.mts`（~line 2900）IDE 的 `items` 现为空占位 `[{text:"VScode"},{text:"WebStorm"}]`，扩为 8 叶并补 `link`
- **路径名**（kebab-case）：`vscode` / `cursor` / `webstorm` / `windsurf` / `trae` / `zed` / `vim-neovim` / `sublime-text`

### Slidev 幻灯片（SlideStack）

- 新建 `packages/<leaf>-slide/`（复制近期 deck 改，如 `prettier-slide`）；`@slidev/cli` 锁 `^52.15.2`
- `slides.md` 轻量入门风格；禁标题/cover 反引号、单页容器 980×552 overflow:hidden、`:::` admonition 用 blockquote 代替
- **门禁**：`pnpm -C packages/<leaf>-slide run build` 后 `node scripts/check-slidev-overflow.mjs <leaf>-slide` → **0 溢出**才算完成

---

## 六、内容审查流程（每叶必做，遵循 CLAUDE.md）

逐叶执行：**WebFetch 官方文档首页 → 逐页 WebFetch（3-8 页）→ context7 / zread 双重校验 → 本地验证（如可装则实测）→ 交叉比对后出题**。

官方文档起点（待逐叶 WebFetch 验证）：

| 叶子         | 官方文档起点                                    |
| ------------ | ----------------------------------------------- |
| VSCode       | https://code.visualstudio.com/docs              |
| Cursor       | https://docs.cursor.com                         |
| WebStorm     | https://www.jetbrains.com/help/webstorm/        |
| Windsurf     | https://docs.windsurf.com                       |
| Trae         | https://docs.trae.ai （另查国内版 trae.com.cn） |
| Zed          | https://zed.dev/docs                            |
| Vim/Neovim   | https://neovim.io/doc/ + https://vimhelp.org    |
| Sublime Text | https://www.sublimetext.com/docs/               |

**禁止**：把"文档摘要未提及"当"已废弃"；未本地验证就改用户已有正确内容；仅凭 context7/AI 总结下"过时"结论。

---

## 七、质量门禁

- 每题 `stem` 含技术名前缀；`categories` 叶子名与 categories.ts 完全一致。
- 题干、解析、**每个选项的 description** 都准确、有信息量，杜绝凑数与模板化重复。
- 难度分布合理（入门→专家），覆盖各叶的出题侧重维度（见第二节表）。
- AI 原生 IDE（Cursor/Windsurf/Trae/Zed）务必抓住其**与 VSCode/彼此的差异**，避免四叶题目同质化。

---

## 八、执行顺序（三件套）

1. 改 `categories.ts`（IDE children 2→8 叶）。✅ 随本方案落地。
2. **VSCode 标杆先行**：先精做 VSCode 一叶的完整三件套（笔记 + 幻灯片 + 题目），作为质量标杆与节奏模板，供用户审阅认可后再推其余 7 叶。
3. **逐叶串行**（VSCode → Cursor → WebStorm → Windsurf → Trae → Zed → Antigravity → Kiro → Vim/Neovim → Sublime Text）。每叶按序产出：
   - **调研**：逐页 WebFetch 官方文档 + context7/zread 双校验（第六节）
   - **笔记**：`ide/<leaf>/` index + getting-started（+ sidebar link）
   - **幻灯片**：`<leaf>-slide` deck → build → 防溢出 0 溢出
   - **题目**：`<leaf>.json`（内嵌 categories）→ 自查质量门禁
4. **导入**：题目写完跑 `pnpm -C apps/quiz-backend run import:content:prod`（**铁律：只导 prod，幂等追加；严禁 dev/test**）。
5. **提交**：三仓库各自提交（quiz-monorepo / IllegalCreedWebsite / SlideStack），commit 用 `feat: IDE 章节 <leaf> 三件套`。

---

## 九、涉及文件

| 仓库                | 文件                                                                                                       | 操作                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| quiz-monorepo       | `apps/quiz-backend/prisma/content/categories.ts`                                                           | IDE children 2→8 叶           |
| quiz-monorepo       | `apps/quiz-backend/prisma/content/{vscode,cursor,webstorm,windsurf,trae,zed,vim-neovim,sublime-text}.json` | 新建，逐叶题目                |
| quiz-monorepo       | `docs/plans/20260615-ide-content.md`                                                                       | 本计划归档                    |
| IllegalCreedWebsite | `src/zh/frontend-develop-tools/ide/<leaf>/*.md`                                                            | 新建，逐叶笔记                |
| IllegalCreedWebsite | `.vitepress/config.mts`                                                                                    | IDE sidebar 扩 8 叶 + 补 link |
| SlideStack          | `packages/<leaf>-slide/`                                                                                   | 新建，逐叶幻灯片              |
