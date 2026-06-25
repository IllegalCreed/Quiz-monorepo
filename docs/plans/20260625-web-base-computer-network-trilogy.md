# Web 基础知识 ·「计算机网络基础」章节 — 内容生产 spec

> **性质**：`Web基础知识 > 计算机网络基础` 章节**重构 + 扩展**，**全套三件套**（VitePress 笔记 + Slidev 幻灯片 + Quiz 题库）。现有 5 叶（网络模型 / 网络协议 / 网络设备）结构倒挂——重学术分层、轻前端高频核心（传输层缺失、HTTP 压成 1/4 叶、跨域无处安放），本轮重构为**扁平 11 叶**，每叶 = 一套完整三件套。
> **落点**：笔记 `IllegalCreedWebsite/src/zh/base/network/`；幻灯片 `SlideStack/packages/{leaf-slug}-slide/`；题库 `apps/quiz-backend/prisma/content/{leaf-slug}.json`；分类 `apps/quiz-backend/prisma/content/categories.ts` 的 `计算机网络基础` 节点。
> **规模**：11 叶（介于「前端测试」19 叶与单工具叶之间的中型章），预计 4~6 个工作会话产出。
> **定位**：**较完整网络体系**——以前端高频实用核心（HTTP/HTTPS/TCP/DNS/跨域）为重心，同时保留并充实底层（链路层/网络层/路由）、传输层、接入与移动网络等科班内容。与「Web基础知识 = 给前端工程师打底」的章节定位一致。
> **状态**：2026-06-25 brainstorming 完成，用户逐项拍板（① 定位 = 较完整网络体系 ② OSI/TCP-IP 合并 1 叶 ③ HTTP 拆「协议基础」+「演进与性能」2 叶 ④ 保留「实时通信协议」+「接入与移动网络」两个边界叶 ⑤ 扁平 11 叶、不设分组父节点）。叶子集合基于 categories.ts 现状核查（全章 0 题、相邻章亦 0 题）+ 网络知识标准体系产出。待用户审 spec → 落结构 → 逐叶产出。

---

## 一、核心决策（已拍板）

1. **定位 = 较完整网络体系**。前端高频核心为重心，但不砍底层/传输层/移动网络。理由：本题库全站前端生态，「Web基础知识」是给前端打底；用户明确选择保留科班完整度（OSI 七层、网络设备、4G/5G 等）。
2. **现状结构倒挂，必须重构**。旧 5 叶的硬伤：① 传输层 TCP/UDP **整个缺失**（协议下只有「网络层及以下」和「应用层」，跳过传输层）；② HTTP/HTTPS/WebSocket/SSL-TLS 全挤「应用层」一叶，违反「一叶 = 一聚焦主题」范式；③ DNS 错挂在「网络层及以下」（DNS 是应用层协议）；④ 跨域与同源策略（前端面试必考）无处安放；⑤「网络设备」四物塞一叶、对前端价值低。
3. **prod 已有 7 旧节点（全 0 题），重构须清理**。原以为「全章 0 题 = 零成本」，但 2026-06-25 核查 prod 推翻：`importCategories()` 导入**任何**章节都会递归建全树，故旧 7 节点早已建到 prod——`计算机网络基础`(id=22) 下挂 网络模型(23)/OSI(24)/TCP-IP(25)/网络协议(26)/网络层及以下(27)/应用层(28)/网络设备(29)。好在**全部 0 题**。`import-content.ts` 按 key=`groupId:parentId:name` 只增不删，故改名/移动会留旧节点 = **分类移动坑**，落地必须手动 DELETE id 23-29（根节点 id=22 同名复用、保留）。
4. **OSI/TCP-IP 合并 1 叶**（对照讲更清楚，七层职责一叶能讲透）；**HTTP 拆 2 叶**（HTTP 是前端最核心网络知识，一叶装不下）。
5. **两个边界叶都设**：「实时通信协议」（讲协议/网络原理，与 Web API 章的 API 用法分工）+「接入与移动网络」（讲 CDN/移动网络原理，与性能章的优化实践分工）。
6. **扁平 11 叶**，不设 A/B/C/D 分组父节点，用 sort 1~11 按「模型→底层→传输→应用→接入」排序。与「三大语言」HTML/CSS 子叶同构。
7. **叶子名组内唯一**。`import-content.ts` 按 `categoryIndex[groupName][leafName]` 定位，叶子名须在「技术方向」组内唯一。本章 11 名自带网络语义（HTTP/TCP/DNS/CORS 等），已天然唯一，无需额外前缀；同时满足「每道 stem 含技术名前缀」规范。
8. **slug 统一 `net-*` 前缀**，三处（笔记目录 / 幻灯片包 / 题库 JSON）一致。

---

## 二、完整叶子清单（11 叶 · 可直接开做粒度）

> 每叶给出：sort / slug / 范围（覆盖·不覆盖）/ 6 个 guide-line 深度页主题 / 关键权威源。
> 排序逻辑：自底向上的协议栈（模型 → 链路 → 网络 → 传输 → 应用各协议 → 接入层）。

### #1 ·「网络分层模型」 sort 1 · slug `net-layering`

- **范围**：分层的意义（封装·解耦·标准化）/ OSI 七层（物理·数据链路·网络·传输·会话·表示·应用，逐层职责）/ TCP-IP 四层 / 五层教学模型 / 数据封装与解封装全过程（段·包·帧·比特）/ PDU 在各层的名称 / 两模型对照与协议归层 / 一个请求穿越协议栈的端到端旅程。**不覆盖**：各层具体协议细节（→ 后续各叶）。
- **深度页**：① 为什么要分层（封装·解耦·标准化）② OSI 七层逐层职责 ③ TCP/IP 四层与五层教学模型 ④ 数据封装与解封装全过程 ⑤ 两模型对照与协议归层 ⑥ 一个 HTTP 请求穿越协议栈的端到端旅程
- **源**：Kurose《自顶向下》ch1；RFC 1122（Host Requirements）；Cloudflare Learning（OSI model）；MDN（Web 协议分层）

### #2 ·「链路层与局域网」 sort 2 · slug `net-link-lan`

- **范围**：数据链路层职责 / 以太网帧结构 / MAC 地址 / 交换机工作原理（MAC 地址表·转发·自学习）/ 冲突域与广播域 / VLAN 与局域网隔离 / ARP（地址解析·缓存·ARP 欺骗）/ 局域网拓扑 / Wi-Fi（802.11·SSID·信道·频段）/ 以太网 vs Wi-Fi。**不覆盖**：IP 层寻址与路由（→#3）、蜂窝移动网（→#11）。
- **深度页**：① 数据链路层与 MAC 寻址 ② 以太网帧结构 ③ 交换机工作原理（MAC 表·冲突/广播域）④ VLAN 与局域网隔离 ⑤ ARP 协议与 ARP 欺骗 ⑥ Wi-Fi / 802.11 无线局域网
- **源**：Kurose ch6；RFC 826（ARP）；IEEE 802.3 / 802.11；Cloudflare（what is a network switch）

### #3 ·「网络层与路由」 sort 3 · slug `net-ip-routing`

- **范围**：IP 协议职责 / IPv4 地址与分类 / 子网掩码与 CIDR / 私有地址与公网地址 / IPv6（地址格式·优势·过渡技术）/ 路由原理与路由表 / 路由器工作 / 默认网关 / ICMP（ping·traceroute·差错报文）/ NAT（SNAT·DNAT·端口映射）/ DHCP 简介。**不覆盖**：BGP/OSPF 路由算法深度（仅带过）、传输层（→#4）。
- **深度页**：① IP 协议与 IPv4 寻址 ② 子网掩码与 CIDR 划分 ③ IPv6 与过渡技术 ④ 路由原理与路由器/网关 ⑤ ICMP 与 ping/traceroute ⑥ NAT 与 DHCP
- **源**：Kurose ch4；RFC 791（IPv4）/ 8200（IPv6）/ 792（ICMP）；Cloudflare（what is routing / NAT）

### #4 ·「传输层 TCP 与 UDP」 sort 4 · slug `net-transport`

- **范围**：传输层职责（端口·复用与分用）/ UDP（无连接·报文·适用场景）/ TCP（面向连接·字节流·可靠）/ 三次握手与四次挥手 / TCP 状态机（TIME_WAIT 等）/ 可靠传输（序列号·确认·超时重传）/ 流量控制（滑动窗口）/ 拥塞控制（慢启动·拥塞避免·快重传·快恢复）/ TCP vs UDP 选型 / TCP 层队头阻塞 / QUIC 如何绕开（引子）。**不覆盖**：QUIC over HTTP/3 应用细节（→#7）。
- **深度页**：① 传输层与端口·复用分用 ② UDP 协议与适用场景 ③ TCP 三次握手与四次挥手 ④ TCP 可靠传输（序列号·确认·重传）⑤ 流量控制与拥塞控制 ⑥ TCP vs UDP 选型与队头阻塞（QUIC 引子）
- **源**：Kurose ch3；RFC 9293（TCP）/ 768（UDP）；High Performance Browser Networking（hpbn.co）ch2；Cloudflare（TCP/IP）

### #5 ·「DNS 域名系统」 sort 5 · slug `net-dns`

- **范围**：DNS 作用 / 域名层级（根·TLD·权威域名服务器）/ 解析流程（递归 vs 迭代查询）/ 常见记录类型（A·AAAA·CNAME·MX·TXT·NS·SOA）/ DNS 缓存（浏览器·OS·本地 resolver·TTL）/ 本地 hosts / DNS 报文与端口（UDP/TCP 53）/ 前端 DNS 优化（dns-prefetch·preconnect）/ DNS over HTTPS / DNS over TLS / 智能 DNS 与 CDN 调度简介。**不覆盖**：CDN 网络原理深度（→#11）。
- **深度页**：① DNS 作用与域名层级体系 ② 解析流程：递归与迭代查询 ③ 常见记录类型 ④ DNS 缓存与 TTL ⑤ 前端 DNS 优化（dns-prefetch / preconnect）⑥ DoH / DoT 与 DNS 安全
- **源**：RFC 1034 / 1035；MDN（DNS · rel=dns-prefetch）；Cloudflare（what is DNS）；web.dev（preconnect and dns-prefetch）

### #6 ·「HTTP 协议基础」 sort 6 · slug `net-http-basics`

- **范围**：HTTP 特点（应用层·无状态·明文·请求-响应）/ 请求与响应报文结构 / 请求方法（GET·POST·PUT·DELETE·PATCH·HEAD·OPTIONS）/ 状态码全谱（1xx~5xx）/ 常用首部（通用·请求·响应·实体）/ 内容协商（Accept·Content-Type·语言·编码）/ Cookie 与 Session / 持久连接（Connection: keep-alive）/ 缓存首部**语义**（Cache-Control·ETag·Last-Modified）/ 范围请求（Range）/ 重定向。**不覆盖**：HTTP/2·3（→#7）、HTTPS/TLS（→#8）、浏览器缓存**决策流程与存储**（→「浏览器基础 > 浏览器缓存机制」）。
- **深度页**：① HTTP 报文结构与请求方法 ② 状态码全谱 ③ HTTP 首部精要 ④ 内容协商 ⑤ Cookie 与会话管理 ⑥ 持久连接·范围请求·缓存首部语义
- **源**：RFC 9110（HTTP Semantics）/ 9111（Caching）；MDN HTTP；web.dev（Network reliability）

### #7 ·「HTTP 演进与性能」 sort 7 · slug `net-http-evolution`

- **范围**：HTTP/0.9→1.0→1.1 演进 / HTTP/1.1 局限（应用层队头阻塞·并发连接数·头部冗余）/ HTTP/2（二进制分帧·多路复用·头部压缩 HPACK·服务器推送及其废弃·流优先级）/ HTTP/3（基于 QUIC·走 UDP·0-RTT·连接迁移·彻底解决队头阻塞）/ 各版本对比 / 前端性能影响（域名分片为何过时·打包合并的权衡）/ caniuse 支持现状。**不覆盖**：TCP 拥塞控制细节（→#4）、TLS 握手（→#8）。
- **深度页**：① HTTP 版本演进史 ② HTTP/1.1 瓶颈与队头阻塞 ③ HTTP/2 二进制分帧与多路复用 ④ HPACK 头部压缩与服务器推送（及废弃）⑤ HTTP/3 与 QUIC ⑥ 版本对比与前端性能实践
- **源**：RFC 9113（HTTP/2）/ 9114（HTTP/3）/ 9000（QUIC）；hpbn.co；web.dev（HTTP/2 · HTTP/3）；caniuse

### #8 ·「HTTPS 与传输安全」 sort 8 · slug `net-https-tls`

- **范围**：HTTPS = HTTP + TLS / 三大安全目标（机密性·完整性·身份认证）/ 对称加密 vs 非对称加密 / 数字摘要与数字签名 / 数字证书与 CA 信任链 / TLS 握手流程（1.2 vs 1.3·会话密钥协商·1-RTT/0-RTT）/ 中间人攻击与防护 / HSTS / 证书类型（DV/OV/EV·通配符·SAN）/ Let's Encrypt 与自动化 / 混合内容（mixed content）。**不覆盖**：XSS/CSRF/CSP 攻防（→「浏览器基础 > 浏览器安全」，可交叉引用）。
- **深度页**：① 为什么需要 HTTPS（三大安全目标）② 对称与非对称加密 ③ 数字证书与 CA 信任链 ④ TLS 握手流程（1.2/1.3 对比）⑤ 中间人攻击与 HSTS ⑥ 证书实务（类型·Let's Encrypt·混合内容）
- **源**：RFC 8446（TLS 1.3）；MDN（TLS · HTTPS · HSTS · mixed content）；Cloudflare（how TLS works）

### #9 ·「跨域与同源策略」 sort 9 · slug `net-cors`

- **范围**：同源策略（「源」的定义·限制范围·为什么需要）/ 跨域常见场景与报错 / CORS（简单请求 vs 预检请求·OPTIONS·`Access-Control-*` 首部全谱·凭证 withCredentials）/ JSONP（原理·局限）/ 反向代理跨域 / `postMessage` 跨窗口通信 / Cookie 的 SameSite / CORP·COEP·COOP 简介。**不覆盖**：CSRF 攻防（→「浏览器安全」，交叉引用）、各服务端框架 CORS 配置细节。
- **深度页**：① 同源策略与「源」的定义 ② 跨域常见场景与报错排查 ③ CORS 简单请求与预检请求 ④ CORS 凭证与 `Access-Control-*` 首部全谱 ⑤ JSONP 与反向代理方案 ⑥ Cookie SameSite 与 COOP/COEP/CORP
- **源**：MDN（Same-origin policy · CORS · SameSite cookies）；Fetch 标准（fetch.spec.whatwg.org）；web.dev（cross-origin resource sharing）

### #10 ·「实时通信协议」 sort 10 · slug `net-realtime`

- **范围**：实时通信需求 / 短轮询 vs 长轮询 / SSE（EventSource·基于 HTTP·单向·自动重连·适用场景）/ WebSocket（协议握手 Upgrade·帧格式·心跳保活·与 HTTP 的关系·wss）/ WebRTC **网络原理**（P2P·信令·ICE·STUN·TURN·NAT 穿透·SDP）/ 三者对比与选型。**不覆盖**：浏览器 **API 用法**细节（→「Web进阶 > Web API」的 WebSocket/SSE/WebRTC 叶）、媒体编解码。
- **深度页**：① 实时通信方案演进（轮询 → 长轮询）② SSE 服务器推送 ③ WebSocket 协议握手与帧格式 ④ WebSocket 心跳·重连·工程实践 ⑤ WebRTC 与 NAT 穿透（ICE/STUN/TURN）⑥ 实时方案对比与选型
- **源**：RFC 6455（WebSocket）；HTML 标准（Server-sent events）；MDN（WebSockets · SSE · WebRTC）；webrtcforthecurious.com

### #11 ·「接入与移动网络」 sort 11 · slug `net-access-mobile`

- **范围**：接入网概念 / LAN·WAN·MAN / 宽带接入（光纤·PON·FTTH）/ 蜂窝移动网络（2G→3G→4G→5G 演进·基站·核心网简介）/ 移动网络对前端的影响（弱网·高延迟·抖动·流量成本）/ CDN **网络原理**（边缘节点·Anycast·回源·缓存命中·就近调度）/ 网络性能指标（带宽·延迟·RTT·丢包·抖动）/ 弱网优化策略。**不覆盖**：CDN **工程优化实践**（→「性能优化 > 网络优化」）、具体运营商技术。
- **深度页**：① 接入网与 LAN/WAN/MAN ② 宽带接入技术（光纤/PON）③ 蜂窝移动网络 2G→5G ④ 移动弱网对前端的挑战 ⑤ CDN 网络原理（边缘·Anycast·回源）⑥ 网络性能指标与弱网优化
- **源**：Kurose ch1；Cloudflare（what is a CDN · Anycast · what is 5G）；hpbn.co（mobile networks, ch7-8）；web.dev（adaptive loading）

---

## 三、与相邻章节的分工边界（写进各叶「不覆盖」+ 笔记交叉引用）

> 相邻章对应叶**当前全部 0 题未产出**，边界可自由划定；写清分工防日后两处重复。

| 主题      | 本章讲（计算机网络基础）                       | 相邻章讲                                                      |
| --------- | ---------------------------------------------- | ------------------------------------------------------------- |
| 实时通信  | #10 协议/网络原理（握手帧·NAT 穿透·STUN/TURN） | `Web进阶 > Web API`：WebSocket/SSE/WebRTC **浏览器 API 用法** |
| HTTP 缓存 | #6 `Cache-Control`/`ETag` **头语义**           | `浏览器基础 > 浏览器缓存机制`：**浏览器缓存决策流程与存储**   |
| 跨域/安全 | #9 **跨域网络机制**（CORS 预检·代理·SameSite） | `浏览器基础 > 浏览器安全`：**XSS/CSRF/CSP 攻防**              |
| CDN       | #11 **CDN 网络原理**（边缘·Anycast·回源）      | `性能优化 > 网络优化`：**用 CDN 做优化的工程实践**            |

---

## 四、现有 5 叶 → 11 叶 重构映射

| 旧结构（categories.ts:106-135）                   | 去向                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| 网络模型 / OSI 模型                               | 合并入 **#1 网络分层模型**                                              |
| 网络模型 / TCP-IP 模型                            | 合并入 **#1 网络分层模型**                                              |
| 网络协议 / 网络层及以下（ICMP/ARP/DNS）           | ICMP→#3、ARP→#2、DNS→**#5**（修正错位）                                 |
| 网络协议 / 应用层（HTTP/HTTPS/WebSocket/SSL-TLS） | 炸开为 **#6 #7 #8 #10**                                                 |
| 网络设备（路由器/交换机/网关/移动网络）           | 交换机→#2、路由器/网关→#3、移动网络→**#11**                             |
| **（全新补齐）**                                  | **#4 传输层 TCP 与 UDP**（最大空白）、**#9 跨域与同源策略**（前端高频） |

---

## 五、落地步骤

1. **前置检查（已完成 2026-06-25）**：连 prod 只读核查——`计算机网络基础`(id=22) 下有旧 7 节点 id 23-29，**全部 0 题**。落地须 DELETE 这 7 节点（保留 id=22 根节点复用），删除顺序先子叶（24/25/27/28）后父（23/26/29），避免外键约束。**此为 prod 写操作，执行前经用户确认。**
2. **锁结构（M0）**：改 `categories.ts` 的 `计算机网络基础` 节点 → 扁平 11 叶（sort 1~11）；同步 IllegalCreedWebsite sidebar（未产出叶用 `text` 占位，不建占位页，遵循 sidebar 占位约定）。
3. **逐叶产出三件套**：建议顺序按前端价值优先——先 **#6 HTTP 协议基础 → #7 HTTP 演进 → #8 HTTPS → #9 跨域 → #5 DNS → #4 传输层**（前端高频先做），再 **#1 模型 → #3 网络层 → #2 链路层 → #10 实时通信 → #11 接入移动**（底层/边界后做）。每叶 = VitePress 笔记（含 `## 速查`）+ Slidev 幻灯片（0 溢出）+ Quiz 题库（每题 stem 含技术名前缀、categories 叶名与 categories.ts 完全一致）。
4. **题库入库**：写好 JSON → 经用户确认 → `import:content:prod` 增量更新（只增不删·幂等）。
5. **门禁**：笔记速查表强制 + context7/网页双重校验；幻灯片 `check-slidev-overflow.mjs` 0 溢出；题库全角引号自检。

---

## 六、命名与约束速查

- **叶子名**（组内唯一，无需前缀）：网络分层模型 / 链路层与局域网 / 网络层与路由 / 传输层 TCP 与 UDP / DNS 域名系统 / HTTP 协议基础 / HTTP 演进与性能 / HTTPS 与传输安全 / 跨域与同源策略 / 实时通信协议 / 接入与移动网络
- **slug**：`net-layering` / `net-link-lan` / `net-ip-routing` / `net-transport` / `net-dns` / `net-http-basics` / `net-http-evolution` / `net-https-tls` / `net-cors` / `net-realtime` / `net-access-mobile`
- **三处统一**：笔记目录 `src/zh/base/network/{slug}/`、幻灯片包 `packages/{slug}-slide/`、题库 `content/{slug}.json`
