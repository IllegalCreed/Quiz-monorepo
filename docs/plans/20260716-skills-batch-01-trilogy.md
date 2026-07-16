# Skills 章批 01 三件套生产计划（规范 + 首批工程方法）

> 状态：调研完成，逐叶生产进行中。开批日期 2026-07-16。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（本批 = 其「三件套生产顺序」第 1 批）。

## 本批范围（5 技术叶）

| #   | 叶名（须与 `content/categories.ts` 完全一致） | 分组                 | 规范仓库                         | 核验版本/提交                      |
| --- | --------------------------------------------- | -------------------- | -------------------------------- | ---------------------------------- |
| 1   | Agent Skills 规范与生态                       | 规范、发现与创作     | `agentskills/agentskills`        | HEAD `38a2ff8`（2026-07-09）       |
| 2   | Skills CLI 与 find-skills                     | 规范、发现与创作     | `fockus/claude-skill-find-skill` | v1.0.1（`74c2a4d`, 2026-04-21）    |
| 3   | Grill Me                                      | 工程方法与上下文管理 | `mattpocock/skills`              | HEAD `e9fcdf9`（2026-07-14）       |
| 4   | Grill With Docs                               | 工程方法与上下文管理 | `mattpocock/skills`              | HEAD `e9fcdf9`（2026-07-14）       |
| 5   | gstack                                        | 工程方法与上下文管理 | `garrytan/gstack`                | v1.60.1.0（`a325940`, 2026-07-14） |

> 生产库尚未迁移新分类。三件套内的 VitePress 测试链接在获得真实数字叶 ID 前，一律用**占位**（`?category=PENDING`），获准导入后回填。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Agent Skills 规范与生态

| 结论                                                                                                                                                          | 一手来源                                                    | 本地验证                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| Skill = 含 `SKILL.md` 的目录；必填 `name`/`description`，可选 `license`/`compatibility`/`metadata`/`allowed-tools`                                            | `agentskills/agentskills` `docs/specification.mdx`          | 克隆仓库逐字读取 spec                 |
| 渐进披露三阶段：Discovery（~100 token 元数据）→ Activation（<5000 token 正文）→ Execution（按需 `scripts/`·`references/`·`assets/`）                          | 同上 + Anthropic 工程博客                                   | spec `## Progressive disclosure` 段   |
| `name` 规则：1–64 字符、小写字母数字连字符、不得首尾连字符、不得连续连字符、须与父目录同名                                                                    | `docs/specification.mdx` `#name`                            | 逐条读取                              |
| 由 Anthropic 发起并开源，已被 Claude Code / Codex / Gemini CLI / Copilot / Cursor 等采纳（开放标准）                                                          | 仓库 README `## Open development` + 客户端目录              | `docs/clients.mdx` + `agentskills.io` |
| 官方创作最佳实践：从真实专长起步、gotchas 段、模板、校验循环、plan-validate-execute、给默认不给菜单、按脆弱度校准控制                                         | `docs/skill-creation/best-practices.mdx`                    | 逐字读取                              |
| Claude Code 在开放规范之上扩展字段（`disable-model-invocation`/`user-invocable`/`context: fork`/`model`/`effort`/`paths`/`hooks` 等），须与可移植规范字段区分 | 官方 `code.claude.com/docs/en/skills` frontmatter reference | WebFetch 官方文档持久化读取           |
| Skill 工艺词汇：可预测性、上下文负载 vs 认知负载、leading words、失败模式（premature completion / duplication / sediment / sprawl / no-op / negation）        | `mattpocock/skills` `writing-great-skills/SKILL.md`         | 克隆仓库读取                          |
| 校验 CLI：`skills-ref validate ./my-skill`                                                                                                                    | spec `## Validation` + `skills-ref/` 参考实现               | 克隆仓库 `skills-ref/` 目录存在       |

### 叶 2 · Skills CLI 与 find-skills

| 结论                                                                                                                                       | 一手来源                                                 | 本地验证             |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------- |
| find-skill = 多 agent skill 发现/安装 CLI：4835 skills / 14 源 / 4 agent（Claude Code·Codex·OpenCode·Cursor）                              | `fockus/claude-skill-find-skill` README                  | 克隆仓库读取         |
| 安装三法：`brew tap fockus/tap && brew install find-skill`、`pipx install find-skill`、curl 一行；均以 `/find-skill`+`/install-skill` 落地 | README `## Install`                                      | 逐字读取             |
| 两命令：`/find-skill <query>`（搜）+ `/install-skill <owner/repo>`（装），带 `--agent`/`--limit`/`--page`/`--all`/`--target` 等 flag       | README + `SKILL.md`                                      | 读取 SKILL.md 参数表 |
| 6 阶段工作流：新鲜度检查→理解查询→本地目录搜索→（<2 结果时）SkillsMP 兜底→展示→确认后安装                                                  | `SKILL.md` Stage 0–6                                     | 逐段读取             |
| 排序 = 查询相关度 + 源信任优先级 + 星数加成（Python 打分算法内嵌 SKILL.md）；本地离线优先，`catalogue.json` 4835 条                        | `SKILL.md` Stage 2 脚本                                  | 读取内嵌 Python      |
| 安装即格式转换：Codex 1:1，OpenCode 加 `tools`，Cursor 加 `allowed-tools`，正文逐字保留                                                    | README `## Format conversion details`                    | 读取转换表           |
| 铁律：未确认不安装；缓存优先省 API；不明源须标风险                                                                                         | `SKILL.md` `## Rules`                                    | 读取                 |
| 广义「Skills CLI」生态：`skills-ref validate`（校验）、`npx skills add`（skills.sh 安装）、`claude plugin marketplace add`（插件）         | Agent Skills spec + mattpocock README + Claude Code 文档 | 三处克隆/文档交叉    |

### 叶 3 · Grill Me

| 结论                                                                                                     | 一手来源                                                      | 本地验证         |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `grill-me` = 用户触发（`disable-model-invocation: true`）的薄封装，正文仅「Run a `/grilling` session.」  | `mattpocock/skills` `skills/productivity/grill-me/SKILL.md`   | 克隆仓库逐字读取 |
| 引擎 `grilling`（模型可触发）：逐一提问、每问给推荐答案、事实自查环境、决策留给用户、达成共识前不动手    | `skills/productivity/grilling/SKILL.md`                       | 逐字读取         |
| 定位：治「Agent 没做我要的」——对齐先于编码；对比 GSD/BMAD/Spec-Kit「接管流程」，本套「小、可改、可组合」 | 仓库 README `### #1` + `## Why These Skills Exist`            | 读取 README      |
| user-invoked vs model-invoked：用户触发零上下文负载但耗认知负载；可互调（用户级可调模型级，反之不行）    | README `## Reference` + `writing-great-skills/SKILL.md`       | 读取             |
| 两条安装路径：`npx skills@latest add mattpocock/skills`（拷贝可改）vs Claude Code 插件（托管只读自更新） | README `## Quickstart` / `## Install as a Claude Code plugin` | 读取             |

### 叶 4 · Grill With Docs

| 结论                                                                                                        | 一手来源                                      | 本地验证         |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------- |
| `grill-with-docs` = 用户触发薄封装：「Run a `/grilling` session, using the `/domain-modeling` skill.」      | `skills/engineering/grill-with-docs/SKILL.md` | 克隆仓库逐字读取 |
| = grill-me 的访谈 + 同步建 `CONTEXT.md`（术语表/ubiquitous language）+ ADR                                  | 仓库 README `### #2`                          | 读取             |
| `domain-modeling` 引擎：挑战术语、锐化模糊语、编造边界场景、与代码交叉核对、就地更新 CONTEXT.md、稀疏建 ADR | `skills/engineering/domain-modeling/SKILL.md` | 逐字读取         |
| CONTEXT.md 格式：`## Language` 术语块 + `_Avoid_` 同义词、只含项目专有词、纯术语表禁实现细节                | `domain-modeling/CONTEXT-FORMAT.md`           | 读取             |
| ADR 格式：`docs/adr/NNNN-slug.md` 顺序编号；只在「难逆 + 无context 会困惑 + 真实权衡」三条全真时建          | `domain-modeling/ADR-FORMAT.md`               | 读取             |
| 价值：共享语言降 Agent 冗长、命名一致、更省 thinking token                                                  | README `### #2` TIP                           | 读取             |
| 活样例：仓库自带 `CONTEXT.md`（Issue tracker / Issue / Decision ticket 术语 + Flagged ambiguities）         | `mattpocock/skills/CONTEXT.md`                | 读取             |

### 叶 5 · gstack

| 结论                                                                                                                                                                        | 一手来源                                                        | 本地验证                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| gstack = 把 Claude Code 变虚拟工程团队：23 专家 + 8 power tool，全 slash 命令、全 Markdown、MIT                                                                             | `garrytan/gstack` README + VERSION                              | 克隆仓库读取（VERSION=1.60.1.0） |
| 冲刺流程 Think→Plan→Build→Review→Test→Ship→Reflect，技能链式衔接（office-hours 写设计文档喂给下游）                                                                         | README `## The sprint`                                          | 读取                             |
| 安装：`git clone --single-branch --depth 1 … ~/.claude/skills/gstack && ./setup`；需 Claude Code/Git/Bun v1+/(Win)Node                                                      | README `## Install`                                             | 读取                             |
| 团队模式 `./setup --team` + `gstack-team-init required`：会话启动限流自动更新（每小时一次、静默、断网安全）                                                                 | README Step 2                                                   | 读取                             |
| 核心角色技能：`/office-hours`·`/plan-ceo-review`(4 模式)·`/plan-eng-review`·`/review`·`/investigate`(3 次失败即停)·`/qa`(真浏览器)·`/cso`(OWASP+STRIDE)·`/ship`·`/autoplan` | README `## The sprint` 表                                       | 逐行读取                         |
| 多 agent：10 家（Claude Code/Codex/OpenCode/Cursor/Factory/Slate/Kiro/Hermes/GBrain），`./setup --host <name>`                                                              | README `### Other AI Agents`                                    | 读取                             |
| 安全护栏：`/careful`·`/freeze`·`/guard`·`/unfreeze`；`--no-prefix`(/qa) vs `--prefix`(/gstack-qa)                                                                           | README Power tools + Troubleshooting                            | 读取                             |
| 哲学 ETHOS：Boil the Ocean（完整性成本趋零）、压缩比表（样板~100× 研究~3×）、注入每技能前言                                                                                 | `ETHOS.md`                                                      | 读取                             |
| LOC 争议：README 承认原始行数因 AI 膨胀，用「逻辑行」度量并附方法论文档——内容须中立呈现工程价值而非生产力营销                                                               | README `## …LOC Controversy` + `docs/ON_THE_LOC_CONTROVERSY.md` | 读取                             |
| 提示注入防御、GBrain 持久知识库、Conductor 并行 10–15 冲刺                                                                                                                  | README `## Parallel sprints` / `## GBrain`                      | 读取                             |

## 文件映射

### VitePress（`/Users/zhangxu/workspace/IllegalCreedWebsite`）

叶目录：`src/zh/large-language-model/skills/{slug}/`；每叶 `index.md` + `getting-started.md` + `guide-line.md` + `reference.md`（深叶可再拆）。

| 叶  | slug                     | 页面                                             |
| --- | ------------------------ | ------------------------------------------------ |
| 1   | `agent-skills-spec`      | index / getting-started / guide-line / reference |
| 2   | `skills-cli-find-skills` | index / getting-started / guide-line / reference |
| 3   | `grill-me`               | index / getting-started / guide-line / reference |
| 4   | `grill-with-docs`        | index / getting-started / guide-line / reference |
| 5   | `gstack`                 | index / getting-started / guide-line / reference |

sidebar：`.vitepress/config.mts` Skills 节点重构为两分组「规范、发现与创作」「工程方法与上下文管理」（Superpowers/Everything Claude Code 归后组，路径不动）。

### Slidev（`/Users/zhangxu/workspace/SlideStack`）

| 叶  | 包名                                    |
| --- | --------------------------------------- |
| 1   | `packages/agent-skills-spec-slide`      |
| 2   | `packages/skills-cli-find-skills-slide` |
| 3   | `packages/grill-me-slide`               |
| 4   | `packages/grill-with-docs-slide`        |
| 5   | `packages/gstack-slide`                 |

### Quiz（本仓库 `apps/quiz-backend/prisma/content/`）

| 叶  | JSON                          | categories 叶名           |
| --- | ----------------------------- | ------------------------- |
| 1   | `agent-skills-spec.json`      | Agent Skills 规范与生态   |
| 2   | `skills-cli-find-skills.json` | Skills CLI 与 find-skills |
| 3   | `grill-me.json`               | Grill Me                  |
| 4   | `grill-with-docs.json`        | Grill With Docs           |
| 5   | `gstack.json`                 | gstack                    |

## 逐叶完成状态

| 叶                          | VitePress                                     | Slidev（页/overflow） | Quiz（题数） | 状态                                |
| --------------------------- | --------------------------------------------- | --------------------- | ------------ | ----------------------------------- |
| 1 Agent Skills 规范与生态   | ✅ index+getting-started+guide-line+reference | ✅ 15 页 / 0 溢出     | ✅ 36 题     | 内容完成（待 sidebar + 全批 build） |
| 2 Skills CLI 与 find-skills | ✅ index+getting-started+guide-line+reference | ✅ 13 页 / 0 溢出     | ✅ 29 题     | 内容完成（待 sidebar + 全批 build） |
| 3 Grill Me                  | ✅ index+getting-started+guide-line+reference | ✅ 12 页 / 0 溢出     | ✅ 22 题     | 内容完成（待 sidebar + 全批 build） |
| 4 Grill With Docs           | ✅ index+getting-started+guide-line+reference | ✅ 13 页 / 0 溢出     | ✅ 21 题     | 内容完成（待 sidebar + 全批 build） |
| 5 gstack                    | ✅ index+getting-started+guide-line+reference | ✅ 13 页 / 0 溢出     | ✅ 34 题     | 内容完成（待 sidebar + 全批 build） |

> 题库合计 **142 题**（36+29+22+21+34）；幻灯片合计 **66 页**（15+13+12+13+13），全 0 溢出。

## 全批门禁（全 5 叶完成后）

- [x] VitePress `pnpm docs:build` 0 死链/0 Vue 编译错（exit 0，build complete in 1287s，5 叶 × 4 页全产出）
- [x] 5 个 Slidev `pnpm -C packages/{pkg} run build`（全 exit 0）
- [x] 5 个 `node scripts/check-slidev-overflow.mjs {pkg}` = 0 溢出（66 页全绿）
- [x] Quiz `pnpm -C apps/quiz-backend run audit:content:local` = 0 errors（本批 5 文件 0 告警）
- [x] `git diff --check`（三仓库全通过）
- [x] 三仓库分别 Conventional Commits 提交并推送

## 生产操作（已获用户逐一确认后执行）

1. ✅ **分类迁移**（2026-07-16 完成）：新建「规范、发现与创作」(id=581)、「工程方法与上下文管理」(id=582) 于 Skills(331) 下；Superpowers(332)/ECC(333) 原地 reparent → 582（题数仍 22/21，43 条关联保留）；Skills sort 7→8。
2. ✅ **题库导入 prod**（2026-07-16 完成）：`import:content:prod -- <5 文件>`，新增 142 题，0 道找不到分类；建 Skills 完整 69 叶树。
3. ✅ **只读验收**：Skills 10 一级子类 / 69 叶 / 无同父同名 / 332-333 仍 22-21。
4. ⏳ **部署 ECS**：笔记 dist rsync / 幻灯片 5 包 rsync，两路独立、各自确认、禁混跑。

### 本批 5 叶生产库真实数字叶 ID（已回填 VitePress 测试链接）

| 叶                        | 分类 ID | 父节点                   | 题数 |
| ------------------------- | ------: | ------------------------ | ---: |
| Agent Skills 规范与生态   | **583** | 581 规范、发现与创作     |   36 |
| Skills CLI 与 find-skills | **584** | 581 规范、发现与创作     |   29 |
| Grill Me                  | **587** | 582 工程方法与上下文管理 |   22 |
| Grill With Docs           | **588** | 582 工程方法与上下文管理 |   21 |
| gstack                    | **589** | 582 工程方法与上下文管理 |   34 |

测试链接：`https://quiz.illegalscreed.cn/?category={ID}`。
