# Skills 章批 02 三件套生产计划（工程方法扩展 · 完成工程方法组）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-16。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 2 批）。
> 前置：[20260716-skills-batch-01-trilogy.md](./20260716-skills-batch-01-trilogy.md)（批 1 已上线，prod 分类树已建全 69 叶）。

## 本批范围（5 技术叶 · 均属「工程方法与上下文管理」组 id=582）

补齐工程方法组剩余 5 叶（Superpowers/ECC/Grill Me/Grill With Docs/gstack 批 1 已完成，本批后整组 10 叶收满）。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                               | 核验版本/提交                  | 星数(API) |
| --- | ------------------------------- | -------------------------------------- | ------------------------------ | --------- |
| 1   | Compound Engineering            | `EveryInc/compound-engineering-plugin` | HEAD `e745e96`（2026-07-16）   | 23.2k     |
| 2   | GSD Core                        | `open-gsd/gsd-core`                    | v1.7.0 `1bb7240`（2026-07-16） | 6.7k      |
| 3   | Addy Osmani Agent Skills        | `addyosmani/agent-skills`              | HEAD `c1974de`（2026-07-16）   | 78.7k     |
| 4   | BMAD Method                     | `bmad-code-org/BMAD-METHOD`            | V6 `717479b`（2026-07-15）     | 50.7k     |
| 5   | Caveman                         | `JuliusBrussee/caveman`                | HEAD `0d95a81`（2026-07-03）   | 90.0k     |

> **prod 分类树已在批 1 建好**（含这 5 叶的空节点），本批生产**无需分类迁移**，只需 import 新题 + 回填链接 + 部署。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Compound Engineering

| 结论                                                                                                             | 一手来源                 | 本地验证             |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------- |
| 哲学：每单元工程使下一单元更易；80% 规划+审查 / 20% 执行，反技术债累积                                           | README `## Philosophy`   | 克隆逐字读           |
| 核心 6 步循环 brainstorm→plan→work→simplify→review→**compound**，compound 写 learnings 反哺下轮                  | README `## Workflow`     | 读取                 |
| compounding = 系统带记忆：每 PR 教系统、每 bug 成永久教训；Learning(solution doc)/Pattern doc/Explainer/Check-in | `CONCEPTS.md`            | 逐字读 glossary      |
| 30 个 `/ce-*` 技能 + `/lfg` 全自动（plan→work→simplify→review+fix→browser test→commit→push→PR→watch CI 修绿）    | README 全表              | 读取 skills/ 30 目录 |
| 安装 `/plugin marketplace add EveryInc/compound-engineering-plugin` + install；支持 10+ agent                    | README `## Install`      | 读取                 |
| Kieran Klaassen@Every（Cora）+ tmchow，MIT，opinionated                                                          | README `## Contributing` | 读取                 |

### 叶 2 · GSD Core

| 结论                                                                                                                                          | 一手来源                 | 本地验证             |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------- |
| Git.Ship.Done——context-engineering + spec-driven 框架，治 **context rot**（上下文填满致质量退化）                                             | README `## What is`      | 克隆逐字读           |
| 5 步阶段循环 Discuss→Plan→Execute→Verify→Ship，每 milestone 逐 phase                                                                          | README `## How it works` | 读取                 |
| 重活跑 **fresh-context 子代理**（executor 各起 clean 200k），主会话保持精简；STATE.md/CONTEXT.md 跨会话存活                                   | README `## Why it works` | 读取                 |
| 安装 `npx @opengsd/gsd-core@latest`（**禁直接拷 agents/commands**，须 installer 跨运行时）；`/gsd-new-project`·`/gsd-onboard`；34 gsd-\* 代理 | README `## Quickstart`   | 读取 agents/ 34 文件 |
| open-gsd 社区治理续作（原版 GSD 由 TÂCHES；治理沿革**中立呈现**）；v1.7.0 MIT 多运行时；含中文 README                                         | README + open-gsd        | 读取 README.zh-CN.md |

### 叶 3 · Addy Osmani Agent Skills

| 结论                                                                                                                                                 | 一手来源                    | 本地验证                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------ |
| 生产级工程技能——编码资深工程师的工作流/质量门/最佳实践                                                                                               | README 头                   | 克隆逐字读               |
| 6 阶段 DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP；8 slash：/spec /plan /build /test /review /webperf /code-simplify /ship                                 | README `## Commands`        | 读取 commands/           |
| 24 技能（23 生命周期 + using-agent-skills meta）；distinctive: interview-me / source-driven / **doubt-driven**（CLAIM→EXTRACT→DOUBT→RECONCILE→STOP） | README `## All 24 Skills`   | 读取 skills/ 24 目录     |
| 技能解剖：Overview/When/Process/**Rationalizations(excuse+反驳)**/Red Flags/Verification(证据)；process not prose；证据非可选                        | README `## How Skills Work` | 读取                     |
| 内嵌 Google 工程文化：Hyrum's Law / Beyonce Rule / test pyramid / Chesterton's Fence / trunk-based / Shift Left                                      | README `## Why`             | 读取                     |
| 安装 `npx skills add addyosmani/agent-skills`（70+ agent）或 plugin；`/build auto` 自主；4 personas；Addy Osmani MIT 78.7k★                          | README                      | 读取 plugin.json/agents/ |

### 叶 4 · BMAD Method

| 结论                                                                                                                           | 一手来源                | 本地验证                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------- |
| Breakthrough Method for Agile AI Driven Development——敏捷 AI 全流程框架，**scale-adaptive**（bug 修复→企业系统自适应规划深度） | README 头               | 克隆逐字读                      |
| 定位：agent 作**专家协作者**引导你（非替你思考出平庸结果）；12+ 域专家（PM/架构/开发/UX）；**Party Mode** 多角色同场           | README `## Why`         | 读取                            |
| `bmad-help` 技能随时问下一步；完整生命周期 brainstorm→部署；模块 BMM(核心34+工作流)/BMB/TEA/BMGD/CIS                           | README `## Modules`     | 读取 src/bmm-skills·core-skills |
| 安装 `npx bmad-method install`（Node≥20.12/Python≥3.10/uv）；非交互 CI/CD                                                      | README `## Quick Start` | 读取                            |
| **Web Bundles**：BMad 技能打包为 Gemini Gems/ChatGPT GPTs，web 订阅做规划再带进 IDE（省 metered token）                        | README `## Web Bundles` | 读取                            |
| V6；100% 免费 MIT；BMad/BMAD-METHOD 是 BMad Code LLC 商标；50.7k★                                                              | README + TRADEMARK      | 读取                            |

### 叶 5 · Caveman

| 结论                                                                                                                                         | 一手来源                                         | 本地验证     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------ |
| 让 agent 说话像 caveman，省 **65% 输出 token**（实测均值，范围 22-87%），技术准确度 100%                                                     | README `## Benchmarks` + benchmarks/             | 克隆逐字读   |
| 核心规则：删冠词/填充/寒暄/模糊；片段 OK；短同义词；**禁自造缩写**（tokenizer 拆分同样长、零省）；禁因果箭头→；代码/命令/错误逐字保留        | `skills/caveman/SKILL.md`                        | 逐字读       |
| 6 级 lite/full(默认)/ultra + **wenyan 文言文**（80-90% 字符缩减，每 token 载义最多）；保留用户语言                                           | SKILL.md `## Intensity`                          | 读取         |
| **Auto-Clarity**：安全警告/不可逆确认/多步序列歧义时退出 caveman，清晰后恢复                                                                 | SKILL.md `## Auto-Clarity`                       | 读取         |
| 7 技能：/caveman·/caveman-commit·/caveman-review·/caveman-stats·/caveman-compress(改 CLAUDE.md 省 46% 输入永久)·caveman-shrink(MCP)·cavecrew | README `## What you get`                         | 读取 skills/ |
| **诚实数字**：仅省输出，输入/推理不动 + skill 自身加 1-1.5k 输入/轮，已简洁场景可净负；真正价值=可读性/速度，省钱是 bonus                    | README `HONEST NUMBERS` + docs/HONEST-NUMBERS.md | 读取         |
| 安装 `curl install.sh\|bash`（30+ agent）或 plugin；零遥测零 network（装后）；Julius Brussee MIT 90k★                                        | README `## Install`/`## Privacy`                 | 读取         |

## 文件映射

| 叶  | VitePress slug             | Slidev 包                        | Quiz JSON                       | categories 叶名          |
| --- | -------------------------- | -------------------------------- | ------------------------------- | ------------------------ |
| 1   | `compound-engineering`     | `compound-engineering-slide`     | `compound-engineering.json`     | Compound Engineering     |
| 2   | `gsd-core`                 | `gsd-core-slide`                 | `gsd-core.json`                 | GSD Core                 |
| 3   | `addy-osmani-agent-skills` | `addy-osmani-agent-skills-slide` | `addy-osmani-agent-skills.json` | Addy Osmani Agent Skills |
| 4   | `bmad-method`              | `bmad-method-slide`              | `bmad-method.json`              | BMAD Method              |
| 5   | `caveman`                  | `caveman-slide`                  | `caveman.json`                  | Caveman                  |

VitePress sidebar：在「工程方法与上下文管理」组内 gstack 之后追加这 5 叶。

## 逐叶完成状态

| 叶                         | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| -------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Compound Engineering     | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 25 题     | 内容完成 |
| 2 GSD Core                 | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 22 题     | 内容完成 |
| 3 Addy Osmani Agent Skills | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 24 题     | 内容完成 |
| 4 BMAD Method              | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 22 题     | 内容完成 |
| 5 Caveman                  | ✅ 4 页   | ✅ 9 页 / 0 溢出      | ✅ 21 题     | 内容完成 |

> 批 2 合计：笔记 20 页 · 幻灯片 41 页（0 溢出）· 题库 **114 题**（25+22+24+22+21）。

## 全批门禁 + 生产（已完成）

- [x] VitePress build 0 死链（exit 0，5 叶 × 4 页产出）/ 5 Slidev 0 溢出 / Quiz audit 0 errors / git diff --check ×3
- [x] 三仓库 Conventional Commits 提交推送（quiz 36be813 / VitePress 81d23aa+823266e / SlideStack 228f3ad）
- [x] **生产（已获确认执行，无需分类迁移）**：import:content:prod 新增 114 题（0 找不到分类）→ 回填 5 叶真实 ID → rebuild/commit/push → rsync 部署

### 本批 5 叶生产库真实数字叶 ID（已回填测试链接）

| 叶                       | 分类 ID | 题数 |
| ------------------------ | ------: | ---: |
| Compound Engineering     | **590** |   25 |
| GSD Core                 | **591** |   22 |
| Addy Osmani Agent Skills | **592** |   24 |
| BMAD Method              | **593** |   22 |
| Caveman                  | **594** |   21 |

**「工程方法与上下文管理」组现满 10 叶**（Superpowers/ECC/Grill Me/Grill With Docs/gstack + 本批 5 叶）——整组收满。
