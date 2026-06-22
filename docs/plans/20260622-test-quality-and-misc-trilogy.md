# 测试方法与质量（4 叶）+ 其他工具（Faker.js）三件套方案 / 交接

> **范围**：前端测试章收尾批次，共 **5 个新叶**——「测试方法与质量」组补 **可访问性测试 / 视觉回归测试 / 变异测试 / 属性测试** 4 叶，「其他工具」组用 **Faker.js** 收口（删除 Mailtrap 空占位）。完整三件套——Quiz 题目（quiz-monorepo）+ VitePress 笔记（IllegalCreedWebsite）+ Slidev 幻灯片（SlideStack），跨 3 仓库。
> **选型调研**：2026-06-22，4 路并行 subagent，每候选 context7 + 官方网页/GitHub releases 双源核实；用户已就「全 4 候选 + Faker.js」逐项拍板。
> **前置**：单元/组件/端到端/方法与质量（覆盖率+快照）共 14 叶已全部收官上线（见 [20260619-frontend-testing-trilogy.md](./20260619-frontend-testing-trilogy.md)、[20260620-e2e-testing-trilogy.md](./20260620-e2e-testing-trilogy.md)）。
> **本文件亦作跨会话交接（handoff）**：进度见文末「§六、进度跟踪」，新会话从那里接着干。

---

## 一、选型调研结论（2026-06-22 双源核实）

用户原始诉求是「其他工具组只有 Mailtrap，还该补什么」。调研后两点关键发现：

1. **Mailtrap 价值不足**：本质是邮件投递基础设施（SMTP 沙箱 + Email Sending API），偏后端/邮件工程，与「Vue+Vite 前端测试」脱节；且 Mailtrap 2026 已自我转型主推 Email API/营销发送。MailHog 已废弃（2020 停更），Mailpit/Ethereal 同样偏后端。→ **删除 Mailtrap 占位**。
2. **真正高价值的缺口在「测试方法与质量」横切组**：4 个概念叶与现有「代码覆盖率/快照测试」同维度、与现有 14 叶零重复、2026 仍主流活跃、且多与本项目强相关。

### 候选评估表（一手数据，两路信源交叉核实）

| 叶               | 主轴 / 最新版（2026-06 核实）                                     | 2026 定位                                    | 项目相关性                                             | 结论                             |
| ---------------- | ----------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ | -------------------------------- |
| **可访问性测试** | axe-core **4.12.1**（2026-06-10，月更）                           | a11y 测试事实标准引擎，一个引擎辐射 6 种宿主 | 通用                                                   | ✅ 立叶（方法与质量）            |
| **视觉回归测试** | Chromatic CLI **17.5.0**（2026-06）+ Playwright **1.61** 视觉对比 | 像素级回归两条主线：云端评审 vs 免费本地     | `packages/ui` 已装 `@chromatic-com/storybook` 但未运营 | ✅ 立 1 概念叶（方法与质量）     |
| **变异测试**     | StrykerJS **9.6.1**（2026-04，v9.4+ 支持 Vitest v4）              | JS 唯一成熟变异测试框架，无竞品              | 项目用 Vitest+Jest，官方 runner 适配                   | ✅ 立叶（方法与质量）            |
| **属性测试**     | fast-check **4.8.0**（2026-05）+ `@fast-check/vitest` **0.4.1**   | JS 属性测试事实标准（QuickCheck 家族）       | 项目大量用 Zod/Valibot 校验                            | ✅ 立叶（方法与质量）            |
| **Faker.js**     | @faker-js/faker **10.5.0**（Node 20+）                            | 测试数据生成事实标准，取代废弃版 faker.js    | 通用；可带 Zod Schema Faker                            | ✅ 立叶（其他工具，替 Mailtrap） |

### 「带过」不立叶项（在相关叶解析中点名即可）

- **jest-axe / vitest-axe / @axe-core/playwright / cypress-axe / pa11y / Lighthouse a11y**：并入「可访问性测试」叶按宿主展开（注意 vitest-axe 正式版停在 0.1.0，维护慢，不当主推）。
- **Applitools / Percy / BackstopJS（已停滞 2024-09）/ cypress-image-snapshot**：在「视觉回归测试」叶作对照带过；**Storybook 视觉 addon = Chromatic 云**，并入 Chromatic 讲。
- **Allure / Mochawesome / 各框架内置 reporter**：是报告工具非测试方法，在各框架叶带 1-2 题即可。
- **Mailosaur / 云测试平台（BrowserStack/Sauce/TestMu AI(原 LambdaTest)）**：邮件/OTP 流并入 E2E 叶；云平台是执行 grid 非独立技术，Selenium/WebdriverIO 叶带过。

### 决策要点

- **视觉回归做 1 个概念叶**（非 Chromatic / Playwright视觉 拆 2 叶）：与「代码覆盖率」（v8/istanbul）、「快照测试」（Vitest/Jest）一样，按概念立叶、叶内涵盖多工具，保持横切组范式统一。叶内主线：像素 diff 原理 → Chromatic（云端+Storybook+TurboSnap）→ Playwright `toHaveScreenshot`（本地免费）→ 阈值/稳定化 → CI → 最佳实践（BackstopJS 反例、Applitools/Percy 对照）。
- **Storybook 测试不立叶**：官方已把 `@storybook/test-runner` 判为「superseded by Vitest addon」，其本质 = Vitest Browser Mode + story 复用，单立必与现有「Vitest Browser Mode」叶重复。（附：CLAUDE.md 测试策略表 `ui` 行「Playwright (Storybook, 10 story)」已过时，真实栈 = `@storybook/addon-vitest` + Vitest 4 browser，Playwright 仅 provider；后续可顺手修文档。）

---

## 二、5 叶内容规划

> **stem 前缀提示**：每题须含技术名前缀——可访问性用「可访问性测试」/「axe-core」；视觉回归用「视觉回归测试」/「Chromatic」/「Playwright 视觉」；变异用「变异测试」/「StrykerJS」/「Stryker」；属性用「属性测试」/「fast-check」；Faker 用「Faker.js」/「Faker」。

| 叶               | 笔记/题库核心要点                                                                                                                                                                                                                                                                                                 | 边界/对比（带过）                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **可访问性测试** | WCAG/ARIA 概念、axe-core 引擎与规则、impact 分级、`run()` API；按宿主展开：单测（jest-axe / vitest-axe `toHaveNoViolations`）→ 组件（Testing Library + jest-dom）→ E2E（`@axe-core/playwright`、cypress-axe）→ CI 批扫（pa11y-ci、Lighthouse CI）；**自动化只覆盖 ~30-40%，键盘/焦点/tab 顺序需人工**这一边界认知 | vitest-axe 维护慢（标注风险）；与 Testing Library 叶的关系：TL 叶留一句指引指向本叶                                                |
| **视觉回归测试** | 像素 diff 原理（pixelmatch/YIQ）；Chromatic：story=视觉+交互+a11y 三合一、baseline/评审签核、TurboSnap（Git 感知增量）、CI 自动接受；Playwright `toHaveScreenshot`：`threshold`/`maxDiffPixels`/`mask`/`stylePath`/`animations:disabled`、两次连拍稳定化、按 OS 命名 golden                                       | BackstopJS（2024-09 停滞，反例）、Applitools Visual AI / Percy（企业向对照）、cypress-image-snapshot（认准 simonsmith v10 维护版） |
| **变异测试**     | 变异分数（mutation score）vs 覆盖率、survived/killed/no-coverage/timeout mutant、变异算子、`@stryker-mutator/vitest-runner` / jest-runner 配置、`coverageAnalysis: perTest`、增量与性能、CI 门禁                                                                                                                  | 与「代码覆盖率」叶互补（量→质）：覆盖率讲「跑到多少行」，变异讲「测试是否真在断言」                                                |
| **属性测试**     | example-based → invariant 思维转变、`fc.assert(fc.property(...))`、arbitrary 生成器、**shrinking 自动收缩最小反例**、`numRuns`/`seed` 复现、`@fast-check/vitest` 的 `test.prop`、model-based 测试                                                                                                                 | 与「快照测试」正交（快照断言「长这样」，属性断言「对任意输入满足某性质」）；对工具函数/Zod·Valibot 校验价值高                      |
| **Faker.js**     | 取代废弃版 faker.js、模块体系（person/internet/location/finance/commerce/helpers...）、`faker.seed()` 确定性（测试可复现关键）、locale 本地化、`faker.helpers`（arrayElement/multiple/fake 模板）、与测试框架/工厂函数结合造 fixture                                                                              | 与 Zod 结合（zod-schema-faker 带过）；vs 属性测试 fast-check 的边界（造「看起来真」的数据 vs 探索「任意」输入）                    |

---

## 三、分类结构（categories.ts 改动）

`前端测试 (sort 6)` 下两处改动：

```
测试方法与质量 (sort 4)
├── 代码覆盖率 (1)        [已有]
├── 快照测试 (2)          [已有]
├── 可访问性测试 (3)      ← 新增
├── 视觉回归测试 (4)      ← 新增
├── 变异测试 (5)          ← 新增
└── 属性测试 (6)          ← 新增

其他工具 (sort 5)         ← 由叶「其他工具（Mailtrap）」改为分组
└── Faker.js (1)          ← 新增（替换 Mailtrap）
```

> **⚠️ 分类移动坑（CLAUDE.md / 记忆 `content-deploy-workflow`）**：
>
> - **测试方法与质量新增 4 叶**：父节点不变、纯新增，`import:content:prod` 按 `key=groupId:parentId:name` 只增不删，**安全**（直接 import 即建新叶）。
> - **其他工具：叶→组改造有坑**。prod 现状（2026-06-19 plan 实测）：`其他工具(Mailtrap)` = 叶节点 **#154**，挂在 `前端测试#144` 下，**0 题目**。本批要把它从「叶」改成「带 Faker.js 子节点的组」。import 幂等只增不改，处理不了「叶变组」。因 #154 零题库无损，**prod 迁移方案（须用户确认 · 在首次本批 import 之前执行）**：删除 #154 旧叶 → import 时新建 `其他工具`（组）+ `Faker.js`（叶）。（prod 连接见记忆 `quiz-prod-rds-connection`）

---

## 四、路径与命名约定

| 叶           | 题库 JSON                            | quiz category                 | Slidev 包                              | VitePress 笔记目录                            |
| ------------ | ------------------------------------ | ----------------------------- | -------------------------------------- | --------------------------------------------- |
| 可访问性测试 | `content/accessibility-testing.json` | `["技术方向","可访问性测试"]` | `packages/accessibility-testing-slide` | `testing/test-quality/accessibility-testing/` |
| 视觉回归测试 | `content/visual-regression.json`     | `["技术方向","视觉回归测试"]` | `packages/visual-regression-slide`     | `testing/test-quality/visual-regression/`     |
| 变异测试     | `content/mutation-testing.json`      | `["技术方向","变异测试"]`     | `packages/mutation-testing-slide`      | `testing/test-quality/mutation-testing/`      |
| 属性测试     | `content/property-testing.json`      | `["技术方向","属性测试"]`     | `packages/property-testing-slide`      | `testing/test-quality/property-testing/`      |
| Faker.js     | `content/faker.json`                 | `["技术方向","Faker.js"]`     | `packages/faker-slide`                 | `testing/other-tools/faker/`                  |

- 笔记根：`IllegalCreedWebsite/src/zh/frontend-develop-tools/`。每叶 = `index.md`（概览）+ `getting-started.md`（入门）+ `guide-line/*.md`（深度页）+ `reference.md`（参考）。
- 难度维度：题目 `categories` 另含 `["难度","入门"/"进阶"/...]`（沿用现有 test JSON 的取值）。

---

## 五、三件套门禁（强制 · 未过不算完成）

- **Quiz 题目**：重质不限量；每题 `stem` 含技术名前缀；`categories` 叶子名与 [categories.ts](../../apps/quiz-backend/prisma/content/categories.ts) 完全一致；中文内引号用全角（写完跑 node `JSON.parse` 自检，见记忆 `quiz-json-fullwidth-quotes`）。入库只 `import:content:prod`（幂等、增量），**执行前须用户确认**。
- **Slidev 幻灯片**：`pnpm -C packages/{x}-slide run build` 后跑 `node scripts/check-slidev-overflow.mjs {x}-slide`，**0 溢出**才算完成（代码行≈22px / 表格行≈33px / 正文行≈26px）。Slidev 锁 52.15.2。
- **VitePress 笔记**：除 `index.md` 概览页外，每个内容页（`getting-started.md` 及每个 `guide-line/*.md`）`# 标题` + `> 基于X版本` 后**紧跟 `## 速查` 段**；context7 + 官方网页双重校验，不一致以官网+本地验证为准。

---

## 六、进度跟踪（逐叶）

| 组             | 叶           | VitePress 笔记 | Slidev 幻灯片 | Quiz 题库 | prod 导入 |
| -------------- | ------------ | -------------- | ------------- | --------- | --------- |
| 测试方法与质量 | 可访问性测试 | ✅ 9页         | ✅ 25页0溢出  | ✅ 43题   | ✅ id=451 |
| 测试方法与质量 | 视觉回归测试 | ✅ 8页         | ✅ 21页0溢出  | ✅ 42题   | ✅ id=452 |
| 测试方法与质量 | 变异测试     | ✅ 8页         | ✅ 24页0溢出  | ✅ 41题   | ✅ id=453 |
| 测试方法与质量 | 属性测试     | ✅ 8页         | ✅ 19页0溢出  | ✅ 44题   | ✅ id=454 |
| 其他工具       | Faker.js     | ✅ 8页         | ✅ 21页0溢出  | ✅ 40题   | ✅ id=456 |

> 题库合计 **210 题**；笔记 **41 页**；幻灯片 **110 页全 0 溢出**。难度均按房子 5 档分布（中级/高级为主）。

**前置结构任务**：

- [x] categories.ts：测试方法与质量 +4 叶；其他工具 叶→组 + Faker.js
- [x] VitePress sidebar：测试方法与质量 +4 叶；其他工具组 Mailtrap→Faker.js（5 叶 link 全部 dead-link 预检通过）
- [x] prod：删旧「其他工具(Mailtrap)」叶（实测 id=447，0 题 0 子，强校验后已删）
- [x] prod：`import:content:prod` 增量导入 5 库 210 题（分类 id 451-456，导入后巡检验证）

---

## 七、关键来源（2026-06-22 核实）

**可访问性**

- axe-core releases：https://github.com/dequelabs/axe-core/releases （4.12.1）
- jest-axe：https://github.com/nickcolley/jest-axe ；vitest-axe（维护慢）：https://github.com/chaance/vitest-axe
- @axe-core/playwright：https://github.com/dequelabs/axe-core-npm ；cypress-axe：https://github.com/component-driven/cypress-axe
- pa11y：https://pa11y.org/ ；Lighthouse a11y 评分（底层 axe）：https://developer.chrome.com/docs/lighthouse/accessibility/scoring

**视觉回归**

- Chromatic：https://www.chromatic.com/docs/ ；CLI changelog（v17.5.0）：https://github.com/chromaui/chromatic-cli
- Playwright 视觉：https://playwright.dev/docs/test-snapshots ；toHaveScreenshot：https://playwright.dev/docs/api/class-pageassertions
- BackstopJS（停滞）：https://github.com/garris/BackstopJS （npm 6.3.25 / 2024-09）

**变异测试**

- StrykerJS：https://stryker-mutator.io/docs/stryker-js/introduction/ ；releases（v9.6.1）：https://github.com/stryker-mutator/stryker-js/releases

**属性测试**

- fast-check：https://fast-check.dev/docs/ ；ecosystem：https://fast-check.dev/docs/ecosystem/ ；releases（v4.8.0）：https://github.com/dubzzz/fast-check/releases

**Faker.js**

- 官网 guide：https://fakerjs.dev/guide/ （v10.5.0，Node 20+）；releases：https://github.com/faker-js/faker/releases
- context7：`/faker-js/faker`；zod-schema-faker：`/soc221b/zod-schema-faker`

---

_创建：2026-06-22（选型调研 4 路 + 叶集合拍板 + 结构敲定）_
