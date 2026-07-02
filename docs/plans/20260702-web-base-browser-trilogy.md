# Web 基础知识 · 浏览器基础章三件套方案

> 2026-07-02 选型调研定稿。占位 3 叶 → **5 叶**。本章收官后「Web基础知识」大分区（三大语言 26 叶 + 计算机网络基础 11 叶 + 浏览器基础 5 叶）全部完成。

## 调研结论（三路并行调研 + 本地边界核验）

- **信源**：Chrome《Inside look at modern web browser》Part 1-4、MDN（How browsers work / CRP / Web Storage / IndexedDB / Storage API / Cache / Security / CSP / Mixed Content / Secure Contexts / Permissions-Policy / Trusted Types / Local Network Access）、web.dev（storage-for-the-web / bfcache）、Chromium（site-isolation / RenderingNG 架构与数据结构），全部逐页 WebFetch 一手抓取。
- **prod 现状（已核实）**：浏览器基础章 id=30，旧 3 叶 id=31/32/33，**全部 0 题、无子节点**——重构窗口干净。
- **落地零风险设计**：旧 3 叶全部**保留原名**（避开 import 按 `groupId:parentId:name` 去重的「改名/移动 = 旧节点残留 + 新建重复」坑），仅新增 2 叶 + 重排 sort。`importCategories` 不更新已有节点 sort，**入库时须手动补 prod 3 条 sort UPDATE**（id=31→2、id=32→4、id=33→5）。

## 叶子集合（5 叶）

| sort | 叶名（= categories.ts 叶子名，题目 categories 必须逐字一致） | slug                   | 状态                   |
| ---- | ------------------------------------------------------------ | ---------------------- | ---------------------- |
| 1    | 浏览器架构与进程模型                                         | `browser-architecture` | 🆕 新增                |
| 2    | 浏览器渲染原理                                               | `browser-rendering`    | 保留原名（prod id=31） |
| 3    | 浏览器存储                                                   | `browser-storage`      | 🆕 新增                |
| 4    | 浏览器缓存机制                                               | `browser-cache`        | 保留原名（prod id=32） |
| 5    | 浏览器安全                                                   | `browser-security`     | 保留原名（prod id=33） |

## 跨章边界裁定（三路调研交叉敲定，写作时强制遵守）

| 主题                                                   | 归属                                                               | 本章处理                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 事件循环/宏微任务/Promise                              | `js-async`（已产出）                                               | 不重讲；渲染侧**帧时序**（rAF/rIC、合成器配合）归渲染原理叶             |
| DOM/事件 API 用法（addEventListener、委托）            | `js-dom-events`（已产出）                                          | 架构/渲染叶只讲浏览器内部事件路由（hit test、coalescing、passive 机理） |
| HTTP 缓存语义（Cache-Control/ETag/304）                | `net-http-basics/connection-range-caching`（已产出）               | 缓存叶只讲浏览器侧落地与命中决策；该页已写死正向引用，本章承接          |
| Cookie/Session 语义（Set-Cookie/属性）                 | `net-http-basics/cookies-sessions`（已产出）                       | 存储叶只讲浏览器侧读写与容量限制                                        |
| SOP/CORS/预检/COOP/COEP/CORP/SameSite                  | `net-cors` 6 页（已产出）                                          | 一句话带过 + 链接，绝不重讲；安全叶站点隔离页只讲进程级防护             |
| TLS/证书/HSTS                                          | `net-https-tls`（已产出）                                          | Secure Contexts/混合内容页引用，不重讲                                  |
| HTTP/2 Server Push 协议机制                            | `net-http-evolution`（已产出）                                     | 缓存叶只讲 push cache 已死史 + 103 Early Hints 继任                     |
| XSS/CSRF 等攻击手法、加密、OAuth/JWT、Helmet、漏洞扫描 | 顶层「安全」章（未产出）                                           | 安全叶只讲**浏览器防护机制**，攻击原理一句话链接                        |
| WebStorage/IndexedDB **完整 API 用法**                 | Web API 章既有占位叶（未产出）                                     | 存储叶只讲存储模型/定位/配额，API 细节留白互链                          |
| 性能指标/审计工具（CWV、Lighthouse）                   | 前端优化章                                                         | 渲染叶只讲原理与代价（reflow 为何贵、帧预算）                           |
| 站点隔离                                               | **拆两面**：进程模型归架构叶；渲染器沙箱/CORB/Spectre 防御归安全叶 | 互链                                                                    |
| Service Worker 完整生命周期 / PWA                      | **全库 gap**，本章不收                                             | 缓存叶只讲 SW 作为缓存层（Cache API/策略）；建议将来在 Web 进阶知识补叶 |

## 每叶结构（沿用网络章范式：9 md = index + getting-started + guide-line/6 + reference）

### 1. 浏览器架构与进程模型（browser-architecture）

覆盖：进程/线程/IPC 基础；多进程架构（browser/renderer/GPU-Viz/network/utility 各进程职责、收益权衡、Servicification）；各进程线程构成；站点隔离进程模型（site=scheme+eTLD+1、OOPIF、内存代价桌面 10-13%）；导航全流程（UI thread→network thread→SafeBrowsing/CORB→renderer 预启动→commit→onload、beforeunload/unload 时序、跨站导航新旧 renderer 并存）。
不覆盖：协议细节（DNS/TCP/TLS 归网络章）、渲染管线（归渲染叶）、沙箱/Spectre 防御深挖（归安全叶）。

guide-line 6 页：

1. `process-thread-ipc` — 进程/线程/IPC、CPU vs GPU 分工
2. `multi-process-model` — 多进程架构：各进程职责、稳定性/安全/内存权衡、Servicification
3. `process-threads-inside` — 各进程内的线程：browser（UI/network/storage）、renderer（main/compositor/raster/worker）、Viz
4. `site-isolation` — 站点隔离：site 定义、进程分配、OOPIF、document.domain、内存代价
5. `navigation-flow` — 一次导航的全流程：从输入 URL 到 commit 到 onload
6. `navigation-handoff` — 导航交接细节：beforeunload/unload、跨站新旧 renderer、SW 与 Navigation Preload 介入

信源：Inside Browser Part1-2、MDN How browsers work、Chromium site-isolation。

### 2. 浏览器渲染原理（browser-rendering）

覆盖：HTML→DOM（tokenization、增量解析、preload scanner、JS 阻塞与 async/defer）；CSS→CSSOM（render-blocking、非增量）；计算样式→render tree；layout/reflow（触发条件、layout thrashing）；paint/栅格化（paint records、绘制顺序、stacking context）；分层合成（layer、will-change 与图层代价）；reflow vs repaint 代价链；主线程 vs 合成器线程；rAF/rIC 帧生命周期与输入路由（hit testing、非快速滚动区、事件合并、passive/touch-action 机理）；**RenderingNG 现代对照**（property trees、LayoutNG 不可变 fragment tree、Viz、CompositeAfterPaint、12 阶段管线、GPU 光栅化默认）。
不覆盖：事件循环任务调度（js-async）、性能指标与工具（前端优化章）、DOM API 用法（js-dom-events）。
时效注意：帧预算表述为「目标=显示器刷新率」（120Hz≈8.3ms），不写死 60fps；经典 5 步 CRP 作主线心智模型，RenderingNG 作现代实现对照并给术语映射。

guide-line 6 页：

1. `dom-construction` — HTML 解析与 DOM 构建：tokenization、preload scanner、JS 阻塞、async/defer
2. `cssom-render-tree` — CSSOM 与 render tree：render-blocking、级联计算、可见性规则
3. `layout-reflow` — 布局与重排：几何计算、触发条件、layout thrashing 与批量读写
4. `paint-compositing` — 绘制与合成：paint records、栅格化、分层、will-change、stacking context
5. `frame-input` — 帧生命周期与输入：主线程 vs 合成器、rAF/rIC、刷新率预算、hit test、passive
6. `renderingng` — 现代架构 RenderingNG：property trees、LayoutNG、Viz、CAP、12 阶段管线与术语映射

信源：Inside Browser Part3-4、MDN CRP + How browsers work、RenderingNG 架构/数据结构两文。

### 3. 浏览器存储（browser-storage）

覆盖：存储全景选型矩阵（Cookie/localStorage/sessionStorage/IndexedDB/Cache API/**OPFS** 的容量、同步异步、生命周期、随请求发送、Worker 可达、适用场景）；Cookie 浏览器侧（document.cookie、~4KB、条数限制、为何不当存储）；Web Storage 存储模型（源隔离 vs 标签页+源、同步阻塞主线程、storage 事件、无痕退化）；IndexedDB 定位（异步事务对象库、结构化克隆）与 OPFS；**Storage API**（navigator.storage 的 estimate/persist、与 Web Storage API 不同物）；配额与驱逐（各浏览器 quota 数值、LRU 跨源驱逐、best-effort vs persistent、Safari ITP 7 天）；存储分区与 Storage Buckets。
不覆盖：API 完整用法（Web API 章占位叶）、Cookie/Session 语义（net-http-basics）、SameSite/CHIPS 深挖（net-cors）。
时效注意：web.dev 立场——首选 IndexedDB/Cache API/OPFS（异步），localStorage 应避免；Chrome 配额 ~60% 磁盘、Firefox 每 eTLD+1 上限、Safari 递增提示。

guide-line 6 页：

1. `storage-overview` — 存储全景与选型矩阵：六种机制横向对比
2. `cookie-browser-side` — Cookie 的浏览器侧：读写、限制、为何不当存储
3. `web-storage-model` — Web Storage 存储模型：隔离、同步代价、跨标签页同步、无痕退化
4. `indexeddb-opfs` — IndexedDB 定位与 OPFS：异步事务对象库、结构化克隆、文件类存储
5. `quota-eviction` — 配额与驱逐：Storage API、estimate/persist、各浏览器数值、Safari 7 天
6. `partitioning-buckets` — 存储分区与 Storage Buckets：第三方隔离、一源多桶

信源：MDN Web Storage/IndexedDB/Storage API/Cache、web.dev storage-for-the-web。

### 4. 浏览器缓存机制（browser-cache）

覆盖：多层缓存总览与命中优先级（SW→memory→disk→网络；push cache 已死作历史）；内存 vs 磁盘缓存（生命周期、决策因素、DevTools Size 栏 `(memory cache)`/`(disk cache)`）；HTTP 缓存浏览器侧落地（强/协商命中流程、地址栏/刷新/强刷差异；语义链 net-http-basics——该页已写死正向引用，本叶承接）；**bfcache 全套**（整页内存快照、pageshow/pagehide+persisted、不可进入条件、NotRestoredReasons、no-store 放宽动向）；SW 缓存与 Cache API（caches、cache-first/network-first、**不遵守 HTTP 缓存头**、算配额、Size 栏 `(ServiceWorker)`）；观测与清除（DevTools Application 面板、Clear-Site-Data、用户清缓存对各层影响）。
不覆盖：HTTP 缓存首部语义（net-http-basics）、HTTP/2 push 协议机制（net-http-evolution）、SW 完整生命周期（全库 gap）、部署缓存策略工程实践（前端优化章）。
时效注意：HTTP/2 Server Push 已从 Chrome 106/Firefox 132 移除——「四级缓存含 push cache」经典图已过时，继任 103 Early Hints。

guide-line 6 页：

1. `cache-layers` — 多层缓存总览：命中优先级、push cache 之死与 Early Hints
2. `memory-disk-cache` — 内存缓存与磁盘缓存：生命周期、决策、DevTools Size 栏
3. `http-cache-landing` — HTTP 缓存的浏览器侧落地：命中流程、刷新行为差异
4. `bfcache` — 往返缓存 bfcache：快照机制、生命周期事件、不可进入条件与诊断
5. `sw-cache-api` — Service Worker 缓存与 Cache API：可编程缓存层、常用策略、与 HTTP 缓存的根本区别
6. `cache-observe-clear` — 观测与清除：DevTools 面板、Clear-Site-Data、各层清除行为

信源：web.dev bfcache/storage-for-the-web、MDN Cache、Chrome removing-push、DevTools 文档。

### 5. 浏览器安全（browser-security）

覆盖：CSP 体系（fetch/document/navigation/reporting 指令、源表达式、nonce/hash、Report-Only、report-uri→report-to 换代）；strict CSP（strict-dynamic、web.dev 推荐取代 allowlist）+ **Trusted Types（2026-02 转正 Baseline Newly available）** + SRI「防注入三件套」；渲染器沙箱与隔离防御（CORB/ORB、Spectre 侧信道；进程模型链架构叶）；iframe sandbox 属性 + 点击劫持防护（**XFO 遗留 → CSP frame-ancestors**）；Secure Contexts（isSecureContext、强能力 API 门控）+ 混合内容（upgradable 自动升级 vs blockable 阻断、upgrade-insecure-requests、IP 主机阻断）；Permissions Policy（头 + iframe allow、report-to）+ **Local Network Access**（原 PNA，local-network/loopback-network 权限）+ Fetch Metadata（Sec-Fetch-\*）+ 安全响应头速查。
不覆盖：SOP/CORS/COOP/COEP/SameSite（net-cors）、TLS/HSTS（net-https-tls）、攻击手法/加密/鉴权/Helmet/扫描（顶层安全章）、Referrer-Policy 深挖（http-headers 已提，速查一句话）。
时效注意：Trusted Types Baseline 2026-02（推翻 Chromium-only 旧认知）；混合内容 passive 自动升级非警告；第三方 Cookie 淘汰 2024-07 反转（一句话，勿展开）。

guide-line 6 页：

1. `csp-basics` — CSP 基础：指令体系、源表达式、nonce/hash、上报
2. `strict-csp-trusted-types` — 防注入三件套：strict CSP、Trusted Types、SRI
3. `sandbox-isolation-defense` — 沙箱与隔离防御：渲染器沙箱、CORB/ORB、Spectre
4. `iframe-sandbox-clickjacking` — iframe sandbox 与点击劫持：sandbox 属性、frame-ancestors
5. `secure-contexts-mixed-content` — 安全上下文与混合内容：isSecureContext、门控、升级与阻断
6. `permissions-policy-fetch-metadata` — 能力与元数据防护：Permissions Policy、Local Network Access、Sec-Fetch-\*

信源：MDN Security/CSP/Mixed Content/Secure Contexts/Permissions-Policy/Trusted Types/Local Network Access、Chromium site-isolation。

## 产出规格（与网络章一致）

- **笔记**：每叶 9 md（index / getting-started / guide-line×6 / reference），除 index 概览页外**每页顶部 `## 速查`**；每页 `> 基于 X · 核于 2026-07`；mustache 一律 `<code v-pre>`；0 死链。章 index.md 更新本章地图。
- **幻灯片**：每叶 1 包 `packages/browser-{slug}-slide`（Slidev 锁 52.15.2），build 后 `node scripts/check-slidev-overflow.mjs` **0 溢出**。
- **题库**：每叶 70 题（入门 10/初级 18/中级 24/高级 12/专家 6），`categories: [["技术方向", 叶名], ["难度", X]]` 叶名逐字一致；每题 stem 含技术名前缀；全角引号；写完 node 自检 JSON。
- **入库**：`import:content:prod`（唯一目标，执行前经用户确认）；入库时手动补 prod 3 条 sort UPDATE（id=31→2、id=32→4、id=33→5）。
- **部署**：笔记走 IllegalCreedWebsite deploy.sh（rsync 前核 `du -sm dist ≥1GB` + deleting 总数）；幻灯片走 SlideStack。

## 交付顺序

架构与进程模型 → 渲染原理 → 存储 → 缓存机制 → 安全（依 sidebar 序；每叶笔记→幻灯片→题库三件齐后 commit，全章完成后统一部署 + 入库）。
