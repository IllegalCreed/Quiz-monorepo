# Redoc 前期研究 · 研究过程审计报告

> 审计日期 2026-06-18

本报告对 Redoc（Redocly 出品的 OpenAPI 文档渲染器）三件套（VitePress 笔记 / Slidev 幻灯片 / Quiz 题库）的**前期研究过程**进行独立审计，目标是证明研究是否充分、全面、有据可查、没有偷懒。审计重点是**研究过程与证据链**，每条关键结论都绑定官方一手原句；凡涉及版本号一律 `npm view` 当场取数，不采信记忆。

---

## 0. 重大前置发现（必读）

研究开局即核出三条实质性事实，置顶以免被淹没：

1. **`redoc`（开源库）当前 latest = 2.5.3**（2026-05-29 发布），且已存在 `next` 通道 `3.0.0-rc.0`（2025-10-24）—— Redoc 3.0 正在 RC 阶段，但稳定线仍是 2.x。任何"Redoc 还停在 2.0/2.1"的旧说法都需刷新。
2. **`redoc-cli`（旧独立 CLI）已被废弃并入 `@redocly/cli`**。`redoc-cli` npm 版本停在 **0.13.21（2023-03-06 最后发布，此后再无更新）**；官方迁移指南明令 `redoc-cli build` → `redocly build-docs`、并"strongly recommend that all users upgrade as soon as they can"。这是本主题最大的"时效坑"。
3. **大量经典配置项在 Redoc 2.x 已标记 deprecated**：`hideDownloadButton`（→`hideDownloadButtons`）、`expandResponses`、`nativeScrollbars`、`requiredPropsFirst`（→`sortRequiredPropsFirst`）、`jsonSampleExpandLevel`（→`jsonSamplesExpandLevel`）、`menuToggle`、`pathInMiddlePanel`、`payloadSampleIdx` 等。出题/写笔记若照搬老博客的选项名会踩雷。

> 说明：本批次未约定 `/tmp/research/redoc.md` 事实底稿，审计直接对任务交代的关键结论做一手核验（官方站逐页 + context7 + npm），形成可独立复现的证据链。

---

## 一、研究方法论

本次采用「三路独立信源交叉验证 + 一手原文绑定」的方法，与三件套内容生产门禁要求的 "context7 + 网页浏览双重校验、以官方网页 + 本地验证为准" 一致：

| 信源路     | 工具                                                  | 作用                                   | 权重                 |
| ---------- | ----------------------------------------------------- | -------------------------------------- | -------------------- |
| 官方站逐页 | WebFetch `redocly.com/docs/redoc/...` + GitHub README | 一手原文，权威定义/用法/配置/扩展      | 最高（判定基准）     |
| 库文档索引 | context7 `/redocly/redoc` query-docs                  | 交叉印证用法与配置原句、确认有文档覆盖 | 中（佐证）           |
| 包注册表   | `npm view <pkg> version/dist-tags/time`               | 本地核实版本号、发布时间、废弃状态     | 最高（版本判定基准） |

核验原则：

1. **逐页浏览，不靠摘要**——对 Redoc 官方文档逐个关键页 WebFetch，覆盖 定位 / quickstart / config / deployment(html·react·cli) / vendor-extensions / build-docs 命令参考 / redoc-cli 迁移指南，而非只看首页。
2. **结论绑定原文**——每条关键结论都要求 WebFetch 回传官方原句佐证（见第五节证据链"官方原句"列）。
3. **版本号本地核实**——不采信任何转述版本号，一律 `npm view` 当场取数（含 dist-tags 与 time）。
4. **废弃状态双核**——`redoc-cli` 的废弃，既查 npm（版本/最后发布时间），又查官方迁移指南原文，双路坐实。
5. **开源 vs 商业边界单列**——明确"Try-it console / 自动代码样例 / 分页 / 额外主题项"属商业版（Reference/Realm），避免把商业能力误记到开源 Redoc。

---

## 二、一手资料清单

对 Redoc 官方文档与仓库逐页核验，**共 11 个一手页面，全部可达且回传有效内容**（npm 网页版 403 已用 `npm view` 替代取数），覆盖任务要求的 6-10 页下限并超额。

| #   | 页面（URL）                                                  | 区块           | 可达 | 核验到的关键支撑点                                                                                                                                                                                  |
| --- | ------------------------------------------------------------ | -------------- | :--: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `https://redocly.com/redoc`（产品首页）                      | 定位/商业      |  ✅  | Redoc 是 "the open source legend ... now a SaaS ready for DX"；列商业产品矩阵 Revel/Reef/Realm/Reunite；Try-it 走 "Replay"                                                                          |
| 2   | `https://github.com/Redocly/redoc`（README）                 | 定位/用法/版本 |  ✅  | "Redoc is an open source tool for generating documentation from OpenAPI (formerly Swagger) definitions"；"Redoc is Redocly's community-edition product"；三栏；OAS 3.1/3.0/Swagger 2.0；MIT；v2.5.3 |
| 3   | `https://redocly.com/docs/redoc`（CE 文档主页）              | 定位/导航      |  ✅  | "Open source API documentation tool" "produces web-ready documentation from an OpenAPI description"；列 quickstart/deployment/config/vendor-extensions 全导航                                       |
| 4   | `https://redocly.com/docs/redoc/quickstart`                  | 用法           |  ✅  | `<redoc spec-url>` + CDN script；本地文件需 HTTP server（同源策略）；CDN = `cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js`                                                                  |
| 5   | `https://redocly.com/docs/redoc/config`                      | 配置           |  ✅  | 列 2.x 现行项 + 明确"Deprecated Functional settings"清单；客户端选项需 kebab-case；theme 嵌套对象                                                                                                   |
| 6   | `https://redocly.com/docs/redoc/deployment/intro`            | 用法           |  ✅  | 5 种部署：Live demo / HTML element / React / Docker / Redocly CLI                                                                                                                                   |
| 7   | `https://redocly.com/docs/redoc/deployment/html`             | 用法           |  ✅  | `Redoc.init(specOrSpecUrl, options, element, callback)` 签名原句；kebab-case 属性；`theme` 属性传 JSON 字符串                                                                                       |
| 8   | `https://redocly.com/docs/redoc/deployment/react`            | 用法           |  ✅  | 组件名 `RedocStandalone`；`import { RedocStandalone } from 'redoc'`；`specUrl`/`options`/`onLoaded` props                                                                                           |
| 9   | `https://redocly.com/docs/redoc/deployment/cli`              | 用法           |  ✅  | `npx @redocly/cli build-docs apis/openapi.yaml`                                                                                                                                                     |
| 10  | `https://redocly.com/docs/redoc/redoc-vendor-extensions`     | 扩展           |  ✅  | x-tagGroups / x-logo / x-codeSamples / x-displayName / x-traitTag / x-nullable / x-badges / x-summary 等逐项 + 所属 OpenAPI 对象                                                                    |
| 11  | `https://redocly.com/docs/cli/commands/build-docs`           | CLI 参考       |  ✅  | 默认输出 **`redoc-static.html`** 原句；`--output/-o`、`--theme.openapi.*`、`--template`、`--config`、`--disableGoogleFont`、`--title` 全表                                                          |
| 12  | `https://redocly.com/docs/cli/guides/migrate-from-redoc-cli` | 废弃迁移       |  ✅  | `redoc-cli build`→`redocly build-docs`；`redoc-cli bundle`→`redocly bundle`；"strongly recommend that all users upgrade"；`--options.theme.*`→`--theme.openapi.theme.*`                             |

> 说明：第 12 行（迁移指南）为坐实"redoc-cli 已废弃"额外抓取，实际有效核验页 **12 个**，远超 6-10 页下限。

---

## 三、context7 核验

`resolve-library-id("Redoc")` 命中多条 **High 信誉** 条目，取主条目 `/redocly/redoc`（151 段代码示例，Benchmark 67.88）做 query-docs 交叉印证：

| 库 ID                     | 描述/印证点（context7 原文）                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/redocly/redoc`          | "Redoc is an open-source tool that generates comprehensive API documentation from OpenAPI (formerly Swagger) definitions, featuring a responsive three-panel layout" —— **与官方 README 定位逐字吻合**（开源、由 OpenAPI 生成、三栏） |
| `/websites/redocly_redoc` | "generates web-ready documentation from OpenAPI specifications with a modern three-panel layout and extensive customization options" —— 印证三栏 + 高度可配                                                                           |
| `/redocly/redocly-cli`    | "Redocly CLI is an all-in-one API documentation utility that builds, manages ... OpenAPI, Swagger, AsyncAPI, and Arazzo" —— 印证 build-docs 归属 @redocly/cli、能力超出旧 redoc-cli                                                   |

context7 `query-docs` 回传的代码片段进一步逐条印证用法：

- **HTML element**：`<redoc spec-url='http://petstore.swagger.io/v2/swagger.json'></redoc>` + `cdn.redoc.ly/.../redoc.standalone.js`（与官方 quickstart 一致）。
- **JS API**：`Redoc.init('...', {"expandResponses": "200,400"}, document.getElementById('redoc-container'))`（与 deployment/html 一致）。
- **React**：`<RedocStandalone specUrl=... options={{ nativeScrollbars: true, theme: {...} }} />`（与 deployment/react 一致）。
- **CLI**：`redocly build-docs apis/openapi.yaml`（与 deployment/cli 一致）。
- **配置（YAML）**：`theme.openapi` 下 `disableSearch / expandResponses / jsonSamplesExpandLevel` + 嵌套 `theme`（印证 build-docs 用 `--theme.openapi.*` 前缀与 redocly.yaml 结构）。

结论：context7 三条独立条目 + 五段代码示例，与官方一手原文**全面吻合**，**双路印证成立**。

---

## 四、npm 版本核实（2026-06-18 当场取数）

`npm view` 实测（含 dist-tags / time / deprecated）：

| 包                                        | 当前 latest | 其他通道 / 关键时间                                                        | 许可 | 结论                                            |
| ----------------------------------------- | ----------- | -------------------------------------------------------------------------- | ---- | ----------------------------------------------- |
| `redoc`（开源渲染库）                     | **2.5.3**   | `next: 3.0.0-rc.0`（2025-10-24）；2.5.3 发布于 2026-05-29；首发 2016-01-12 | MIT  | 稳定线 2.x，3.0 RC 进行中                       |
| `@redocly/cli`（现行 CLI，含 build-docs） | **2.34.0**  | ——                                                                         | MIT  | 现行唯一推荐 CLI                                |
| `redoc-cli`（旧独立 CLI）                 | **0.13.21** | 最后发布 **2023-03-06**，此后无更新；npm `deprecated` 字段未显式设置       | ——   | **事实废弃**：官方迁移指南判其退役、停更逾 3 年 |

**审计判断：**

- `redoc-cli` 虽未在 npm 打 `deprecated` 标记字段，但**停更 3 年 + 官方迁移指南明令替换**，定性为"已废弃并入 @redocly/cli"成立。出题时表述应为"redoc-cli 已弃用，改用 `npx @redocly/cli build-docs`"。
- **版本基准行**需注明取数日期 2026-06-18，并写明 redoc 2.5.3 / @redocly/cli 2.34.0 / redoc-cli 0.13.21（停更）。
- 三件套若引用"Redoc 2.0/2.1"或"redoc-cli build"老命令，需刷新。

---

## 五、证据链（关键结论 → 官方原句）

下表把每条关键结论与官方一手原句绑定，闭合性以"官方原文是否直接支撑该结论"判定。

| 关键结论                                                              | 官方页                       | 官方原句（WebFetch / npm 回传）                                                                                                                                |   闭合    |
| --------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| Redoc 是**开源 OpenAPI 文档渲染器**（由 OpenAPI 生成，只读渲染）      | GitHub README                | "Redoc is an open source tool for generating documentation from OpenAPI (formerly Swagger) definitions"                                                        |    ✅     |
| Redoc 是 Redocly 的**社区版**产品                                     | README                       | "Redoc is Redocly's community-edition product"                                                                                                                 |    ✅     |
| **三栏响应式**布局 + 菜单/滚动同步                                    | README                       | "Responsive three-panel design with menu/scrolling synchronization"                                                                                            |    ✅     |
| 支持 **OAS 3.1 / 3.0 / Swagger 2.0**                                  | README                       | "Support for OpenAPI 3.1, OpenAPI 3.0, and Swagger 2.0"                                                                                                        |    ✅     |
| **HTML element** 用法 + CDN                                           | quickstart / context7        | `<redoc spec-url='...'></redoc>` + `cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js`                                                                     |    ✅     |
| **JS API** `Redoc.init(...)` 四参签名                                 | deployment/html              | "Redoc.init(specOrSpecUrl, options, element, callback)"                                                                                                        |    ✅     |
| **React 组件** = `RedocStandalone`                                    | deployment/react             | `import { RedocStandalone } from 'redoc'`；`<RedocStandalone specUrl=... options={...} onLoaded={...} />`                                                      |    ✅     |
| **CLI** 构建静态 HTML = `@redocly/cli build-docs`                     | deployment/cli               | "npx @redocly/cli build-docs apis/openapi.yaml"                                                                                                                |    ✅     |
| build-docs **默认输出 `redoc-static.html`**                           | cli/commands/build-docs      | "The default value is `redoc-static.html`"                                                                                                                     |    ✅     |
| **发现 A**：redoc-cli 已废弃 → @redocly/cli                           | migrate-from-redoc-cli + npm | "redoc-cli build → redocly build-docs"；"strongly recommend that all users upgrade as soon as they can"；npm 停更于 2023-03-06                                 | ✅ 有来源 |
| **发现 B**：诸多经典配置项 2.x 已 deprecated                          | config                       | "Deprecated Functional settings"：hideDownloadButton/expandResponses/nativeScrollbars/requiredPropsFirst/jsonSampleExpandLevel…                                | ✅ 有来源 |
| **发现 C**：Try-it / 自动代码样例 / 分页 属**商业版**                 | README                       | "We also offer hosted API reference documentation with additional features including: Try-it console, Automated code samples, Pagination, Extra theme options" | ✅ 有来源 |
| 客户端配置需 **kebab-case**；theme 传 JSON 字符串                     | config / deployment/html     | "provide the options ... in kebab case. For example, `scrollYOffset` becomes `scroll-y-offset`"；`<redoc theme='{"sidebar":{...}}'>`                           |    ✅     |
| Redoc 专属 **vendor extensions**（x-tagGroups/x-logo/x-codeSamples…） | redoc-vendor-extensions      | x-tagGroups "group tags in the side menu"；x-logo（Info）；x-codeSamples（Operation，右栏渲染）；x-displayName（Tag）                                          |    ✅     |
| 本地文件需 **HTTP server**（同源策略）                                | quickstart                   | "Redoc CE requires an HTTP server to run locally"（browser same-origin policy）                                                                                |    ✅     |

**证据链闭合性结论：** 任务点名的全部关键结论（含三个重点发现 A/B/C）**均在 Redoc 官方一手原文 + npm 实测中找到直接支撑**，证据链在"结论 ↔ 官方原文"维度**完全闭合**。

---

## 六、章节覆盖审计

以 Redoc 官方文档信息架构为基准，核对研究是否覆盖各功能区：

| 官方信息区                            | 是否核验 | 覆盖证据                                                                                        | 评价                                                             |
| ------------------------------------- | :------: | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 定位（开源 vs 商业、由 OpenAPI 生成） |    ✅    | 页 1/2/3                                                                                        | 充分，定性 + 商业边界均拿到原句                                  |
| Quickstart（最小可用）                |    ✅    | 页 4                                                                                            | 充分（含 CDN、本地 HTTP server 坑）                              |
| 配置项（现行 + deprecated）           |    ✅    | 页 5                                                                                            | 充分，且抓到"哪些已废弃"这一高价值信息                           |
| 部署总览（5 种方式）                  |    ✅    | 页 6                                                                                            | 充分                                                             |
| HTML element + Redoc.init             |    ✅    | 页 7                                                                                            | 充分，拿到四参签名原句                                           |
| React（RedocStandalone）              |    ✅    | 页 8                                                                                            | 充分，组件名/props 全                                            |
| CLI（@redocly/cli build-docs）        |    ✅    | 页 9/11                                                                                         | 充分，默认输出文件名坐实                                         |
| Vendor extensions（x-\*）             |    ✅    | 页 10                                                                                           | 充分，逐项 + 所属对象                                            |
| redoc-cli 废弃迁移                    |    ✅    | 页 12                                                                                           | 充分，命令映射 + 升级建议原句                                    |
| Docker 部署                           | ⚠️ 部分  | 经 intro 提及，未深入抓 docker 子页                                                             | 对三件套"使用层"够用；如需出 Docker 题可补抓 `deployment/docker` |
| 完整 theme 子树（每个颜色/字号字段）  | ⚠️ 抽样  | config 页拿到 theme 分类（spacing/colors/typography/sidebar/rightPanel/logo/fab），未逐字段穷举 | 抽样合理；题库出"主题分几类"够用，逐字段属深水区按需补           |
| security-definitions-injection 页     | ⚠️ 未抓  | 导航见到链接，未单独抓                                                                          | 边缘特性，非三件套必需，标注按需                                 |

**覆盖结论**：定位 / quickstart / config / deployment(html·react·cli) / vendor-extensions / build-docs / 迁移 七大核心区**全部触达且拿到原句**；未覆盖项（Docker 子页、theme 逐字段、security 注入）属"使用层非必需"深水区，标注按需补充，不影响当前研究充分性判定。

---

## 七、充分性自审

**逐项自检：**

1. **一手资料是否充分？** ✅ 充分。官方 12 页全部可达且回传原句，覆盖七大核心功能区，超过任务 6-10 页下限。
2. **是否多路交叉验证？** ✅ 是。官方站（判定基准）+ context7（三条 High 信誉 + 五段代码印证）+ npm（版本/时间/废弃本地取数）三路独立。
3. **三个重点发现是否真有来源？** ✅ 全部有。A（redoc-cli 废弃）= 迁移指南原句 + npm 停更时间；B（配置项 deprecated）= config 页 "Deprecated Functional settings"；C（Try-it 属商业版）= README 原句，非臆断。
4. **是否有偷懒/臆测？** ❌ 未发现核验偷懒。npm 网页 403 后改用 `npm view` 本地取数补齐，未"以摘要充原文"，未"以 context7 单路下结论"。
5. **开源 vs 商业边界是否分清？** ✅ 是。Try-it console / 自动代码样例 / 分页 / 额外主题项明确归商业版（Reference/Realm），开源 Redoc 默认无 Try-it（官方首页商业 Try-it 走 "Replay"）。
6. **有无未闭合缺口？** ⚠️ 仅三处深水区按需缺口（Docker 子页 / theme 逐字段 / security 注入页），均如实披露，不影响核心结论。

**总体充分性结论：**

> 就**结论的一手可核验性**而言，研究充分、证据链对官方原文完全闭合，三个重点发现（redoc-cli 废弃 / 配置项 deprecated / Try-it 属商业版）均有据可查、无臆测，版本号当场 `npm view` 取数（redoc 2.5.3 / @redocly/cli 2.34.0 / redoc-cli 0.13.21 停更），判定**合格**。三处深水区按需缺口已披露，不影响三件套使用层落地。

---

### 附：审计可复现命令

```bash
# 版本核实（2026-06-18 实测）
npm view redoc version          # → 2.5.3
npm view redoc dist-tags        # → { latest: '2.5.3', next: '3.0.0-rc.0' }
npm view @redocly/cli version   # → 2.34.0
npm view redoc-cli version      # → 0.13.21（最后发布 2023-03-06，已废弃）

# 官方页（逐个 WebFetch，全部应可达）
# https://redocly.com/redoc
# https://github.com/Redocly/redoc
# https://redocly.com/docs/redoc
# https://redocly.com/docs/redoc/quickstart
# https://redocly.com/docs/redoc/config
# https://redocly.com/docs/redoc/deployment/intro
# https://redocly.com/docs/redoc/deployment/html
# https://redocly.com/docs/redoc/deployment/react
# https://redocly.com/docs/redoc/deployment/cli
# https://redocly.com/docs/redoc/redoc-vendor-extensions
# https://redocly.com/docs/cli/commands/build-docs
# https://redocly.com/docs/cli/guides/migrate-from-redoc-cli
```
