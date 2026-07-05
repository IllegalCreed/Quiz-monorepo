# Web 进阶知识 · 语言章三件套方案

> 2026-07-05 选型调研定稿。「Web进阶知识 > 语言」由占位 **9 叶** 扩为 **15 叶**（+ 跨章新增组件库 Astryx 1 叶）。全章未产出，本批为从零开锁 + 逐叶生产。

## 调研结论

- **信源**：StyleX 官方文档（stylexjs.com/docs/learn）、Meta 工程博客《CSS at Scale with StyleX》（2026-01）、Astryx 官方站（astryx.atmeta.com）+ GitHub（facebook/astryx）、《State of CSS-in-JS 2026》（pkgpulse）、npm trends。逐条一手核验，生产阶段每叶再逐页 WebFetch + context7 双路校验、本地锁版本。
- **核心缺口（本批补齐）**：
  1. **CSS-in-JS 整个范式缺失**。2026 生态周下载：Emotion ~9M、styled-components ~7M（均衰退/维护期）、vanilla-extract ~450K（稳）、Panda CSS ~200K（+150% 猛涨）、StyleX ~100K（涨）、CSS Modules（"安静的标准"，无处不在）。趋势＝零运行时/编译期取代运行时注入。取**现代主流 4**：CSS Modules（作用域基线）+ StyleX（Meta 编译期原子化、框架无关）+ Panda CSS（Chakra 团队、零运行时新星）+ vanilla-extract（TS-first、设计系统常用）。
  2. **数据/标记语言**补 TOML（Cargo/pyproject/Wrangler 等广泛用、与 JSON/YAML 同类）+ MDX（Markdown+JSX 超集、Docusaurus/Nextra/Astro 文档生态主力）。
  3. **StyleX 配套组件库 Astryx**：Meta 2026-06 开源的 React 设计系统（MIT、150+ 组件、内部 8 年/13000+ 应用、基于 StyleX、带 CLI+MCP「AI agent 可读」），属**组件库**，落「前端框架 > 组件库」（与 MUI/Radix/shadcn 并列），与 StyleX 配套同批产出。
- **排除项**：styled-components / Emotion（下载量仍最高但已进维护/衰退期，2026 新项目不推荐；面试向可后续再议，本批不立叶，在 CSS-in-JS 各叶对比带过）；Linaria（被 vanilla-extract/Panda 蚕食）；XML（前端场景衰退，不立叶）。
- **PixiJS**：**已完结**——在「前端可视化 > 2D 渲染引擎」组，2026-07-05 已产出 52 题三件套并部署上线，非本批范围。

## 结构变更（categories.ts + VitePress sidebar 同步）

「CSS预处理」组语义不准（Tailwind/UnoCSS 非预处理器）——**重构升级为「样式方案」父组，下分两桶**：

```
语言（sort 1）
├─ Markdown（sort 1）
├─ MDX（sort 2）                                🆕
├─ TypeScript（sort 3）
├─ 样式方案（sort 4）                            ♻️ 原「CSS预处理」重构升级
│  ├─ CSS 工具链（sort 1）：Sass / Less / PostCSS / Tailwind CSS / UnoCSS
│  └─ CSS-in-JS（sort 2）：CSS Modules🆕 / StyleX🆕 / Panda CSS🆕 / vanilla-extract🆕
├─ JSON（sort 5）
├─ YAML（sort 6）
└─ TOML（sort 7）                               🆕

前端框架 > 组件库：追加 Astryx（sort 18）        🆕（StyleX 配套）
```

## 叶子集合（15 叶 + Astryx）

| 叶名（= categories.ts 叶名，题目 categories 须逐字一致） | slug              | content JSON           | 状态            |
| -------------------------------------------------------- | ----------------- | ---------------------- | --------------- |
| Markdown                                                 | `markdown`        | `markdown.json`        | 占位→产出       |
| MDX                                                      | `mdx`             | `mdx.json`             | 🆕 新增         |
| TypeScript                                               | `typescript`      | `typescript.json`      | 占位→产出       |
| Sass                                                     | `sass`            | `sass.json`            | 占位→产出       |
| Less                                                     | `less`            | `less.json`            | 占位→产出       |
| PostCSS                                                  | `postcss`         | `postcss.json`         | 占位→产出       |
| Tailwind CSS                                             | `tailwind`        | `tailwind.json`        | 占位→产出       |
| UnoCSS                                                   | `unocss`          | `unocss.json`          | 占位→产出       |
| CSS Modules                                              | `css-modules`     | `css-modules.json`     | 🆕 新增         |
| StyleX                                                   | `stylex`          | `stylex.json`          | 🆕 新增         |
| Panda CSS                                                | `panda-css`       | `panda-css.json`       | 🆕 新增         |
| vanilla-extract                                          | `vanilla-extract` | `vanilla-extract.json` | 🆕 新增         |
| JSON                                                     | `json`            | `json.json`            | 占位→产出       |
| YAML                                                     | `yaml`            | `yaml.json`            | 占位→产出       |
| TOML                                                     | `toml`            | `toml.json`            | 🆕 新增         |
| Astryx（组件库）                                         | `astryx`          | `astryx.json`          | 🆕 新增（跨章） |

内容目录：`src/zh/web-advanced/language/{slug}/`；Astryx 落 `src/zh/frontend-framework/components/astryx/`。

## prod 迁移（⚠️ 落地前强制，沿「分类移动坑」流程）

「CSS预处理」重构为「样式方案」两桶后，import 按 `groupId:parentId:name` 只增不删——**旧节点会残留孤儿**：

- **孤儿清单**（均 0 题、未产出，可安全删）：旧节点「CSS预处理」+ 其 5 子叶「Sass / Less / PostCSS / Tailwind CSS / UnoCSS」（旧 parentId=CSS预处理）。新结构里这 5 叶 parentId 改为「CSS 工具链」→ key 变→ import 会新建，旧的成孤儿。
- **迁移步骤**（`import:content:prod` 之前）：
  1. 复用 import 的 `PrismaMariaDb` adapter + `dotenv -e .env.production -e .env.production.local` **只读**连 prod，定位「CSS预处理」子树，**校验各节点 0 题 0 有效子引用**。
  2. 一次性 ts 脚本删旧 6 节点（先删 5 叶再删父「CSS预处理」）。
  3. 再 `import:content:prod`——importCategories 建全新「样式方案 > CSS 工具链 / CSS-in-JS」树 + 各新叶。
- 其余新叶（MDX/TOML/CSS Modules/StyleX/Panda CSS/vanilla-extract/Astryx）纯新增，import 直接加、无需清理。
- 参考记忆 `content-deploy-workflow`「分类移动坑」、CLAUDE.md「题目入库规范·分类移动坑」。

## 跨章边界裁定（写作时强制遵守）

| 主题                                     | 归属                                      | 本章处理                                                           |
| ---------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| CSS 选择器/盒模型/Flex/Grid/自定义属性等 | Web基础 > 三大语言 > CSS（10 叶，已产出） | 样式方案各叶只讲**工具/方案层**，原生 CSS 语法一句话链接不重讲     |
| CSS 变量/`@property`/工程化              | `css-variables-engineering`（已产出）     | StyleX/Panda `defineVars`、Sass 变量等只讲各自 API，原生机制互链   |
| Tailwind/UnoCSS 运行时用法               | 本章（新产出）                            | 与「原子化 CSS」概念在组内对比；与组件库 shadcn(Tailwind) 边界互链 |
| Emotion（MUI 底层）/styled-components    | 本批不立叶                                | CSS-in-JS 各叶对比带过（说明衰退与零运行时迁移）                   |
| Astryx 组件用法                          | 组件库（本批产出）                        | StyleX 叶讲样式引擎，Astryx 叶讲设计系统/组件/CLI+MCP，互链        |
| TypeScript 类型体操/tsconfig             | 本章 TypeScript 叶                        | 与工具链 tsc（已产出）边界：tsc 讲编译器 CLI，本叶讲语言本身       |
| JSON Schema / package.json 字段          | 本章 JSON 叶概念层                        | 具体工具配置归各工具叶                                             |
| Markdown-it（解析器库）                  | 前端框架 > 其他 > Markdown-it（已产出）   | Markdown 叶讲语法/CommonMark/GFM，解析器实现互链                   |

## 每叶覆盖要点（guide-line 深度页数生产时按内容深度定；门禁：每页顶 `## 速查`）

- **Markdown** — CommonMark 规范、GFM 扩展（表格/任务列表/删除线/围栏）、front matter、常见方言差异、转义与 HTML 内嵌。
- **MDX** — Markdown+JSX 融合、组件导入/导出、表达式插值、编译流程（@mdx-js）、与 VitePress/Docusaurus/Astro/Nextra 集成、v2→v3 变化。
- **TypeScript** — 类型系统/推断/窄化、泛型、工具类型、模块与声明文件、tsconfig 关键项、装饰器/枚举取舍、类型体操入门、与 JS 互操作。
- **Sass** — SCSS vs 缩进语法、变量/嵌套/mixin/`@use`/`@forward`（`@import` 弃用）、模块系统、内置模块、Dart Sass 现状。
- **Less** — 变量/混合/嵌套/运算、`@import` 选项、与 Sass 差异、现状定位。
- **PostCSS** — AST 转换机制、插件生态（autoprefixer/preset-env/nesting）、与预处理器/工具的关系、config 写法。
- **Tailwind CSS** — 工具类范式、v4 引擎（CSS-first 配置、`@theme`）、JIT、`@apply`/指令、设计令牌、与组件库配合。
- **UnoCSS** — 按需原子化引擎、presets、attributify、与 Tailwind 差异、Vite 集成、图标预设（本仓踩过的 presetIcons 坑）。
- **CSS Modules** — 局部作用域机制、`:global`/`composes`、`*.module.css`、构建集成、与 CSS-in-JS/零运行时对照。
- **StyleX** — 编译期原子化、`create`/`props`/`defineVars`/`createTheme`/`keyframes`、类型安全、框架无关集成、与 Tailwind/CSS-in-JS 对比。
- **Panda CSS** — 零运行时提取、recipes/patterns、`css()`/`cva`、design tokens、与 Chakra/StyleX 对比。
- **vanilla-extract** — TS-first 样式、`.css.ts`、`style`/`recipe`/`sprinkles`、类型安全 tokens、零运行时。
- **JSON** — 语法/数据类型、JSON5/JSONC 变体、JSON Schema、序列化坑（数字精度/循环引用）、与 YAML/TOML 对比。
- **YAML** — 缩进/锚点别名/多文档、标量类型与坑（Norway problem）、与 JSON 关系、常见配置场景。
- **TOML** — 语法/表/数组表/日期、设计目标（配置友好）、与 JSON/YAML 对比、生态（Cargo/pyproject/Wrangler）。
- **Astryx** — 设计系统定位、组件/主题/暗色、CLI + MCP server「agent-ready」、基于 StyleX、与 shadcn/MUI 等对比、上手集成。

## 生产计划（分 5 子批，逐批「调研→三件套→门禁→commit→部署（prod 前用户确认）」）

1. **数据/标记语言**：Markdown、MDX、JSON、YAML、TOML（5 叶）
2. **TypeScript**：TypeScript（1 叶，体量大可单批）
3. **CSS 工具链**：Sass、Less、PostCSS、Tailwind CSS、UnoCSS（5 叶）
4. **CSS-in-JS**：CSS Modules、StyleX、Panda CSS、vanilla-extract（4 叶）
5. **Astryx**：组件库 Astryx（1 叶，跨章；prod 迁移仅纯新增）

门禁（三件套强制）：题库重质、每题 stem 带技术名前缀 + categories 叶名逐字一致 + 全角引号；幻灯片 build 后 `check-slidev-overflow.mjs` 0 溢出；笔记每内容页顶 `## 速查` + context7/网页双路校验。子批 4 含 prod 迁移（删「CSS预处理」孤儿子树）——落地前只读核查 + 用户确认。
