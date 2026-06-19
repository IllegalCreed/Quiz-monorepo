# 前端测试 章节内容生产计划 / 交接（分类重构 + 9 叶三件套）

> **状态**：2026-06-19 选型调研 + 分类重构完成，「前端测试」二级分类由 **3 类扩为 5 类**、**9 个工作叶**敲定，用户已逐项拍板，待落地节点骨架 + 逐叶三件套生产。
> **范围**：完整三件套——Quiz 题目（quiz-monorepo）+ VitePress 笔记（IllegalCreedWebsite）+ Slidev 幻灯片（SlideStack），跨 3 仓库。本批做 **单元测试(3) + 组件测试(4) + 测试方法与质量(2) = 9 叶**；端到端测试（Cypress/Playwright）与其他工具（Mailtrap）本批不动。
> **本文件亦作跨会话交接（handoff）**：进度见文末「§六、进度跟踪」，新会话从那里接着干。

---

## 进度速览（给"按这个继续"的未来会话）

- [x] 选型调研（2026-06-19，5 路并行 subagent，每路 context7 + 官方网页双核实）
- [x] **分类重构拍板**：前端测试 5 类（单元 / 组件 / 端到端 / 测试方法与质量 / 其他）；9 个工作叶
  - 组件测试独立成类（VTU/TL/@pinia/Browser Mode 从单元测试移出）
  - 覆盖率/快照独立成「测试方法与质量」横切类（非塞单元、非降小节）
  - axios-mock-adapter + vue-router-mock 降级带过；视觉回归暂不加
- [x] categories.ts 改造（5 类 / 9 工作叶，已验证解析）
- [x] VitePress sidebar 改造（删 axios/router mock，建组件测试组 + 测试方法与质量组）
- [x] **prod 分类树迁移 + Vitest 入库**（旧子树 10 节点已删 → 重建 5 类 9 叶 → Vitest 49 题挂 id=433，重复检查全过）
- [ ] 逐叶三件套生产（9 叶，从 **Vitest 标杆叶** 起）
- [ ] 题库导入 prod（增量幂等 `import:content:prod`，须用户确认）
- [ ] 三仓库各自提交（quiz-monorepo / IllegalCreedWebsite / SlideStack）

---

## 一、Context 与现状

「前端测试」节点已存在但**结构偏薄 + 两仓库不一致**：

- **categories.ts（题库侧）**：`前端测试` 下仅 3 子类——`单元测试`（5 叶占位 Jest/Vitest/Vue Test Utils/MSW/Testing Library）、`端到端测试`（Cypress/Playwright）、`其他工具（Mailtrap）`，**零题库**（content 目录无任何 test json）。见 [categories.ts:485-510](../../apps/quiz-backend/prisma/content/categories.ts#L485)。
- **VitePress sidebar（IllegalCreedWebsite，截图实测）**：单元测试组 7 叶（含 sidebar 独有的 Axios Mock Adapter、Vue Router Mock）。
- **本次同时做两件事**：① 调研 2026 主流单测技术；② **重构「前端测试」分类**——把"单元测试一个大类装所有工具"拆成正交的"测试类型 + 横切技术"维度。

---

## 二、选型调研结论（2026-06-19）

**判据**：① 2026 仍主流 / 活跃维护；② 有独特技术点 / 教学价值；③ 与同类边界清晰、不重复立叶。**受众**：会写 Vue 3 + Vite + Pinia + TypeScript 的前端。

### 候选评估表（一手数据，两路信源交叉核实）

| 技术                    | 最新版 / 最近发布                | 2026 定位                                               | 结论                           |
| ----------------------- | -------------------------------- | ------------------------------------------------------- | ------------------------------ |
| **Vitest**              | v4.1.9 / 2026-06                 | 事实标准、State of JS 满意度 #1、Browser Mode 转正      | ✅ 单元测试主轴                |
| **Jest**                | v30.4 / 2025-06 起               | ~4500 万周下载，ESM 仍 experimental、对 Vite 无配置优势 | ✅ 单元测试（对照）            |
| **MSW**                 | v2.14.6 / 2026-05                | 网络层拦截事实标准、双环境 handler                      | ✅ 单元测试（mock 基础）       |
| **Vue Test Utils**      | v2.4.11 / 2026-06-04             | Vue 官方、`mount`/Wrapper 底层                          | ✅ 组件测试                    |
| **Testing Library**     | vue v8.1.0 + user-event v14.6.1  | 行为测试哲学、语义查询                                  | ✅ 组件测试（user-event 并入） |
| **@pinia/testing**      | v1.0.3 / 2025-12                 | Pinia 官方、72.9 万周下载、`createTestingPinia`         | ✅ 组件测试（项目强相关）      |
| **Vitest Browser Mode** | Vitest v4 GA                     | 真实浏览器跑组件测试 vs jsdom                           | ✅ 组件测试                    |
| **代码覆盖率**          | `@vitest/coverage-v8` / istanbul | 质量度量、横切所有类型                                  | ✅ 测试方法与质量              |
| **快照测试**            | Jest/Vitest 内置                 | 断言技术、横切单元/组件                                 | ✅ 测试方法与质量              |
| ~~axios-mock-adapter~~  | v2.1.0 / **2024-10 后零 commit** | 实质停滞，被 `vi.mock`/MSW 取代                         | 🔻 MSW 叶对比带过              |
| ~~vue-router-mock~~     | v2.0.2 / 2026-03                 | 偏小众（46K 周下载），官方"第三选项"                    | 🔻 VTU 叶路由小节带过          |

### 三个关键发现

1. **`Axios Mock Adapter` 删**：GitHub 自 2024-10 零 commit、78 open issue 无人理；新项目用 `vi.mock`/MSW。
2. **`Vue Router Mock` 删**：虽 posva 出品仍维护，但社区主流是"真实 router + `createMemoryHistory` + `router.isReady()`"。
3. **`@pinia/testing` 补**：本项目核心用 Pinia，`createTestingPinia` 的 `stubActions` 三档机制独特。

---

## 三、敲定结构（分类重构 + 9 叶，定稿）

```
前端测试 (sort 6)
├── 单元测试 (1)              运行器 + mock 基础（测纯逻辑/composable/单模块）
│   ├── Vitest               主轴
│   ├── Jest                 对照
│   └── MSW                  网络 mock
├── 组件测试 (2) ★新增        挂载 Vue 组件测渲染/交互/状态
│   ├── Vue Test Utils
│   ├── Testing Library
│   ├── @pinia/testing
│   └── Vitest Browser Mode
├── 端到端测试 (3)            （已有占位，本批不动）
│   ├── Cypress
│   └── Playwright
├── 测试方法与质量 (4) ★新设   横切技术（与"类型"维度正交）
│   ├── 代码覆盖率
│   └── 快照测试
└── 其他工具 (5)             Mailtrap（本批不动）
```

### 9 个工作叶职责表

| 类       | 叶名                    | 核心讲解范围                                                                                    | 内含"带过"项                                   | 参考版本         |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------- |
| 单元     | **Vitest**              | 零配置（继承 vite.config）、`vi.fn/mock/spyOn`、watch/HMR、从 Jest 迁移                         | happy-dom/jsdom、Sinon→vi                      | v4.1.x           |
| 单元     | **Jest**                | mock hoisting、CJS vs ESM（`unstable_mockModule`）、ts-jest、RN/存量、Jest 30、与 Vitest 对比   | —                                              | v30.4            |
| 单元     | **MSW**                 | Service Worker 原理、`setupServer`、2.x `HttpResponse`、生命周期钩子、动态 `server.use`         | **axios-mock-adapter**（已停滞，对比）         | v2.14.x          |
| 组件     | **Vue Test Utils**      | `mount`/`shallowMount`、Wrapper、`global` 注入、`nextTick`/`flushPromises`、stubs；路由测试小节 | **vue-router-mock**（真实 router 主讲 + 对比） | v2.4.x           |
| 组件     | **Testing Library**     | 实现细节陷阱、查询优先级金字塔、user-event vs fireEvent、与 VTU 哲学对比                        | jest-dom 断言、jest-axe 延伸                   | vue v8.1         |
| 组件     | **@pinia/testing**      | `createTestingPinia`、`stubActions` 三档、state 直改 vs `$patch`、getter 可写                   | vs `setActivePinia`                            | v1.0.x           |
| 组件     | **Vitest Browser Mode** | 为何 jsdom 有局限、Browser Mode 架构（Playwright provider）、`vitest-browser-vue`               | Playwright CT（边界：归端到端章）              | Vitest v4 GA     |
| 方法质量 | **代码覆盖率**          | `@vitest/coverage-v8` vs istanbul、行/分支/函数指标、`coverage.thresholds`、CI、覆盖率会骗人    | nyc                                            | coverage-v8      |
| 方法质量 | **快照测试**            | inline vs 文件快照、`.snap` 版本管理、何时是好测试/技术债、与 UI 回归边界                       | —                                              | Vitest/Jest 内置 |

> **stem 前缀提示**：概念叶 stem 前缀——覆盖率用「代码覆盖率」/「Vitest 覆盖率」、快照用「快照测试」/「Vitest 快照」、Browser Mode 用「Vitest Browser Mode」。

---

## 四、落地步骤

### 1. categories.ts（[content/categories.ts](../../apps/quiz-backend/prisma/content/categories.ts) `前端测试` 节点）

- **单元测试**（sort 1）：children 由 5 → 3。保留 `Vitest`/`Jest`/`MSW`；**移除** `Vue Test Utils`、`Testing Library`（迁到组件测试）。
- **组件测试**（sort 2，新增）：`Vue Test Utils` / `Testing Library` / `@pinia/testing` / `Vitest Browser Mode`。
- **端到端测试**：sort 2 → 3（内容不变）。
- **测试方法与质量**（sort 4，新增）：`代码覆盖率` / `快照测试`。
- **其他工具（Mailtrap）**：sort 3 → 5。

> ⚠️ **分类移动坑**（CLAUDE.md / 记忆 `content-deploy-workflow`）：import 按 `key=groupId:parentId:name` 只增不删。`Vue Test Utils`、`Testing Library` 从「单元测试」移到「组件测试」= **父变 → key 变 → 会建新节点并留旧节点**。
> **缓解**：当前这两叶**零题目挂载**（零题库），移动无数据负担。
>
> **prod 实测（2026-06-19，只读查询）**：「前端测试」(id=144, group=3) 下全部节点**题数=0**。单元测试(id=145) 下：Jest#146 / Vitest#147 / Vue Test Utils#148 / MSW#149 / Testing Library#150；端到端(id=151)：Cypress#152 / Playwright#153；其他工具#154。组件测试 / 测试方法与质量 / @pinia/testing / Vitest Browser Mode / 代码覆盖率 / 快照 **均不存在**；Axios Mock Adapter、Vue Router Mock 从未 import 过。
>
> **迁移方案（prod 写 · 须用户确认 · 必须在首次 `import:content:prod` 之前执行）**：import 幂等"只增不改"，处理不了"移动 VTU/TL + 改 sort"——直接 import 会留旧节点造成**重复**且 **sort 错乱**（已存在的 Vitest/Jest/MSW/端到端/其他 sort 不会被更新）。因零题库无损，推荐 **"删整棵前端测试子树(#144 后代) → `import:content:prod` 全新重建"**，或精确脚本（删 #148/#150 + 建两新类 + 修 sort）。（prod 连接见记忆 `quiz-prod-rds-connection`）

### 2. VitePress sidebar（IllegalCreedWebsite `config.mts`）

- 单元测试组：删 `Axios Mock Adapter`、`Vue Router Mock`、`VueTestUtils`、`Testing Library`，保留 `Vitest`/`Jest`/`MSW`。
- 新建「组件测试」组：Vue Test Utils / Testing Library / @pinia/testing / Vitest Browser Mode。
- 新建「测试方法与质量」组：代码覆盖率 / 快照测试。
- 每叶建 `guide-line/*.md` 占位 + link。

### 3. 逐叶三件套

从 **Vitest（标杆叶）** 起，每叶 笔记 + 幻灯片 + 题库，各自过门禁（见 §五）。

---

## 五、三件套门禁（强制 · 未过不算完成）

- **Quiz 题目**：重质不限量；每题 `stem` 含技术名前缀；`categories` 叶子名与 [categories.ts](../../apps/quiz-backend/prisma/content/categories.ts) 完全一致；中文内引号用全角（写完跑 node `JSON.parse` 自检）。入库只 `import:content:prod`（幂等、增量），**执行前须用户确认**。
- **Slidev 幻灯片**：`pnpm -C packages/{x}-slide run build` 后跑 `node scripts/check-slidev-overflow.mjs {x}-slide`，**0 溢出**才算完成。
- **VitePress 笔记**：除 `index.md` 概览页外，每个内容页 `# 标题` + `> 基于X版本` 后紧跟 `## 速查`；context7 + 网页双重校验。

---

## 六、进度跟踪（逐叶）

| 类             | 叶                  | VitePress 笔记 | Slidev 幻灯片 | Quiz 题库 | prod 导入 |
| -------------- | ------------------- | -------------- | ------------- | --------- | --------- |
| 单元测试       | Vitest              | ✅ 8页         | ✅ 24页0溢出  | ✅ 49题   | ✅ id=433 |
| 单元测试       | Jest                | ✅ 8页         | ✅ 21页0溢出  | ✅ 48题   | ✅ id=434 |
| 单元测试       | MSW                 | ✅ 7页         | ✅ 19页0溢出  | ✅ 44题   | ✅ id=435 |
| 组件测试       | Vue Test Utils      | ✅ 8页         | ✅ 22页0溢出  | ✅ 46题   | ✅ id=437 |
| 组件测试       | Testing Library     | ✅ 7页         | ✅ 20页0溢出  | ✅ 40题   | ✅ id=438 |
| 组件测试       | @pinia/testing      | ✅ 6页         | ✅ 17页0溢出  | ✅ 26题   | ✅ id=439 |
| 组件测试       | Vitest Browser Mode | ✅ 7页         | ✅ 23页0溢出  | ✅ 26题   | ✅ id=440 |
| 测试方法与质量 | 代码覆盖率          | ☐              | ☐             | ☐         | ☐         |
| 测试方法与质量 | 快照测试            | ☐              | ☐             | ☐         | ☐         |

---

## 七、关键来源（2026-06-19 核实）

- State of JS 2024 — Testing：https://2024.stateofjs.com/en-US/libraries/testing/
- Vitest v4 blog：https://vitest.dev/blog/vitest-4 ；Browser Mode：https://vitest.dev/guide/browser/ ；Coverage：https://vitest.dev/guide/coverage.html
- Jest 30：https://jestjs.io/blog/2025/06/04/jest-30 ；ESM：https://jestjs.io/docs/ecmascript-modules
- Vue Test Utils：https://test-utils.vuejs.org/ ；Releases：https://github.com/vuejs/test-utils/releases
- Testing Library（Vue）：https://testing-library.com/docs/vue-testing-library/intro/ ；user-event：https://testing-library.com/docs/user-event/intro
- MSW：https://mswjs.io/ ；Releases：https://github.com/mswjs/msw/releases ；Vitest 推荐 MSW：https://vitest.dev/guide/mocking/requests
- axios-mock-adapter（停滞证据）：https://github.com/ctimmerm/axios-mock-adapter/releases
- vue-router-mock：https://github.com/posva/vue-router-mock ；VTU 路由测试：https://test-utils.vuejs.org/guide/advanced/vue-router
- Pinia 测试：https://pinia.vuejs.org/cookbook/testing.html ；@pinia/testing API：https://pinia.vuejs.org/api/@pinia/testing/

---

_创建：2026-06-19（选型调研 + 分类重构 + 叶集合拍板）_
