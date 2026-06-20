# 端到端测试章 三件套方案

> **范围**：前端测试 >「端到端测试」类，全谱系 **5 叶**（Cypress / Playwright / Selenium / WebdriverIO / Puppeteer）三件套——Quiz 题目（quiz-monorepo）+ VitePress 笔记（IllegalCreedWebsite）+ Slidev 幻灯片（SlideStack），跨 3 仓库。
> **选型调研**：2026-06-20，context7 + 官方网页 / State of JS 2024 两路核实。
> **前置**：单元测试 + 组件测试 + 测试方法与质量 9 叶已全部收官并上线（见 [20260619-frontend-testing-trilogy.md](./20260619-frontend-testing-trilogy.md)）。

---

## 一、选型调研结论（2026-06-20 核实）

2026 E2E 格局：**Playwright 与 Cypress 双雄**，其余退守利基。用户拍板**全谱系 5 叶**（充实取向，含 Tier 2 三框架作对比补充）。

| Tier  | 框架                     | 最新版 | 浏览器 / 语言                                | 流行度                                    | 定位                                                                          |
| ----- | ------------------------ | ------ | -------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| **1** | **Playwright**（微软）   | v1.61  | Chromium/Firefox/WebKit · TS/JS/Py/.NET/Java | 满意度 91%（E2E 第一）、~3000 万/周、91k★ | 增长最快的新主流，auto-wait/Trace Viewer/codegen/并行/AI 友好                 |
| **1** | **Cypress**              | v15.17 | Chrome/Edge/Electron+FF · 仅 JS/TS           | 满意度 72%、~660 万/周、49.7k★            | **本项目在用**、DX 标杆（时间旅行调试），架构受限（跨域/多标签/单浏览器实例） |
| **2** | **Selenium / WebDriver** | 4.44   | 全主流 · Java/Py/C#/Ruby/JS                  | 使用人数降第四、100-200 万/周             | W3C WebDriver 标准发起者、企业跨语言老牌、Grid 分布式                         |
| **2** | **WebdriverIO**          | v9.19  | 全主流 + Appium 移动端 · Node                | ~193 万/周、9.6k★、OpenJS 托管            | 现代 WebDriver BiDi、Web+Mobile 一体（Appium）                                |
| **2** | **Puppeteer**（Google）  | v25.1  | Chrome/FF · Node                             | ~400 万/周、94k★                          | **自动化库非测试框架**（无 runner/断言）、CDP 控制最直接、爬虫/截图           |

**Playwright vs Cypress 核心取舍**：Playwright 能力天花板高、跨浏览器+多语言、并行免费、生态增长快 → 未来主流；Cypress DX 更丝滑、组件测试更成熟、已有资产迁移成本高 → 现实次选。

**趋势一句话**：Playwright 上位为新默认，Cypress 守存量，Selenium 退前端主舞台（企业 Java/Py 仍不可替代），Puppeteer 进维护模式（被同团队 Playwright 替代），WebdriverIO 深耕 Web+Mobile 利基。

**本项目相关性**：`apps/quiz-app`（Cypress Mock API E2E，6 spec ~33 测试）+ `apps/quiz-admin`（Cypress 真实后端 E2E，11 spec ~129 测试），E2E 框架 = Cypress `^15.14.2`。

---

## 二、5 叶内容规划

> **stem 前缀提示**：每题须含技术名前缀——Cypress 用「Cypress」、Playwright 用「Playwright」、Selenium 用「Selenium」/「WebDriver」、WebdriverIO 用「WebdriverIO」、Puppeteer 用「Puppeteer」。

| 叶              | 笔记/题库核心要点                                                                                                                                                                       | 边界/对比                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Cypress**     | 安装配置、`cy` 命令链与重试、选择器、`cy.intercept` 网络拦截（Mock API）、`cy.origin` 跨域、fixtures、自定义命令、Component Testing、Cypress Cloud、时间旅行调试、CI（GitHub Actions）  | 架构局限（单超域/多标签/单浏览器实例）vs Playwright         |
| **Playwright**  | Browser/Context/Page 模型、Locator API（`getByRole` 等语义查询）、auto-wait、断言（web-first assertions）、Trace Viewer、codegen、fixtures、并行与 project 矩阵、多浏览器、网络拦截、CI | vs Cypress 选型对比、组件测试现状                           |
| **Selenium**    | W3C WebDriver 标准、WebDriver 协议、`By` 定位、显式/隐式等待、Selenium Grid 分布式、多语言绑定、WebDriver BiDi 演进                                                                     | 与 Playwright/WebdriverIO 的协议关系、企业场景              |
| **WebdriverIO** | 架构（WebDriver/BiDi）、`$`/`$$` 查询、命令、配置 `wdio.conf`、服务/插件、Appium 移动端、与 Vitest/Storybook 集成                                                                       | Web+Mobile 一体定位、vs Selenium                            |
| **Puppeteer**   | CDP 控制、`page` API、`launch`/`connect`、selectors、自动化/截图/PDF、爬虫场景、与 Playwright 同源关系                                                                                  | **自动化库 vs E2E 测试框架**边界（无内置 runner/断言/并行） |

---

## 三、分类结构（categories.ts 已改）

`前端测试 >「端到端测试」(sort 3)` 下 5 叶：

```
端到端测试 (sort 3)
├── Cypress (1)
├── Playwright (2)
├── Selenium (3)        ← 新增
├── WebdriverIO (4)     ← 新增
└── Puppeteer (5)       ← 新增
```

> Cypress/Playwright 节点 prod 已存在（重构重建时建好，0 题）；Selenium/WebdriverIO/Puppeteer 节点待首次 `import:content:prod` 时建。叶子目录：笔记 `IllegalCreedWebsite/src/zh/frontend-develop-tools/testing/e2e-testing/{leaf}/`；幻灯片 `SlideStack/packages/{leaf}-slide/`；题库 `apps/quiz-backend/prisma/content/{leaf}.json`。

---

## 四、进度跟踪（逐叶）

| 叶          | VitePress 笔记 | Slidev 幻灯片 | Quiz 题库 | prod 导入 |
| ----------- | -------------- | ------------- | --------- | --------- |
| Cypress     | ✅ 8页         | ✅ 22页0溢出  | ✅ 49题   | ✅ id=442 |
| Playwright  | ✅ 8页         | ✅ 25页0溢出  | ✅ 44题   | ✅ id=443 |
| Selenium    | ✅ 7页         | ✅ 21页0溢出  | ✅ 39题   | ✅ id=448 |
| WebdriverIO | ✅ 7页         | ✅ 22页0溢出  | ✅ 41题   | ✅ id=449 |
| Puppeteer   | ✅ 7页         | ✅ 21页0溢出  | ✅ 36题   | ✅ id=450 |

---

## 五、关键来源（2026-06-20 核实）

- State of JS 2024 Testing：https://2024.stateofjs.com/en-US/libraries/testing/
- Playwright：https://playwright.dev （v1.61）
- Cypress：https://www.cypress.io （v15.17）；本项目 `^15.14.2`
- Selenium：https://www.selenium.dev （4.44）
- WebdriverIO：https://webdriver.io （v9.19）
- Puppeteer：https://pptr.dev （v25.1）
- npmtrends 对比：playwright / cypress / webdriverio / selenium-webdriver / puppeteer
