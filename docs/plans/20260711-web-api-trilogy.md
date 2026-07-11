# Web API 章三件套生产计划

> **状态**：2026-07-11 选型调研定案，用户拍板 ① 17 叶 = 保留 9 旧 + 新增 8 ② 扁平结构只追加、不分组（避免 prod 分类移动坑）③ 按 sort 顺序分批产出（每批 2-3 叶）。
> **章节**：Web进阶知识 > Web API（categories.ts「技术方向」组，sidebar `/zh/web-advanced/web-api/`）
> **范式**：照 [content-trilogy-production-spec] 三件套门禁；调研遵循 CLAUDE.md「内容审查规范」。

---

## 一、定位与边界（与相邻章节的既定分工）

本章统一负责**浏览器 API 的编程用法**。相邻章节的分工在各自 spec 中早已锁定，产出时严守、只链接不重复：

| 主题      | 其他章节负责（已产出）                                                             | 本章负责                                                                              |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 实时通信  | 网络章 `net-realtime`：协议原理（WS 握手帧/心跳重连工程/SSE 推送/WebRTC NAT 穿透） | WebSocket/SSE/WebRTC 的**浏览器 API 用法**                                            |
| 存储      | 浏览器章 `browser-storage`：存储模型/选型矩阵/配额驱逐/分区/OPFS 定位              | WebStorage/IndexedDB/File System Access 的 **API 用法**（categories.ts 注释原文预留） |
| SW 缓存   | 浏览器章 `browser-cache`：Service Worker 缓存决策与 Cache API 一页                 | SW **生命周期/更新模型/离线/Push/PWA**                                                |
| 图形/动画 | 可视化章（已收官）：Canvas/SVG/WebGL/WebGPU/WAAPI                                  | 不碰                                                                                  |
| 加密      | 安全章「加密」叶（占位规划）：Web Crypto API                                       | 不碰                                                                                  |
| 性能测量  | 优化章「性能评估」（占位规划）：Performance API                                    | PerformanceObserver 仅在 Observer 叶概览带过                                          |

## 二、叶子集合（17 叶，扁平，sort 1-17）

旧 9 叶（sort 1-9，prod 已建 0 题节点，名称不动）+ 新 8 叶（sort 10-17，import 纯追加，无移动坑）。

| sort | 叶名（= 题库 categories 叶名） | slug（笔记目录 / `<slug>-slide` / `<slug>.json`） | 范围要点                                                                                                                                                              | 关键版本/生态事实（2026-07 调研）                                                             |
| ---- | ------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1    | Web Components                 | web-components                                    | Custom Elements / Shadow DOM / template & slot / 与框架互操作 / Declarative Shadow DOM                                                                                | DSD 已 Baseline；Lit 生态在框架章有独立叶（lit-slide），只对比不展开                          |
| 2    | Web Assembly                   | webassembly                                       | 模块/内存模型/JS 互操作/加载编译 API/wasm-bindgen 与 Emscripten 生态/适用边界                                                                                         | 2026 Baseline 新增 Branch hinting；WASM GC 已入主流引擎                                       |
| 3    | WebRTC API                     | webrtc                                            | getUserMedia/RTCPeerConnection/DataChannel/信令流程 API 侧/perfect negotiation                                                                                        | 协议层（ICE/STUN/TURN/SDP）在网络章，本叶只讲 API 编排                                        |
| 4    | Server-Sent Events             | sse                                               | EventSource API/自动重连与 retry/事件流格式/与 fetch 流式对比/认证局限                                                                                                | 协议层在网络章；AI 场景常用 fetch+ReadableStream 替代 EventSource（链接 Streams 叶）          |
| 5    | Fetch API                      | fetch                                             | Request/Response/Headers/AbortController/超时与重试/缓存与凭据模式/keepalive/与 XHR 对比                                                                              | AbortSignal.any()/timeout() 已 Baseline                                                       |
| 6    | WebSocket                      | websocket                                         | WebSocket 构造/readyState/二进制 binaryType/bufferedAmount 背压/子协议协商 API/关闭码处理                                                                             | 协议层+心跳重连工程在网络章，本叶 API 侧；WebTransport（2026 Baseline）作对比展望带过，不立叶 |
| 7    | Web Storage API                | web-storage                                       | localStorage/sessionStorage API/storage 事件跨页/序列化坑/同步阻塞特性/容量与异常处理                                                                                 | 存储模型/分区/配额在浏览器章                                                                  |
| 8    | IndexedDB                      | indexeddb                                         | 数据库/对象仓库/事务/索引/游标 API/版本升级/Promise 包装（idb）/Dexie 生态                                                                                            | 定位与 OPFS 对比在浏览器章                                                                    |
| 9    | Web Workers API                | web-workers                                       | Dedicated/Shared Worker/postMessage/结构化克隆/Transferable/module worker/Comlink                                                                                     | JS modules in shared workers 2026 进 Baseline                                                 |
| 10   | Service Worker 与 PWA          | service-worker-pwa                                | 注册与作用域/install-activate 生命周期/更新模型（skipWaiting/clients.claim）/fetch 拦截策略/Background Sync/Push 通知/manifest 与安装                                 | JS modules in service workers 2026 进 Baseline；缓存策略细节链接浏览器章 sw-cache-api 页      |
| 11   | Streams API                    | streams                                           | ReadableStream/WritableStream/TransformStream/背压与排队策略/pipeTo·pipeThrough/与 fetch 结合流式处理/Compression Streams                                             | Readable byte streams 2026 进 Baseline；AI 流式渲染底层                                       |
| 12   | Observer 观察器 API            | observers                                         | IntersectionObserver（懒加载/无限滚动/曝光埋点）/ResizeObserver/MutationObserver/各自回调时机与性能，PerformanceObserver 概览                                         | IO v2（trackVisibility）Chrome 系；手写懒加载面试高频                                         |
| 13   | History 与 Navigation API      | history-navigation                                | history.pushState/replaceState/popstate/hash vs history 路由原理/scrollRestoration/Navigation API（navigate 事件拦截/NavigationEntry/与 History 对比迁移）            | Navigation API 2026 年初进 Baseline（web.dev/blog/baseline-navigation-api）                   |
| 14   | View Transitions API           | view-transitions                                  | document.startViewTransition/view-transition-name/伪元素树定制/same-document SPA 实践/cross-document MPA/与框架集成                                                   | same-document 2025-10 进 Baseline（Firefox 144 补齐）；cross-document 仍 Chrome 系            |
| 15   | File 与文件系统 API            | file-system                                       | File/Blob/FileReader/URL.createObjectURL/showOpenFilePicker 等 File System Access/OPFS API 用法/拖放文件/大文件分片                                                   | FS Access 完整版仍 Chromium 系、OPFS 已跨浏览器；OPFS 定位在浏览器章                          |
| 16   | 跨上下文通信                   | cross-context-messaging                           | window.postMessage（iframe/window.open 与 origin 校验）/MessageChannel·MessagePort/BroadcastChannel/多标签页通信方案对比（含 storage 事件/SW 转发/SharedWorker 引用） | 多标签页通信是面试高频场景题；安全校验 origin 必讲                                            |
| 17   | 常用杂项 API                   | misc-apis                                         | Clipboard API（复制粘贴/权限）/Notification/Geolocation/Page Visibility/Screen Wake Lock/Web Share/URLPattern/Battery 等速览式合集                                    | URLPattern 2025 进 Baseline；仿「常用工具库」合集叶先例，每 API 讲透场景不凑数                |

**叶名唯一性**：已 grep categories.ts 全文核验，17 名在「技术方向」组内唯一；slug 已核验 SlideStack 包名与笔记目录无冲突。

## 三、排除项（调研裁定，扩章再议）

- **WebTransport**：2026 进 Baseline 但面试罕见、生态未起量，WebSocket 叶对比带过。
- **Web Audio / Web MIDI / Web Speech / WebCodecs**：媒体处理面试罕见，观察池。
- **Web Bluetooth / USB / Serial / HID / NFC**：硬件类 Chromium 专属，面试罕见。
- **Payment Request / Credential Management (WebAuthn)**：WebAuthn/Passkey 属安全章「认证与授权」语义（该组现有 OAuth/JWT/SAML，扩章时在安全章加，不入本章）。
- **Trusted Types / Reporting API / CSP**（2026 Baseline）：安全章语义。
- **Popover API / dialog**：HTML 语义层，三大语言章 HTML 叶语义（已产出，不回补）。

## 四、三件套门禁（照既有规范，逐叶强制）

- **笔记**：`/zh/web-advanced/web-api/<slug>/`，index 概览（一句话定义+评价+三件套链接）+ getting-started + guide-line 深度页 + reference；**每内容页标题+版本行后紧跟 `## 速查`**；mustache 用 `<code v-pre>`；裸角括号（`Promise<T>` 等）用反引号包裹。
- **幻灯片**：`packages/<slug>-slide`，build 后 `node scripts/check-slidev-overflow.mjs <slug>-slide` **0 溢出**；对齐 M1 样板质量（typescript/json/threejs-slide：教学叙事/分步代码/交互演示/讲者备注），不做纯列表页堆砌。
- **题库**：`content/<slug>.json`，每题 stem 含技术名前缀；categories 叶名与 categories.ts 完全一致；中文全角引号；写完跑 node 自检 + vq.mjs 门禁；重质不限量。
- **入库**：只 `import:content:prod`（幂等增量），执行前必经用户确认；dev/test 禁灌。
- **部署**：三路独立——笔记 rsync（`--exclude 'SlideStack'` + dry-run）/幻灯片逐包 rsync/题库 import，prod 推送前逐批确认。

## 五、批次顺序（按 sort，每批 2-3 叶）

| 批  | 叶                                              | 说明                       |
| --- | ----------------------------------------------- | -------------------------- |
| 1   | Web Components、Web Assembly                    | 组件与运行时扩展           |
| 2   | WebRTC API、Server-Sent Events、Fetch API       | 通信 API 上                |
| 3   | WebSocket、Web Storage API、IndexedDB           | 通信 API 下 + 存储 API     |
| 4   | Web Workers API、Service Worker 与 PWA          | 线程与后台                 |
| 5   | Streams API、Observer 观察器 API                | 流与观察器                 |
| 6   | History 与 Navigation API、View Transitions API | 导航与过渡                 |
| 7   | File 与文件系统 API、跨上下文通信、常用杂项 API | 文件 + 通信场景 + 合集收尾 |

每批流程：逐叶官方文档调研（WebFetch 首页→逐页 + context7 补充 + 本地验证）→ 三件套 → 门禁 → 双仓/三仓 commit → 用户确认后部署。**subagent 并行 ≤3 路**（额度节流惯例）。

## 六、prod 注意事项

- 旧 9 叶 prod 已建 0 题节点且**名称/父子关系全不动**，新 8 叶 import 纯追加——**本批无分类移动坑**，无需清孤儿。
- sidebar 新叶全部 text 占位，**逐叶产出并验证后才 text→link**（防「建设中」空页上线）。
