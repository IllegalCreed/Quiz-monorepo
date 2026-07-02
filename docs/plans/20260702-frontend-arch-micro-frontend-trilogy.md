# 前端架构设计 · 微前端框架章三件套方案

> 2026-07-02 选型调研定稿。占位 2 叶（qiankun / single-spa）→ **7 叶**。前端架构设计章首个开工的子章。

## 调研结论（三路并行：生态盘点 / 原理概念层 / 本地边界）

- **生态硬数据**（2026-07-02 GitHub API + npm registry 实测，非记忆）：MF 2.0 已运行时化成事实主线（core 当天有 push，v2.6.0 2026-06-23，字节 Web Infra + Zack Jackson 维护）；wujie 2026-06 复活（v2.0 全新 iframe 沙箱，连发 4 版）；micro-app 月度活跃（1.0 仍 RC，rc.32）；qiankun 3.0 三年难产（稳定版停在 2023-11 v2.10.16，2026 活动恢复）；single-spa v7 卡 beta。**淘汰**：Garfish（维护模式，字节转投 MF）、icestark（遗产态，release 停 2022）、Piral/Luigi（国内采用≈0）、originjs/vite-plugin-federation（已被官方 @module-federation/vite 取代）。
- **原理层必须立叶**：沙箱三路线/CSS 隔离三手段/通信四模式/依赖共享三路线是框架无关知识体；qiankun 官方「工作原理」页至今 TODO，通论须自组信源（Fowler + micro-frontends.org + 各框架原理章）。
- **prod 现状（已核实）**：微前端框架 id=169，旧 2 叶 qiankun id=170 / single-spa id=171，**全 0 题、无子节点**——重构窗口干净。旧叶保留原名，仅重排 sort（importCategories 不更新 sort，**入库时手动补 prod 2 条 UPDATE**：170→4、171→3）。
- sidebar 原「single spa」错名已统一为「single-spa」（sidebar text 不影响库）。

## 叶子集合（7 叶）

| sort | 叶名（= categories.ts，题目 categories 逐字一致）   | slug                | 状态                    |
| ---- | --------------------------------------------------- | ------------------- | ----------------------- |
| 1    | 微前端基础                                          | `mfe-basics`        | 🆕                      |
| 2    | 微前端核心机制（沙箱 / 样式隔离 / 通信 / 依赖共享） | `mfe-mechanisms`    | 🆕                      |
| 3    | single-spa                                          | `single-spa`        | 保留原名（prod id=171） |
| 4    | qiankun                                             | `qiankun`           | 保留原名（prod id=170） |
| 5    | wujie                                               | `wujie`             | 🆕                      |
| 6    | micro-app                                           | `micro-app`         | 🆕                      |
| 7    | Module Federation                                   | `module-federation` | 🆕                      |

**路径基底**：笔记 `src/zh/architecture/micro-frontend/{slug}/`（新顶层目录 architecture，仿 engineering 惯例，无顶层 index）；幻灯片 `packages/{slug}-slide`（mfe-basics-slide 等）；题库 `prisma/content/{slug}.json`。

## 跨章边界裁定（本地逐文件核验，写作强制遵守）

| 主题                                                                             | 归属（状态）                                                                                                               | 本章处理                                                                                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| MF **插件配置**（exposes/remotes/shared 子选项、三大坑）                         | webpack expert L85-109、rspack advanced L127-150（已产出深讲）                                                             | MF 叶**只讲架构层**（运行时 vs 构建时、shared 治理策略、MF 2.0 运行时生态、Native Federation、选型），配置一句话链接 |
| 框架**接入代码**（qiankun/wujie/single-spa/micro-app 的 Vue/React 生命周期接入） | vue other L21-168（全库最深实操）、react expert/other、angular expert（Native Federation）、svelte expert（已产出）        | 框架叶讲原理与工程治理，接入示例链接 UI 框架章，不复述                                                               |
| Web Components 标准 API（CE 生命周期/Shadow DOM API）                            | Web进阶 > Web API > Web Components（占位未产出）                                                                           | 只讲「WC 作为微前端隔离载体」，标准本体纯文字提“Web API 章（待产出）”不加链接                                        |
| iframe 标签属性/安全加固/进程隔离                                                | html-media/iframe-embedding、browser-security/iframe-sandbox-clickjacking、browser-architecture/site-isolation（均已产出） | 只讲「iframe 作为微前端方案」的架构权衡（路由同步/弹窗跨框/wujie 混合思路），细节链接三处                            |
| **postMessage 跨窗口通信**                                                       | **全库无深讲**（net-cors 仅 3 处带过）                                                                                     | 核心机制叶通信页**顺势深讲**，origin 校验安全写法链接 browser-security                                               |
| CI/流水线操作                                                                    | engineering/devops（GitHub Actions 等已产出）                                                                              | 独立部署停在架构决策层（remoteEntry 版本策略/灰度/manifest 中心化），流水线甩 DevOps 章                              |
| 通用性能手段（代码分割/Tree Shaking/CDN）                                        | 前端优化章（占位）                                                                                                         | 只深讲微前端特有代价（shared 去重/多运行时/瀑布），通用手段引不展开                                                  |
| 设计模式/组件设计（兄弟叶）                                                      | 占位                                                                                                                       | 无交叉，放心展开                                                                                                     |

## 每叶结构（沿用范式：9 md = index + getting-started + guide-line/6 + reference；页骨架 = frontmatter outline[2,3] + `> 基于 X · 核于 2026-07` + `## 速查` + 编号章节 + `## 小结`（guide 页））

### 1. 微前端基础（mfe-basics）

guide-line：`what-why`（定义动机、Fowler 四收益、Geers 五理念）/ `when-not-to-use`（判据与**反判据**、Vercel 替代方案论述、payload·漂移·治理成本、single-spa 反论）/ `composition-patterns`（构建时=反模式、服务端 SSI·平台侧、客户端运行时三分法）/ `routing-shell`（主应用路由 vs 手动挂载、shell/容器职责、鉴权留容器层）/ `relations`（vs iframe·monorepo·BFF·模块化单体）/ `landscape-2026`（三主流+MF 格局、退场者、国际方案、Web Fragments/Vercel 平台组合新动向）。
信源：martinfowler.com micro-frontends、micro-frontends.org、single-spa concept、vercel.com/docs/microfrontends、各仓库 GitHub。

### 2. 微前端核心机制（mfe-mechanisms）

guide-line：`js-sandbox`（快照 diff 单实例 / Proxy fakeWindow 多实例 / with+Proxy / iframe 沙箱路线、ShadowRealm Stage 2.7 只作前瞻**禁写即将可用**）/ `css-isolation`（Shadow DOM 穿透边界·继承属性、scoped 属性改写与 @keyframes·@font-face 不支持、动态样式表劫持、命名约定四路线）/ `html-entry-loading`（HTML entry=资源清单、import-html-entry 三 API、UMD 约束、publicPath 注入、JS entry 对照）/ `communication`（props 下行、CustomEvent 上行、发布订阅 initGlobalState 型、URL 即通信、utility module；**postMessage 深讲**）/ `dependency-sharing`（externals+import maps【Baseline Widely available since 2023-03】、MF shared 版本协商【singleton 最高版本获胜、双端声明】、import maps scopes 多版本；SystemJS 讲成历史层）/ `perf-preload`（prefetch 四形态、keep-alive、重复运行时代价、请求瀑布、Fowler 实测原则）。
信源：qiankun faq/api、wujie 原理、micro-app sandbox 文档、import-html-entry README、module-federation.io/configure/shared、MDN importmap/Shadow DOM、TC39 proposal-shadowrealm。

### 3. single-spa

guide-line：`three-types`（application/parcel/utility module）/ `lifecycle-protocol`（bootstrap·mount·unmount·update 协议、超时与错误）/ `root-config`（registerApplication、activity functions、最薄 shell 哲学）/ `import-maps-workflow`（原生 ESM+import maps 现代工作流、SystemJS 退居 polyfill 史、import-map-overrides/deployer）/ `framework-adapters`（single-spa-vue/react/angular 参数与定位，接入码链 UI 章）/ `status-positioning`（v6 稳定 v7 卡 beta、qiankun 底座、直接用它 vs 用封装的判据）。
信源：single-spa.js.org（concept/api/recommended-setup）、GitHub releases。

### 4. qiankun

guide-line：`core-api`（registerMicroApps/activeRule/start、loadMicroApp 与 singular 语义）/ `sandbox-impl`（快照/legacy proxy/proxy 三沙箱自动选择、window 代理细节）/ `style-isolation`（strictStyleIsolation shadow 包裹、experimentalStyleIsolation 属性改写与坑、2026 @scope 新方案、antd prefixCls）/ `html-entry-integration`（UMD output.library 对齐、entry 标记、`__INJECTED_PUBLIC_PATH_BY_QIANKUN__`）/ `vite-esm-pain`（2.x 不支持 ESM 入口的根因、vite-plugin-qiankun 社区路、换 wujie/micro-app 判据）/ `evolution-status`（prefetch 四形态、initGlobalState、2.x 事实稳定线与 3.0 难产史、2026 复苏 create-qiankun）。
信源：qiankun.umijs.org guide/faq/api、GitHub discussions#1378（3.0 roadmap）。

### 5. wujie

guide-line：`iframe-sandbox`（iframe JS 沙箱原理：原生 window/history 隔离、规避 with 性能损耗、降级方案）/ `wc-rendering`（WebComponent 容器 + DOM 代理渲染、事件修正）/ `route-sync`（劫持 pushState/replaceState 同步子应用 URL 到主应用 query、浏览器前进后退）/ `keep-alive-preload`（保活模式、预加载/预执行分级、秒开原理与内存代价）/ `communication-props`（props、window.parent 直通、去中心化 EventBus）/ `v2-status`（v2.0 空白同域 iframe 新沙箱、2026-06 复活时间线、选型定位：隔离最强 + Vite 原生友好）。
信源：wujie-micro.github.io/doc、Tencent/wujie releases。

### 6. micro-app

guide-line：`custom-element`（CustomElement 容器组件化接入、`<micro-app>` 标签、接入成本最低的含义）/ `with-sandbox`（默认 with+Proxy 沙箱机制）/ `iframe-sandbox-mode`（1.0 iframe 沙箱可选模式、src 同域初始化坑与 window.stop）/ `element-style-isolation`（元素隔离、样式隔离实现）/ `data-communication`（属性下行 setData、事件上行、全局数据）/ `rc-status`（1.0 长期 RC 时间线、京东生态、虚拟路由系统、选型定位）。
信源：jd-opensource.github.io/micro-app、GitHub docs（sandbox.md 等）。

### 7. Module Federation

guide-line：`federation-concepts`（host/remote/双向联邦心智模型、模块级 vs 应用级复用、运行时组合 vs 构建时组合）/ `shared-governance`（shared 版本协商治理：singleton 最高版本、requiredVersion/strictVersion 策略、双端声明原则——架构视角，配置细节链 webpack expert）/ `mf2-runtime`（2.0 运行时化：独立 runtime SDK、动态注册 remote、mf-manifest.json 协议）/ `mf2-ecosystem`（类型联邦、Chrome DevTools、预加载；跨构建工具：webpack/Rspack/官方 @module-federation/vite，originjs 已停滞）/ `native-federation`（ESM+Import Maps 实现联邦心智模型、esbuild、Angular 官方背书、bundler-agnostic 对照）/ `vs-qiankun-selection`（vs 应用级方案：无沙箱的含义与自治代价、混用模式 single-spa+MF、选型决策树）。
信源：module-federation.io（guide/configure/blog 2.0 公告）、rspack.rs MF 章、angular-architects、GitHub module-federation/core。

## 产出规格（与浏览器章一致）

- 笔记：每叶 9 md；除 index 外每页 `## 速查`；guide 页 `## 小结`；`> 基于 X · 核于 2026-07`（基础/机制叶用「微前端架构」，框架叶用「{框架} vX」实测版本）；mustache `<code v-pre>`；0 死链；只链已产出页。
- 幻灯片：`packages/{slug}-slide`（Slidev 锁 52.15.2），0 溢出门禁。
- 题库：每叶 70 题（入门 10/初级 18/中级 24/高级 12/专家 6），叶名逐字一致，stem 含技术名前缀，全角引号，node 自检。
- 入库：`import:content:prod`（经用户确认）+ 手动补 prod sort UPDATE×2（id=170→4、id=171→3）。
- 部署：笔记 rsync（dry-run 核 deleting）+ SlideStack 按包 deploy。

## 交付顺序

基础 → 核心机制 → single-spa → qiankun → wujie → micro-app → Module Federation（依 sort；每叶笔记→幻灯片+题库流水线，全章齐后统一审查、入库、部署）。
