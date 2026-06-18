# Scalar 前期研究 · 研究过程审计报告

> 审计日期 2026-06-18

本报告对 Scalar（`@scalar/api-reference`，现代 OpenAPI 文档/参考渲染器，内置 API 客户端）三件套（VitePress 笔记 / Slidev 幻灯片 / Quiz 题库）的**前期研究过程**进行独立审计，目标是证明研究是否充分、全面、有据可查、没有偷懒。审计重点是**研究过程与证据链**，每条结论绑定官方一手原句，不空述结果。

---

## 0. 重大前置发现（必读）

**本次研究不存在独立的"事实底稿"文件**（对照同批次 tsdoc 报告曾约定 `/tmp/research/tsdoc.md`）。本任务采取"边研究边核验、结论直接绑定官方一手原文"的方式，不依赖中间底稿。因此本报告的审计基准是 **"任务交代的关键结论 ↔ 官方一手原文/npm 实测"** 的闭合性，而非"底稿采写忠实度"。

此外审计发现两条独立的实质性结论，置顶提示，正文详证：

1. **Scalar 是"渲染器 + 内置 API 客户端"平台，不是 OpenAPI spec 生成器**——它消费你已有的 OpenAPI/Swagger 文档来渲染漂亮文档，不负责从代码生成 spec。这是与"它能自动生成接口文档"这一常见误解的关键边界（第五节证据链 A）。
2. **集成包版本号与核心包严重不一致（version skew）**——`@scalar/api-reference` 已到 **1.60.0**，但 `@scalar/express-api-reference` 仅 **0.10.4**、`@scalar/nestjs-api-reference` **1.2.4**、`@scalar/api-reference-react` **0.9.47**、`@scalar/hono-api-reference` **0.11.4`**。各包**独立版本线**，不能用 api-reference 的版本号去推断集成包版本（第四节 + 第五节证据链 F）。

---

## 一、研究方法论

本次审计采用「多路独立信源交叉验证 + 一手原文绑定」的方法，与三件套内容生产门禁要求的 "context7 + 网页浏览双重校验、以官方网页 + 本地验证为准" 一致：

| 信源路              | 工具                                                                                 | 作用                                           | 权重                        |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------- |
| 官方站 / 文档站逐页 | WebFetch `scalar.com/...`、GitHub `raw.githubusercontent.com/scalar/scalar/...`      | 一手原文，权威定义、配置项、用法               | 最高（判定基准）            |
| 库文档索引          | context7 `resolve-library-id` + `query-docs`（`/scalar/scalar`，3360 段，High 信誉） | 交叉印证 CDN 用法、配置、主题、迁移页          | 中（佐证）                  |
| 包注册表            | `npm view <pkg> version / time / license`（2026-06-18 实测）                         | 本地核实版本号、发布时间、许可证               | 最高（版本/许可证判定基准） |
| 补充检索            | WebSearch                                                                            | 核实"legacy data-url API 是否被弃用"等边缘结论 | 低（佐证）                  |

核验原则：

1. **逐页浏览，不靠摘要**——对官网 + GitHub 文档目录逐个关键页 WebFetch，覆盖 定位 / 配置 / 主题 / 集成 / 迁移 五大区，而非只看首页或只靠 AI 总结下结论。
2. **结论绑定原文**——每条关键结论都要求回传官方原句佐证（见第五节证据链"官方原句"列）。
3. **版本号 / 许可证本地核实**——不采信任何转述，一律 `npm view` 当场取数，并记录取数日期。
4. **失败可达性如实记录**——若干 raw 文档路径返回 404/403（如 npm 网页 403、`integrations/html.md` 404），均改用正确路径或 context7 兜底，过程如实标注于第二节。

---

## 二、一手资料清单

对 Scalar 官网（`https://scalar.com/`）与官方仓库文档（`github.com/scalar/scalar`，文档目录 `documentation/`）逐页核验。**有效核验页 12 个（含 1 个 context7 兜底页），覆盖任务要求的 6-10 页下限并超额**；另有 3 次因路径变更/反爬返回非 200，已如实记录并改道。

| #   | 页面（来源）                                                         | 区块       |  可达   | 核验到的关键支撑点                                                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------- | ---------- | :-----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `https://scalar.com/`（官网首页）                                    | 定位       |   ✅    | 四大产品线 API Docs / SDKs / API Client / API Registry；"OpenAPI-First"；API Client "Fully open-source & offline first"                                                                                                                                                                               |
| 2   | `https://scalar.com/scalar/introduction`（intro 重定向后）           | 定位       | ✅ 301→ | "API interfaces built for developers and agents..."；产品矩阵与"keep every interface synchronized as APIs evolve"                                                                                                                                                                                     |
| 3   | `github.com/scalar/scalar`（README）                                 | 定位       |   ✅    | **核心定位原句**："Scalar is an open-source API platform: Modern REST API Client / Beautiful API References / 1st-Class OpenAPI/Swagger Support"；README 卖点："Renders OpenAPI/Swagger documents / Comes with an API testing tool / Doesn't look like 2011 / Generates code examples"                |
| 4   | `documentation/configuration.md`（raw）                              | 配置       |   ✅    | **"universal configuration object"** 原句；`Scalar.createApiReference('#app', {...})` 签名；逐项配置 url/content/sources/theme/layout/hideModels/hideTestRequestButton/hideClientButton/proxyUrl/darkMode/servers/authentication/defaultHttpClient/hiddenClients/showSidebar 原文描述                 |
| 5   | `documentation/themes.md`（raw）                                     | 主题       |   ✅    | **11 个内置主题**全名：default/alternate/moon/purple/solarized/bluePlanet/saturn/kepler/mars/deepSpace/laserwave + none；CSS 变量覆盖（`--scalar-color-1` 等）"You can pretty much style everything you see"                                                                                          |
| 6   | `documentation/migration/swagger-ui.md`（raw + context7）            | 迁移/对比  |   ✅    | **vs Swagger UI 原句**："While Swagger UI has 'Try it out' functionality, Scalar's built-in API client is more powerful—supporting environment variables, request history, code snippet generation in 25+ languages, and a standalone desktop application"；"11 built-in themes"；迁移仅需替换 script |
| 7   | `documentation/integrations/nestjs.md`（raw）                        | 集成       |   ✅    | 包名 `@scalar/nestjs-api-reference`；`apiReference({content})` / `apiReference({url})` 中间件；Fastify 适配 `withFastify: true`                                                                                                                                                                       |
| 8   | `documentation/integrations/express.md`（raw）                       | 集成       |   ✅    | 包名 `@scalar/express-api-reference`；`app.use('/reference', apiReference({url:'/openapi.json'}))`；接受"our universal configuration object"                                                                                                                                                          |
| 9   | `https://scalar.com/products/api-client/getting-started`             | 内置客户端 |   ✅    | API Client "modern, open-source API client built on the OpenAPI standard"；"Offline-first"；可发请求、导入 OpenAPI 生成 collection、环境变量、request scripts/response tests、跨平台桌面 app                                                                                                          |
| 10  | `github.com/scalar/scalar/tree/main/integrations`（目录）            | 集成       |   ✅    | 15 个官方集成目录：astro/django-ninja/docker/docusaurus/dotnet/express/fastapi/fastify/hono/java/nestjs/nextjs/nuxt/rust/sveltekit                                                                                                                                                                    |
| 11  | `github.com/scalar/scalar/tree/main/packages`（目录）                | 架构       |   ✅    | 核心包：api-reference / api-client / openapi-parser / openapi-types / openapi-upgrader / api-reference-react / nextjs-openapi / themes / components / galaxy / void-server（mock）等                                                                                                                  |
| 12  | context7 `query-docs(/scalar/scalar)` 回传 `integrations/html-js.md` | 用法       |   ✅    | CDN script + `Scalar.createApiReference('#app',{url,proxyUrl})`；`sources:[]` 多文档；ESM `import { createApiReference }`；手动 `app.mount('#app')`                                                                                                                                                   |

**改道记录（如实披露）：**

- `https://www.npmjs.com/package/@scalar/api-reference` → **HTTP 403**（npm 网页反爬）。改用 `npm view` CLI 取版本/时间/许可证（第四节），数据等价且更权威。
- `documentation/integrations/html.md` → **404**（文件实为 `html-js.md`）。经 context7 命中正确文件名后取到一手代码。
- `integrations/vue/README.md` / `integrations/react/README.md`（raw）→ **404**（Vue/React 组件已并入 `packages/`，非独立 integrations 目录）。React 包名经 npm（`@scalar/api-reference-react` 0.9.47）+ packages 目录（页 11）双向确认。

---

## 三、context7 核验

`resolve-library-id("Scalar")` 命中主条目 **`/scalar/scalar`（High 信誉，3360 段代码示例，Benchmark 83.23）**，其库描述与 GitHub README 原句**逐字一致**："Scalar is an open-source API platform: Modern Rest API Client / Beautiful API References / 1st-Class OpenAPI/Swagger Support"。另有 `/scalar/laravel`、`/defillama/api-docs`（"offline-first API client and interactive API reference generator built for OpenAPI/Swagger"）等 High 信誉旁证。

`query-docs(/scalar/scalar)` 进一步交叉印证以下关键用法（均与官方一手页一致）：

| 印证点                     | context7 回传证据                                                                                       | 与一手页是否一致            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------- |
| CDN + `createApiReference` | 完整 `html-js.md` HTML 示例（script src=jsdelivr + `Scalar.createApiReference('#app',{url,proxyUrl})`） | ✅ 与页 12/README 一致      |
| 多文档 `sources:[]`        | `createApiReference('#app',{sources:[{title,url},...]})` 含 Galaxy/Petstore/Stripe 等                   | ✅ 与 configuration.md 一致 |
| 内置主题                   | `{theme:'moon'}`（来源 `migration/swagger-ui.md`）                                                      | ✅ 与 themes.md 一致        |
| `content` 直传             | `createApiReference('#app',{content:'...galaxy/dist/3.1.json'})`                                        | ✅ 与 configuration.md 一致 |
| FastAPI 高级项             | `scalar_js_url` 默认 `https://cdn.jsdelivr.net/npm/@scalar/api-reference`、`scalar_proxy_url`、`theme`  | ✅ 印证 CDN 即默认分发      |

结论：context7 多条独立条目 + 多段代码示例，与官方站一手原文**双路印证成立**，无矛盾点。

---

## 四、npm 版本核实（2026-06-18 实测）⚠️ 发现版本线分裂

当场执行 `npm view`（2026-06-18），核心包与集成包**各自独立版本线**，差异巨大：

| 包                              | npm 实测当前版本 | 许可证 | 备注                                                                    |
| ------------------------------- | ---------------- | ------ | ----------------------------------------------------------------------- |
| `@scalar/api-reference`         | **1.60.0**       | MIT    | 核心渲染包；2023-08-16 首发；1.60.0 发布于 **2026-06-17**（取数前一天） |
| `@scalar/api-client`            | **3.10.4**       | MIT    | 独立 API 客户端                                                         |
| `@scalar/fastify-api-reference` | **1.60.0**       | MIT    | 唯一与核心包同步的集成（Fastify 一等公民）                              |
| `@scalar/nestjs-api-reference`  | **1.2.4**        | MIT    | 集成包独立版本                                                          |
| `@scalar/hono-api-reference`    | **0.11.4**       | MIT    | 集成包独立版本                                                          |
| `@scalar/express-api-reference` | **0.10.4**       | MIT    | 集成包独立版本                                                          |
| `@scalar/api-reference-react`   | **0.9.47**       | MIT    | React 组件包独立版本                                                    |

补充取证（`npm view @scalar/api-reference time`）：created `2023-08-16`，近 5 个版本 1.59.0(06-08)→1.59.1→1.59.2→1.59.3→**1.60.0(2026-06-17)**，registry modified `2026-06-17`；`dist-tags.latest = 1.60.0`。

**审计判断：**

- **许可证统一为 MIT**，与 README/官网"open-source"定位一致，无矛盾。
- **核心结论"@scalar/api-reference 当前 1.60.0、MIT、活跃高频发版"成立且可复现。**
- **版本线分裂是真实坑点**：三件套若写"Scalar 1.60"指代框架集成包会**误导**——只有 Fastify 集成同步到 1.60；其余集成包停在 0.x~1.2。落地处须**按具体包分别注明版本 + 取数日期**，不可用核心包版本一刀切（详见第五节 F）。

---

## 五、证据链（关键结论 → 官方原句）

下表把任务点名的每条关键结论与官方一手原句绑定，逐条标注闭合性。闭合性以"官方原文/ npm 实测是否直接支撑该结论"判定。

| 关键结论                                                                                        | 官方页                            | 官方原句（回传）                                                                                                                                                                                                               |                 闭合                 |
| ----------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------: |
| **A** Scalar 是渲染器+客户端**平台**，非 spec 生成器                                            | README + 官网                     | "open-source API platform: Modern REST API Client / Beautiful API References / 1st-Class OpenAPI/Swagger Support"；"Renders OpenAPI/Swagger documents"                                                                         |                  ✅                  |
| **B** 内置可发请求的 API Client（区别于只读 Redoc）                                             | swagger-ui 迁移页 + api-client 页 | "Scalar's built-in API client is more powerful—supporting environment variables, request history, code snippet generation in 25+ languages, and a standalone desktop application"；API Client "Offline-first" 可 send requests |                  ✅                  |
| **C** CDN 用法 = jsdelivr script + `createApiReference`                                         | configuration.md + html-js.md     | `<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference">` + `Scalar.createApiReference('#app',{url, proxyUrl})`                                                                                                      |                  ✅                  |
| **D** "universal configuration object"（url/content/sources/theme/layout/hideModels/proxyUrl…） | configuration.md                  | "You can pass a - what we call universal - configuration object to fine-tune your API reference."；逐项 url/content/sources/theme/layout/hideModels/hideTestRequestButton/proxyUrl/servers/authentication 原文                 |                  ✅                  |
| **E** 11 个内置主题 + CSS 变量                                                                  | themes.md                         | 列出 default…laserwave+none（11 个+none）；"overwrite our CSS variables. We won't judge."                                                                                                                                      |                  ✅                  |
| **F** 多框架适配包（Express/Fastify/Hono/NestJS…）各自独立版本                                  | integrations 目录 + npm           | 15 个集成目录；npm 实测版本分裂（核心 1.60.0 vs express 0.10.4 vs nestjs 1.2.4 vs react 0.9.47）                                                                                                                               |              ✅ 有来源               |
| **G** 开源 MIT vs 平台托管（Registry/Dashboard）边界                                            | README + 官网                     | README "MIT license"；官网另列 API Registry / Dashboard / SDK 生成等托管/付费产品线（freemium "free features"）                                                                                                                |                  ✅                  |
| **H** vs Swagger UI / Redoc 差异（内置客户端、现代 UI、性能）                                   | swagger-ui 迁移页                 | "cleaner, more intuitive interface with a modern design"；"Large OpenAPI documents render faster"；"CORS proxy, quick share..., desktop API client" 为 Scalar 独有                                                             |                  ✅                  |
| **I** legacy `data-url` API 已被 `createApiReference` 取代                                      | html-js.md + WebSearch            | 当前文档**只记** `createApiReference`（自动/手动 mount/ESM 三式），旧 `<script id="api-reference" data-url>` 已不在文档；WebSearch 佐证"modernized from legacy patterns like `id=api-reference`/`data-url`"                    | ✅ 有来源（旧 API 历史存在、现弃用） |

**证据链闭合性结论：**

- 任务点名的全部关键结论（A–I，含"非生成器""内置客户端""配置项""主题""多框架""MIT vs 托管""vs SwaggerUI/Redoc"）**均在 Scalar 官方一手原文 / npm 实测中找到直接支撑**，证据链在"结论 ↔ 官方原文"维度**完全闭合**。
- 唯一需注意：**Redoc 的"只读"对比**官方迁移页未逐字写明（Scalar 站不会替竞品 Redoc 背书表述），该结论由"Redoc 官方定位为静态只读文档、Scalar 内置可发请求客户端"两侧事实推得，已在第七节标注为"跨产品对比、非单页原句"。

---

## 六、章节覆盖审计

以 Scalar 官方信息架构（官网产品线 + 仓库 `documentation/` 目录）为基准，核对研究覆盖面：

| 官方信息区                                              | 是否核验 | 覆盖证据                              | 评价                                                          |
| ------------------------------------------------------- | :------: | ------------------------------------- | ------------------------------------------------------------- |
| 产品定位 / 四大产品线                                   |    ✅    | 页 1、2、3                            | 充分，拿到核心定位原句 + 产品矩阵                             |
| 入门用法（CDN/ESM/手动 mount）                          |    ✅    | 页 4、12                              | 充分，三种挂载方式 + CDN 均有原码                             |
| 配置对象（universal config 全项）                       |    ✅    | 页 4                                  | 充分，逐项描述（含高风险 hideModels/proxyUrl/authentication） |
| 内置 API Client（差异点）                               |    ✅    | 页 6、9                               | 充分，命中"vs SwaggerUI 内置客户端"原句                       |
| 主题与样式                                              |    ✅    | 页 5                                  | 充分，11 主题全名 + CSS 变量                                  |
| 框架集成（Express/Fastify/Hono/NestJS/Vue/React/Next…） |    ✅    | 页 7、8、10、11                       | 充分，命中 npm 包名 + 中间件用法 + 目录全清单                 |
| 迁移/对比（Swagger UI）                                 |    ✅    | 页 6                                  | 充分，对比表 + 迁移代码                                       |
| OpenAPI/Swagger 关系                                    |    ✅    | 页 3、4                               | 充分，"1st-Class OpenAPI/Swagger Support"、url/content 直消费 |
| Registry / Dashboard 托管产品                           | ⚠️ 部分  | 页 1、2 概览触及                      | 三件套聚焦开源渲染器，托管平台仅需边界即可，按需补            |
| 每个集成包逐页（15 个全抓）                             | ⚠️ 抽样  | 抓 Express/NestJS 代表页 + 目录全名单 | 抽样合理（选最主流两个 Node 集成）；其余可按需补抓            |
| openapi-parser / 插件 / SSR 等深水 API                  | ⚠️ 部分  | packages 目录触及，未深入 API         | 对"使用层三件套"够用；如出底层 API 题需补                     |

**覆盖结论**：定位 / 用法 / 配置 / 内置客户端 / 主题 / 集成 / 迁移 / OpenAPI 关系 八大核心区**全部触达且关键页全覆盖**；未深覆盖项（托管平台细节、15 集成逐页、解析器底层 API）属"使用层三件套非必需"，标注按需补充，不影响当前充分性判定。

---

## 七、充分性自审

**逐项自检：**

1. **一手资料是否充分？** ✅ 充分。官方 + 仓库 12 个有效页全部回传原句，覆盖八大功能区，超过任务 6-10 页下限。
2. **是否多路交叉验证？** ✅ 是。官方站/仓库（判定基准）+ context7（`/scalar/scalar` 3360 段，多代码印证）+ npm（版本/许可证本地取数）+ WebSearch（legacy API 佐证）四路独立。
3. **关键发现是否真有来源？** ✅ 全部有。A（非生成器）、B（内置客户端）、F（版本分裂）、I（legacy 弃用）等均绑定官方原句 / npm 实测，非臆断。
4. **是否有偷懒/臆测？** ❌ 未发现核验偷懒。结论均经原文佐证；遇 404/403 如实改道并标注，未"以摘要充原文"，未"以 context7 单路下结论"。
5. **有无未闭合缺口？** ⚠️ 有两处，均如实披露：
   - **缺口一（对比类，轻微）**：vs **Redoc** 的"只读 vs 可发请求"对比，官方 Scalar 站未逐字写 Redoc（不替竞品表述），系跨产品事实推得，下游若出"Scalar vs Redoc"题须以 Redoc 官方"静态只读"定位双向佐证。
   - **缺口二（时效/版本，需整改预防）**：集成包版本线分裂（核心 1.60.0 vs 集成 0.x~1.2），三件套落地**必须按具体包注明版本号 + 取数日期 2026-06-18**，不可用核心包版本指代集成包；且 Scalar 发版极频（1.59→1.60 仅 9 天），版本字样须标注"截至 2026-06-18"。

**总体充分性结论：**

> 就**结论的一手可核验性**而言，研究充分、证据链对官方原文完全闭合，关键发现（非生成器 / 内置客户端 / 配置项 / 主题 / 多框架 / MIT vs 托管 / vs SwaggerUI / legacy 弃用）均有据可查、无臆测，判定**合格**。需在三件套落地时携带两条披露——**Redoc 对比须双向佐证** 与 **集成包版本须按包分别注明且标注取数日期 2026-06-18**——并据此设置准确性门禁。

---

### 附：审计可复现命令

```bash
# 版本 / 许可证核实（2026-06-18 实测）
npm view @scalar/api-reference version          # → 1.60.0
npm view @scalar/api-reference license          # → MIT
npm view @scalar/api-reference time --json      # → 1.60.0 发布于 2026-06-17
npm view @scalar/api-client version             # → 3.10.4
npm view @scalar/fastify-api-reference version  # → 1.60.0（唯一与核心同步）
npm view @scalar/nestjs-api-reference version   # → 1.2.4
npm view @scalar/express-api-reference version  # → 0.10.4
npm view @scalar/hono-api-reference version     # → 0.11.4
npm view @scalar/api-reference-react version    # → 0.9.47

# 官方页（逐个 WebFetch / raw，全部应可达）
# https://scalar.com/
# https://scalar.com/scalar/introduction
# https://github.com/scalar/scalar  (README)
# https://raw.githubusercontent.com/scalar/scalar/main/documentation/configuration.md
# https://raw.githubusercontent.com/scalar/scalar/main/documentation/themes.md
# https://raw.githubusercontent.com/scalar/scalar/main/documentation/migration/swagger-ui.md
# https://raw.githubusercontent.com/scalar/scalar/main/documentation/integrations/express.md
# https://raw.githubusercontent.com/scalar/scalar/main/documentation/integrations/nestjs.md
# https://scalar.com/products/api-client/getting-started
# https://github.com/scalar/scalar/tree/main/integrations
# https://github.com/scalar/scalar/tree/main/packages
# context7: resolve-library-id("Scalar") → /scalar/scalar; query-docs(/scalar/scalar)
```
