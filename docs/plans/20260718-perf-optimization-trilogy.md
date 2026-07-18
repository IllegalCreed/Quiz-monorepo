# 前端「性能优化」章三件套生产计划（7 叶）

> 状态：调研完成（workflow 7 主题并行，结论存 journal），待改 categories.ts + 产出。开批 2026-07-18。
> 前置：prod 核查「性能优化」单叶 id=157，**0 题 0 子**，拆叶零风险。

## 本批范围（7 技术叶）

「前端优化 > 性能优化」：原 categories.ts 单叶 → 拆成组 + 7 叶（与 sidebar 已有占位对齐）。

| #   | 叶名                     | slug                       | 核心源                                                                         |
| --- | ------------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| 1   | 异步组件                 | `async-components`         | Vue defineAsyncComponent/Suspense + React lazy/Suspense 官方                   |
| 2   | 按需引入                 | `on-demand-import`         | Element Plus / lodash-es / ECharts + unplugin 自动导入                         |
| 3   | 虚拟化                   | `list-virtualization`      | TanStack Virtual / react-window / vue-virtual-scroller                         |
| 4   | 事件及属性优化           | `event-props-optimization` | 防抖节流/事件委托 + React useMemo/useCallback/Compiler + Vue shallowRef/v-memo |
| 5   | Lighthouse               | `lighthouse`               | Google Lighthouse 官方（LCP/INP/CLS/FCP/TBT 阈值）                             |
| 6   | Webpack Bundle Analyzer  | `webpack-bundle-analyzer`  | webpack-contrib/webpack-bundle-analyzer                                        |
| 7   | rollup-plugin-visualizer | `rollup-plugin-visualizer` | btd/rollup-plugin-visualizer（Vite 用）                                        |

> 调研结论（每叶官方源/核心API/最佳实践/反模式/题点 12-14 个）：journal `subagents/workflows/wf_42cc7f41-02f/journal.jsonl`。

## categories.ts 改动（数据层，单叶 → 组+7叶）

原（categories.ts:660）：

```ts
{ name: "性能优化（异步组件 / 按需引入 / 虚拟化 / 事件及属性优化 / 性能评估）", sort: 2 },
```

改为：

```ts
{
  name: "性能优化",
  sort: 2,
  children: [
    { name: "异步组件", sort: 1 },
    { name: "按需引入", sort: 2 },
    { name: "虚拟化", sort: 3 },
    { name: "事件及属性优化", sort: 4 },
    {
      name: "性能评估",
      sort: 5,
      children: [
        { name: "Lighthouse", sort: 1 },
        { name: "Webpack Bundle Analyzer", sort: 2 },
        { name: "rollup-plugin-visualizer", sort: 3 },
      ],
    },
  ],
},
```

**入库流程**（按「分类移动坑」）：旧单叶 id=157（0 题 0 子）→ 改 categories.ts → import 建新结构（组+7叶）→ 旧 157 因 name 变成孤儿，连 prod 用一次性脚本删除（校验 0 题 0 子）。

## sidebar 改动（展示层）

config.mts 已有 7 叶占位（text 无 link），产出后改 text→link（含入门/指南/参考 items）。结构与 categories.ts 对齐（性能优化组 → 4 叶 + 性能评估组[3 工具叶]）。

## 文件映射

| #   | slug                       | 幻灯片包                         | 题库 JSON                       | 叶名（categories）       |
| --- | -------------------------- | -------------------------------- | ------------------------------- | ------------------------ |
| 1   | `async-components`         | `async-components-slide`         | `async-components.json`         | 异步组件                 |
| 2   | `on-demand-import`         | `on-demand-import-slide`         | `on-demand-import.json`         | 按需引入                 |
| 3   | `list-virtualization`      | `list-virtualization-slide`      | `list-virtualization.json`      | 虚拟化                   |
| 4   | `event-props-optimization` | `event-props-optimization-slide` | `event-props-optimization.json` | 事件及属性优化           |
| 5   | `lighthouse`               | `lighthouse-slide`               | `lighthouse.json`               | Lighthouse               |
| 6   | `webpack-bundle-analyzer`  | `webpack-bundle-analyzer-slide`  | `webpack-bundle-analyzer.json`  | Webpack Bundle Analyzer  |
| 7   | `rollup-plugin-visualizer` | `rollup-plugin-visualizer-slide` | `rollup-plugin-visualizer.json` | rollup-plugin-visualizer |

## 逐叶状态

| 叶                         | VitePress                                                      | Slidev（页/溢出） | Quiz  | 状态 |
| -------------------------- | -------------------------------------------------------------- | ----------------- | ----- | ---- |
| 1 异步组件                 | ✅ 4页（guide-line 拆 vue/react，对标 chrome-devtools 多指南） | ✅ 15页/0         | ✅ 20 | 完成 |
| 2 按需引入                 | ✅ 4页                                                         | ✅ 14页/0         | ✅ 20 | 完成 |
| 3 虚拟化                   | ✅ 4页（guide-line/principle）                                 | ✅ 16页/0         | ✅ 20 | 完成 |
| 4 事件及属性优化           | ✅ 4页                                                         | ✅ 15页/0         | ✅ 20 | 完成 |
| 5 Lighthouse               | ✅ 4页                                                         | ✅ 16页/0         | ✅ 20 | 完成 |
| 6 Webpack Bundle Analyzer  | ✅ 4页                                                         | ✅ 17页/0         | ✅ 20 | 完成 |
| 7 rollup-plugin-visualizer | ✅ 4页                                                         | ✅ 16页/0         | ✅ 20 | 完成 |

> 合计 **140 题** / 7 叶笔记（部分多指南行） / 109 页幻灯片（0 溢出）。产出：workflow 调研驱动，3 波子代理产出。
> **源核验纠正**：rollup 子代理澄清调研两处社区误传——circle→treemap-3d（无 circle 模板）、openDeprecated 不存在（实际弃用 json 改 raw-data）。
> **崩点修复**：event-props 幻灯片 two-cols 用 `::default::` 显式标记致 Slidev 硬崩 → 删（左栏是隐式 default）。
> **溢出修复**：4 幻灯片 8 页（workflow 4 agent 并行修 + 主会话复查，rollup #9 二次精简）。
> **lighthouse 前缀**：子代理用「Lighthouse 」（空格），已统一为「Lighthouse：」（全角冒号）。

## 全批门禁 + 生产（build 一次）

- [x] 改 categories.ts（单叶→组+7叶）✓；prod 核查 id157 0题0子 ✓
- [x] 产出 7 叶三件套（调研结论驱动）✓ 140 题
- [x] 门禁：audit **0 errors**（20160 题/0 重复）+ 7 幻灯片 **0 溢出** + 崩点修 + lighthouse 前缀统一
- [x] 提交 quiz/slide/categories.ts
- [x] **生产完成**：prod 删孤儿 157（0题0子校验，BigInt 比较坑修）→ import 建新分类树（性能优化组 665 / 4 叶 666-669 / 性能评估组 670 / 3 工具叶 671-673）+ 灌 140 题 → 回填 7 页 index.md（666-673）+ sidebar 占位 text→link（含 async 多指南 vue/react、list 原理）→ **VitePress build 一次**（864s）→ 提交推送 → rsync 部署笔记（0 误删 SlideStack）+ 7 幻灯片 → **全 21 路 HTTP 200 上线**（7 笔记 + 7 幻灯片 + 7 测试题，2026-07-19）。栈方法实测 sidebar 性能优化组层级正确（4 叶 + 性能评估组 3 工具叶）。
