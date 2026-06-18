# JSDoc 研究过程审计报告

> 目的：留痕研究过程，证明 JSDoc 叶子的前期研究充分、全面、有据可查 · 审计日期 2026-06-18
> 审计对象：事实底稿 `/tmp/research/jsdoc.md`（三件套唯一事实源，16 节）
> 审计方式：审计 agent **独立重新核验**底稿引用的一手资料，不复述结果，只验证证据链。

---

## 一、研究方法论（五步法）

本次审计复刻并验证了底稿声明的五步研究法（底稿开头「调研来源」行：`jsdoc.app 官方逐页 + TypeScript 官方 JSDoc Reference + context7(/jsdoc/jsdoc.github.io) + 本地 npm view 验证`）：

| 步骤                 | 方法                                                                                                                                   | 本次审计的执行情况                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1. 官方逐页 WebFetch | 逐页抓取 jsdoc.app 官方文档（getting-started / tags-type / tags-typedef / configuring / namepaths / block-inline-tags / tags-returns） | ✅ 实抓 7 个 jsdoc.app 页面，全部可达且内容支撑底稿       |
| 2. TS 官方交叉源     | 抓 TypeScript 官方 JSDoc Reference 页                                                                                                  | ✅ 实抓 1 页，逐条比对第 12 节「配合 TypeScript」全部结论 |
| 3. context7 双校验   | `resolve-library-id` 查 JSDoc，确认库存在 + snippets 量                                                                                | ✅ 命中 `/jsdoc/jsdoc.github.io`，504 snippets，High 信誉 |
| 4. 本地版本验证      | `npm view jsdoc version/engines` 核实版本号与引擎                                                                                      | ✅ 4.0.5 / Node>=12.0.0，与底稿完全一致                   |
| 5. 交叉比对后定稿    | 一手文档 + 本地验证双支撑才采信                                                                                                        | ✅ 关键结论均做到≥2 源印证（见第五节）                    |

**方法论评价**：底稿遵循了 CLAUDE.md「内容审查规范」要求的「WebFetch 首页 → 逐页 → context7 补充 → 本地验证 → 交叉比对」流程，未出现「仅凭 context7/AI 总结下结论」的禁止行为。审计独立复算后未发现编造来源。

---

## 二、一手资料清单（核验结果）

审计 agent 实地重新抓取/执行了以下 11 个来源（9 个独立 WebFetch + context7 + npm CLI），逐条标注可达性与一致性：

| #   | 资料(URL/库/命令)                                              | 类型           | 可达/核验     | 拿到的关键信息                                                                                                                                                                                                                                                                                                                                                 | 支撑底稿哪节                   |
| --- | -------------------------------------------------------------- | -------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | jsdoc.app `/about-getting-started`                             | 官方页         | ✅可达一致    | 「Each comment must start with a `/**` sequence」；Book 最小示例；「create a directory named `out/`」默认输出                                                                                                                                                                                                                                                  | §0/§2/§1（out/）               |
| 2   | jsdoc.app `/tags-type`                                         | 官方页         | ✅可达一致    | `{?number}`「A number or null」、`{!number}`「never null」、`[foo]`/`{number=}`、`{...number}` 变参、`(number\|boolean)` 联合、`Array.<MyClass>`、`Object.<string,number>`、`{{a,b,c}}` 对象字面量、`{*}` 任意                                                                                                                                                 | §5 类型表达式全集              |
| 3   | jsdoc.app `/tags-typedef`                                      | 官方页         | ✅可达一致    | `@typedef {(number\|string)} NumberLike` 联合别名；`@typedef {Object} WishGranter~Triforce` + `@property` 对象形状                                                                                                                                                                                                                                             | §6 自定义类型                  |
| 4   | jsdoc.app `/about-configuring-jsdoc`                           | 官方页         | ✅可达一致    | JSON(3.3.0+ 带注释)/CJS(3.5.0+)；`includePattern` 默认 `.+\.js(doc\|x)?$`、`excludePattern` 默认下划线；`recurseDepth`=10(3.5.0+)；`sourceType` module 默认；`dictionaries`=["jsdoc","closure"]；「command line takes precedence」                                                                                                                             | §10 配置文件                   |
| 5   | jsdoc.app `/about-namepaths`                                   | 官方页         | ✅可达一致    | `#`实例/`.`静态/`~`内部；链式 `Person#Idea#consider`；`module:`/`external:`/`event:` 前缀；`chat."#channel"` 引号转义                                                                                                                                                                                                                                          | §9 namepaths                   |
| 6   | jsdoc.app `/about-block-inline-tags`                           | 官方页         | ✅可达一致    | 「Block tags always begin with an at sign」；内联标签须 `{}` 包裹；「escape it with a leading backslash」转义 `}`                                                                                                                                                                                                                                              | §3 块/内联标签                 |
| 7   | jsdoc.app `/tags-returns`                                      | 官方页         | ✅可达一致    | 「Synonyms: `return`」——`@returns`/`@return` 官方互为别名                                                                                                                                                                                                                                                                                                      | §4(@returns)/§15.2             |
| 8   | typescriptlang.org `/docs/handbook/jsdoc-supported-types.html` | 官方页(交叉源) | ⚠️有出入(1处) | `@import`✅支持、`@satisfies`✅支持；Unsupported tags=`@memberof`/`@yields`/`@member`，且「`@async`...not yet supported」；`?`仅 strictNullChecks 有意义、`!`被当原类型忽略；`{ b: number= }` 不支持要用 `b?`；legacy 同义词 `String→string`…`Object/object→any`、`array→Array<any>`、`promise→Promise<any>`、`function→Function`，后四个 noImplicitAny 下关闭 | §12 配合 TypeScript / §15 踩坑 |
| 9   | npmjs.com `/package/jsdoc`（网页）                             | 注册表网页     | ⚠️不可达(403) | 网页反爬返回 403 Forbidden；已用来源 #10 的 npm CLI 替代（CLI 数据源更权威）                                                                                                                                                                                                                                                                                   | §13（版本，已由#10兜底）       |
| 10  | `npm view jsdoc version/engines/time`                          | 本地命令       | ✅可达一致    | version=**4.0.5**；engines=`{node:'>=12.0.0'}`；最近发布 2025-10-08                                                                                                                                                                                                                                                                                            | §13 版本与现状                 |
| 11  | context7 `resolve-library-id "JSDoc"`                          | 库索引         | ✅可达一致    | 命中 `/jsdoc/jsdoc.github.io`，描述吻合，504 snippets，High 信誉，Benchmark 87                                                                                                                                                                                                                                                                                 | 全局来源声明                   |

附带核实：`npm view typedoc version` = **0.28.19**，与底稿 §13「TypeDoc 0.28.x 活跃」一致。

---

## 三、context7 交叉验证

- **查询**：`resolve-library-id`，libraryName="JSDoc"。
- **命中库 ID**：`/jsdoc/jsdoc.github.io`（与底稿来源声明的 `context7(/jsdoc/jsdoc.github.io)` 完全一致）。
- **snippets 量**：504 个代码片段，Source Reputation **High**，Benchmark Score 87。
- **验证点**：该库即 JSDoc 官方文档站 GitHub 仓库的镜像，描述「markup language and documentation generator for JavaScript source code」与底稿 §0 定位一致。
- **旁证**：同次返回还命中 `/microsoft/tsdoc`(TSDoc 规范) 与 `/gajus/eslint-plugin-jsdoc`，二者正是底稿 §14 工具链对比中提到的「TSDoc(微软注释规范)」「eslint-plugin-jsdoc(ESLint 规则集)」，侧证 §14 对比表的库名准确。
- **结论**：context7 这一路独立印证了 JSDoc 库的存在性、权威性与文档充实度（504 snippets 足够支撑题库取材），与官方页形成「文档站 ↔ 库索引」双校验。

---

## 四、本地版本核实（npm view 结果 vs 底稿）

| 指标         | 底稿声明                   | `npm view` 实测               | 判定                         |
| ------------ | -------------------------- | ----------------------------- | ---------------------------- |
| jsdoc 版本   | 4.0.5                      | 4.0.5                         | ✅一致                       |
| Node 引擎    | `>=12`（jsdoc engines）    | `{ node: '>=12.0.0' }`        | ✅一致                       |
| 最近发布     | 「更新节奏慢（不是停滞）」 | 2025-10-08（距审计约 8 个月） | ✅佐证「慢但非停滞」表述准确 |
| TypeDoc 版本 | 0.28.19 / 0.28.x 活跃      | 0.28.19                       | ✅一致                       |

本地命令为权威注册表数据，三项核心版本号 + 引擎全部命中，**底稿版本基准行可信**。npmjs 网页虽 403 不可达，但版本结论已由 CLI 独立兜底，不影响证据链闭合。

---

## 五、证据链（关键结论 → 来源，标注是否多源印证）

| 关键结论                                                                             | 一手来源                                                            | 多源印证                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| 注释必须 `/**` 开头，`/*`/`//` 不解析（第一道坎）                                    | jsdoc.app getting-started（#1）原文                                 | 单官方源（权威，无需二源）        |
| 默认输出目录 `out/`                                                                  | jsdoc.app getting-started（#1）+ configuring opts 示例（#4）        | ✅双源                            |
| `@returns`/`@return` 完全等价                                                        | jsdoc.app tags-returns「Synonyms: return」（#7）                    | 单官方源（明确）                  |
| 类型语法 `?`可空 / `!`非空 / `...`变参 / `\|`联合 / `Array.<>` / `Object.<>` / `{*}` | jsdoc.app tags-type（#2）逐条命中                                   | ✅官方页 + context7 snippets 旁证 |
| 内联标签须 `{}` 包裹、`}` 反斜杠转义                                                 | jsdoc.app block-inline-tags（#6）                                   | 单官方源（明确）                  |
| namepath `#`/`.`/`~`/`module:`/`external:`/`event:` + 引号转义                       | jsdoc.app namepaths（#5）逐条命中                                   | 单官方源（完整覆盖）              |
| 配置：JSON(3.3.0+)/CJS(3.5.0+)、recurseDepth=10、命令行优先级>配置                   | jsdoc.app configuring（#4）逐条命中                                 | 单官方源（完整覆盖）              |
| TS 支持 `@import`/`@satisfies`；不支持 `@memberof`/`@yields`/`@member`/`@async`      | TS 官方 JSDoc 页（#8）                                              | 单官方源（TS 唯一权威）           |
| `!` 在 TS 被忽略、`?` 仅 strictNullChecks 有意义、`{b:number=}` 须改 `b?`            | TS 官方 JSDoc 页（#8）原文                                          | 单官方源（TS 唯一权威）           |
| legacy 同义词 `Object/object→any`、noImplicitAny 下关闭                              | TS 官方 JSDoc 页（#8）「Legacy type synonyms」原文                  | 单官方源（TS 唯一权威）           |
| jsdoc 4.0.5 / Node>=12 / 慢更新非停滞                                                | `npm view`（#10）+ context7 库存在（#11）                           | ✅双源                            |
| TypeDoc 0.28.19 活跃 / API Extractor / TSDoc / eslint-plugin-jsdoc 工具链坐标        | `npm view typedoc` + context7 命中 tsdoc/eslint-plugin-jsdoc（#11） | ✅双源                            |

**证据链闭合性**：底稿 16 节的关键结论均能追溯到至少 1 个一手来源；版本类、out/ 目录类、工具链类做到≥2 源交叉印证。**证据链闭合。**

---

## 六、研究章节覆盖（底稿各节主题 + 广度评估）

| 底稿节              | 主题                                                                                               | 对应一手核验                      | 广度评估                             |
| ------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------ |
| §0 定位与工具链坐标 | JSDoc=标记语言+生成器；vs TypeDoc/tsc/SSG                                                          | context7 描述 + §14 旁证          | 充分，边界清晰                       |
| §1 安装与命令行     | pnpm 安装、`-r/-d/-c/-t/-R/-v`、out/ 默认                                                          | getting-started + configuring     | 充分                                 |
| §2 注释语法与放置   | `/**` 开头、紧贴符号、最小示例                                                                     | getting-started 原文              | 充分                                 |
| §3 块 vs 内联标签   | `@`起行 / `{}`内联、4 个内联标签、转义                                                             | block-inline-tags                 | 充分（4 个内联标签数目见下「局限」） |
| §4 核心块标签详解   | @param/@returns/@type/@typedef/@callback… 30+ 标签                                                 | tags-returns + 标签知识           | 广度足，覆盖主流标签                 |
| §5 类型表达式全集   | nullable/non-null/optional/variadic/union/泛型/对象/函数/\*                                        | tags-type 逐条                    | 充分（函数类型语法见下「局限」）     |
| §6 自定义类型       | @typedef 联合/对象形状、@callback                                                                  | tags-typedef                      | 充分                                 |
| §7 类与继承         | class 自动识别、@extends/@implements/@abstract…                                                    | 标签知识                          | 充分                                 |
| §8 模块文档         | @module/@exports、CJS/ESM/AMD                                                                      | 标签知识                          | 充分                                 |
| §9 namepaths        | #/./~/module:/external:/event:                                                                     | namepaths 逐条                    | 充分                                 |
| §10 配置文件        | source/plugins/recurseDepth/sourceType/tags/templates/opts/优先级                                  | configuring 逐条                  | 充分                                 |
| §11 模板与插件      | docdash/better-docs/minami、markdown 插件                                                          | 标签知识                          | 充分                                 |
| §12 配合 TS（金矿） | @ts-check/checkJs、三种可选语法、@import/@satisfies/@template、不支持标签、! ? 差异、legacy 同义词 | TS 官方页逐条                     | **重点章，核验最密，仅 1 处出入**    |
| §13 版本与现状      | 4.0.5 / Node>=12 / TypeDoc 0.28.x                                                                  | npm view ×2                       | 充分                                 |
| §14 工具链对比      | TypeDoc/API Extractor/TSDoc/eslint-plugin-jsdoc/documentation.js/ESDoc                             | context7 旁证 tsdoc+eslint-plugin | 充分，边界清楚                       |
| §15 踩坑清单        | 8 条坑均映射前文                                                                                   | 各官方页                          | 充分                                 |
| §16 实战片段库      | 4 段可复用代码                                                                                     | 综合                              | 充分                                 |

**广度结论**：覆盖了 JSDoc 从安装→注释语法→块/内联标签→类型系统→自定义类型→类/模块→namepath→配置→模板→TS 集成→版本→工具链对比→踩坑→实战片段的**完整链路**，无明显主题缺口。现代重点（TS 集成）单独成「金矿」章并核验最密，符合三件套「重质」导向。

---

## 七、充分性自审

### 充分之处

1. **一手来源密度高**：实地核验 9 个 WebFetch 页面（7 个 jsdoc.app 官方页 + 1 个 TS 官方页 + 1 次注册表网页）+ context7 + npm CLI ×2，覆盖底稿声明的全部来源类型。
2. **官方页全部可达且内容支撑结论**：jsdoc.app 7 页 + TS 1 页 = 8 个权威页 100% 可达，关键论断（`/**`、out/、`?`/`!`、配置优先级、namepath、@returns 别名、TS 不支持标签、legacy 同义词）均在原文逐字命中。
3. **版本零误差**：jsdoc 4.0.5 / Node>=12 / TypeDoc 0.28.19 三项本地实测与底稿完全一致。
4. **交叉印证到位**：out/ 目录、版本号、工具链库名均做到双源；TS 专属结论锁定 TS 唯一权威源。
5. **无编造来源**：底稿声明的来源（jsdoc.app 逐页、TS 官方页、context7 库 ID、npm view）经独立复算全部真实存在、可复现。

### 局限 / 存疑

1. **§3「内联标签仅 4 个」未在单页逐字枚举**：jsdoc.app block-inline-tags 页只示范了 `{@link}`，未在该页列全 `{@linkcode}/{@linkplain}/{@tutorial}`。该「4 个」是 JSDoc 长期成例（散见各 tags-\* 页），结论正确但**传统可追溯性略弱**，建议补抓 tags-inline-link / tags-inline-tutorial 页加固。
2. **§5 函数类型语法 `{function(string): boolean}` 未在 tags-type 页直接示范**：该页用 `@callback` 表达回调，函数类型字面量语法来自 Closure 体系，结论无误但**该条单页直证不足**。
3. **npmjs 网页 403 不可达**：注册表网页因反爬未抓到，已由 `npm view` CLI（更权威）兜底，不影响版本结论，仅记录为来源可达性的 1 个瑕疵。
4. **§13「feature-complete / 更新节奏慢」属定性判断**：用「最近发布 2025-10-08」佐证为「慢但非停滞」，方向正确，但「feature-complete」为社区共识性表述，无单一官方声明背书。

### 存疑 / 需修订（1 处出入）

- **§12 末「@overload(TS5.0+,本档不重点)」**：审计独立抓取 TS 官方 JSDoc Reference 页，**全文未出现 `@overload`**，该页未将其列为支持标签。底稿把它写进示例注释（虽标「本档不重点」）属**轻微越界**——`@overload` 的 JSDoc 支持实际由 TS 5.0 引入，但**不在本审计核验的这一页**，底稿未给该条单列来源。**建议**：要么补一条 `@overload` 的独立 TS release-notes 来源，要么从示例中删除以免误导。其余 §12 全部结论（@import/@satisfies/不支持标签/`!`/`?`/legacy 同义词）均与 TS 官方页逐字吻合。

### 总体可信度评级

**A（高可信，可作为三件套事实源）。** 8 个官方权威页 100% 可达且逐字支撑、版本零误差、证据链闭合、双源交叉到位；仅 1 处（`@overload`）需补源或删除，2 处（内联标签计数、函数类型语法）建议补抓加固——均为枝节，不动摇主体结论。研究过程**充分、全面、有据可查，无偷懒迹象**。
