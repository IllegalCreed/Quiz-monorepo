# 前端「代码优化」章三件套生产计划（2 叶）

> 状态：调研完成（workflow 2 主题并行，结论存 journal），待改 categories.ts + 产出。开批 2026-07-19。
> 前置：prod 核查「代码优化」单叶 id=158，**0 题 0 子**，拆叶零风险。

## 本批范围（2 技术叶）

「前端优化 > 代码优化」：原 categories.ts 单叶 → 拆成组 + 2 叶（与 sidebar 已有占位对齐）。

| #   | 叶名         | slug             | 核心源                                                                                     | 边界（vs 异步组件章）                                                                         |
| --- | ------------ | ---------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1   | 代码分割     | `code-splitting` | MDN 动态 import() / Vue Router 懒加载 / Webpack splitChunks / Vite8 Rolldown codeSplitting | 讲分割**策略与构建配置/chunk 治理**；组件级 lazy API（defineAsyncComponent/lazy）归异步组件章 |
| 2   | Tree Shaking | `tree-shaking`   | Webpack usedExports/sideEffects/innerGraph / Rollup / ESM 前提 / purgeCSS / #**PURE**      | 讲构建期**死代码消除**；与代码分割正交（shaking 治"下了没用"，分割治"下太多"）                |

> 调研结论（每叶源/API/实践/反模式/题点 12-13）：journal `subagents/workflows/wf_fd2857cb-f91/journal.jsonl`。
> 关键版本：Vite 8（2026-03）Rolldown 默认打包器，manualChunks→codeSplitting.groups 迁移；React Router v7.5 对象式 route.lazy。

## categories.ts 改动（单叶 → 组+2叶）

原（categories.ts:681）：`{ name: "代码优化（代码分割 / Tree Shaking）", sort: 3 },`
改为：

```ts
{
  name: "代码优化",
  sort: 3,
  children: [
    { name: "代码分割", sort: 1 },
    { name: "Tree Shaking", sort: 2 },
  ],
},
```

入库流程：旧单叶 id=158（0题0子）→ 改 categories.ts → 连 prod 删 158（校验 0题0子，Number() 比较 BigInt）→ import 建新结构 → 回填。

## 文件映射

| #   | slug             | 幻灯片包               | 题库 JSON             | 叶名         |
| --- | ---------------- | ---------------------- | --------------------- | ------------ |
| 1   | `code-splitting` | `code-splitting-slide` | `code-splitting.json` | 代码分割     |
| 2   | `tree-shaking`   | `tree-shaking-slide`   | `tree-shaking.json`   | Tree Shaking |

## 逐叶状态

| 叶             | VitePress | Slidev（页/溢出） | Quiz  | 状态 |
| -------------- | --------- | ----------------- | ----- | ---- |
| 1 代码分割     | ✅ 4页    | ✅ 16页/0         | ✅ 20 | 完成 |
| 2 Tree Shaking | ✅ 4页    | ✅ 16页/0         | ✅ 19 | 完成 |

> 合计 **39 题** / 8 页笔记 / 32 页幻灯片（0 溢出）。产出：workflow 调研驱动，2 Agent 产出。
> **边界**：代码分割=分割策略与构建配置（动态 import()/路由分割/splitChunks/Vite8 codeSplitting.groups/魔法注释/preload-prefetch/vendor 切分）；Tree Shaking=构建期死代码消除（ESM/sideEffects/usedExports/innerGraph/purgeCSS/**PURE**）。与异步组件章界定（组件级 lazy API 归异步组件）。
> **门禁**：audit 0 errors / 39 题 0 异常 / 0 崩点 / 0 溢出（tree-shaking 3 页溢出 workflow 修 + 主会话复查）。

## 全批门禁 + 生产（build 一次）

- [x] 改 categories.ts（单叶→组+2叶）✓；prod 核查 id158 0题0子 ✓
- [x] 产出 2 叶三件套 ✓ 39 题
- [x] 门禁：audit 0 errors + 2 幻灯片 0 溢出 + 0 崩点
- [x] 提交 quiz/slide/categories.ts
- [x] **生产完成**：prod 删孤儿 158（0题0子）→ import 建新分类树（代码优化组 674 / 代码分割 675 / Tree Shaking 676）+ 灌 39 题 → 回填 2 页 index.md + sidebar 占位 text→link → **VitePress build 一次**（1015s）→ 提交推送 → rsync 部署笔记（0 误删 SlideStack）+ 2 幻灯片 → **全 6 路 HTTP 200 上线**（2 笔记 + 2 幻灯片 + 2 测试题，2026-07-19）。栈方法实测 sidebar：代码优化 L2 → 代码分割/Tree Shaking L3，层级正确。
