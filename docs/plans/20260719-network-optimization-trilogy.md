# 前端「网络优化」章三件套生产计划（5 叶）

> 状态：产出完成，门禁全绿，待提交+确认生产。开批 2026-07-19。
> 前置：prod 核查「网络优化」单叶 id=159，**0 题 0 子**，拆叶零风险。

## 范围（5 叶，选型评估后定）

| #   | 叶                  | slug                 | 题数 |
| --- | ------------------- | -------------------- | ---- |
| 1   | CDN                 | cdn                  | 20   |
| 2   | HTTP 缓存           | http-cache           | 20   |
| 3   | 压缩                | compression          | 20   |
| 4   | HTTP/2·HTTP/3       | http2-http3          | 20   |
| 5   | Service Worker 缓存 | service-worker-cache | 20   |

> 合计 **100 题** / 20 页笔记 / 75 页幻灯片（0 溢出）。
> categories.ts 已拆叶（单叶 id159 → 组+5 叶）。
> 门禁：audit 0 errors（426/497 叶）+ 100 题 0 异常 + 0 崩点 + 0 溢出。
> 边界界定：preload/prefetch 构建器魔法注释归代码分割叶；浏览器缓存机制原理归浏览器基础章。

## 生产流程（删 159 + import 建新树）

**生产完成（2026-07-19）**：prod 删孤儿 159（0题0子）→ import 建新分类树（网络优化组 681 / CDN 682 / HTTP 缓存 683 / 压缩 684 / HTTP/2·HTTP/3 685 / Service Worker 缓存 686）+ 灌 100 题 → 回填 5 页 index.md + sidebar 占位→5 叶 link → **VitePress build 一次**（1145s）→ 提交推送（9fc1ce3）→ rsync 部署笔记（0 误删 SlideStack）+ 5 幻灯片 → **全 15 路 HTTP 200 上线**（5 笔记 + 5 幻灯片 + 5 测试题）。栈方法实测 sidebar：网络优化 L2 → 5 叶 L3，层级正确。
