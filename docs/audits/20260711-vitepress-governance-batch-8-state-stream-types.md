# VitePress M2 速查治理批次 8

> 日期：2026-07-11
> 范围：Immer、RxJS、type-fest
> 结论：不可变状态、响应式数据流与 TypeScript 类型工具子批次门禁通过，已提交、推送并部署生产环境；`web-advanced/js-extension` 的 M2 速查缺口归零，站点其余领域的 M2 治理继续进行。

## 内容结果

| 技术      | 版本基线 | 补齐页面 | 速查要点数 |
| --------- | -------- | -------: | ---------: |
| Immer     | 11.1.11  |        4 |         27 |
| RxJS      | 7.8.2    |        4 |         29 |
| type-fest | 5.8.0    |        4 |         29 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步复核三个节点的概览页和入门页，共审阅 18 个页面。速查覆盖 Immer draft 生命周期与冻结边界、RxJS teardown / 高阶映射 / Promise 互操作，以及 type-fest 5.x 工具链要求、对象类型族、标称类型和编译期开销。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    263 |    251 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     12 |      0 |
| 版本说明缺失                     |     31 |     31 |
| 版本说明未给出明确基线           |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；优先级由 `P0=1 / P1=255 / P2=68 / P3=3` 更新为 `P0=1 / P1=254 / P2=69 / P3=3`。RxJS 去掉速查缺失后从 P1 降为 P2；Immer 与 type-fest 的 VitePress 问题已清零，但各自仍有 `slide-quality-d`，因此保持 P1。

## 事实复核与修正

- Immer：按 11.1.11 官方 API、pitfalls、patches、performance、freezing、classes 文档和发布包源码复核。修正 `original()` 对非 draft 返回 `undefined` 的错误说法：`original` 与 `current` 都要求 draft，否则抛错；补齐 closure 数据不会自动 draft、嵌套 `produce` 必须接住返回值、patch path 为数组且不保证最小集等边界。
- Immer 生命周期与性能：删除“`createDraft` 可长期持有 / 跨时间更新”的误导，明确它是低级手动生命周期 API，跨 `await` 会漏掉期间的 base 变化。把大数据预冻结从递归 `freeze(value, true)` 修正为官方性能建议的根节点浅冻结 `freeze(value)`；把 2–3 倍性能差距限定为官方旧基准的一个最坏场景，不再当成固定倍率。
- RxJS：按 7.8.2 官方 deprecations、`subscribe`、`retryWhen`、`lastValueFrom`、`shareReplay` 与 `fromFetch` 文档及发布包声明复核。修正“unsubscribe 必然取消执行”和“switchMap 能取消任意 fetch Promise”：退订只保证停止投递并运行 teardown，`from(Promise)` 不会中止底层 Promise / fetch。
- RxJS 网络与迁移边界：搜索示例改用 `fromFetch(..., { selector })`，让 AbortController 覆盖响应体消费；补齐 `lastValueFrom` 对 complete 的要求、`shareReplay` 默认 `refCount: false` 的保活风险，以及 `catchError` 内外层位置差异。迁移时间线改为 `toPromise` / 位置参数 `subscribe` 计划 v8 移除，`retryWhen` 计划 v9 或 v10 移除。
- type-fest：从旧的 4.41.0 / TypeScript 5.1 基线升级到 5.8.0，明确 Node.js >=20、TypeScript >=5.9、ESM 与 `strict: true`。发布包只有类型声明、没有 JavaScript，但 Node engine 仍会影响安装与工具链兼容性。
- type-fest API 边界：本地确认 `Opaque` / `UnwrapOpaque` 与 `AsyncReturnType` 在 5.8.0 仍导出，前者只是 deprecated，后者常可由 `Awaited<ReturnType<F>>` 替代；不再把 `Opaque` 到 `Tagged` 说成单纯改名。补明 `Entries<T>` 对 `Object.entries()` 只是静态断言，不做运行时转换或校验。

主要来源：

- [Immer 官方文档](https://immerjs.github.io/immer/)
- [Immer API](https://immerjs.github.io/immer/api/)
- [Immer pitfalls](https://immerjs.github.io/immer/pitfalls/)
- [Immer performance](https://immerjs.github.io/immer/performance/)
- [RxJS 官方文档](https://rxjs.dev/)
- [RxJS deprecations](https://rxjs.dev/api/deprecations)
- [RxJS fromFetch](https://rxjs.dev/api/fetch/fromFetch)
- [RxJS shareReplay](https://rxjs.dev/api/index/function/shareReplay)
- [type-fest 官方仓库与 README](https://github.com/sindresorhus/type-fest)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 251/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 684.47s
```

- 在隔离临时目录安装 Immer 11.1.11、RxJS 7.8.2、type-fest 5.8.0 与 TypeScript 5.9.3。运行 Immer 结构共享、auto-freeze、draft-only API、array methods、patch / Map 探针；运行 RxJS Promise 退订、teardown、`shareReplay`、EmptyError 与 ValueFrom 探针。
- type-fest 5.8.0 发布包确认 0 个 JavaScript 文件、199 个 `.d.ts` 类型源；30 个代表类型及本批 RxJS / Immer 示例在 TypeScript 5.9.3、strict、NodeNext 下编译通过。
- 最终完整 VitePress 构建成功，18 个目标 HTML 全部生成并命中精确版本与修正文案；真实退出码为 0。
- 本地预览检查 RxJS 进阶桌面页及 type-fest 参考、Immer 进阶移动页；`1440x900` 与 `390x844` 均无页面级横向溢出，移动表格可在容器内滚动，控制台错误为 0。

## 提交与部署

- VitePress 提交：`7eeea3d docs: audit state and type libraries`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，三个节点的 18 个 HTML 与 36 个页面资源均在同步清单中。
- 正式 checksum rsync 成功退出；仅更新 VitePress 根站，未触碰 SlideStack。
- 三个节点共 18 个线上页面全部返回 HTTP 200；Immer 非 draft 抛错、RxJS `fromFetch`、type-fest TypeScript 5.9 三个生产 HTML 标记均命中，既有 Prettier 幻灯片仍返回 HTTP 200。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一批

中央登记表当前最大速查缺口是 `frontend-framework/document`：10 个技术节点、40 页。下一子批次按 Word 文档链路处理 docx、docxtemplater、mammoth 三个节点；继续保持官方文档、精确版本发布包验证、完整构建、双视口抽检与独立部署门禁。M3 时再按质量分数重做本批 D 级 Slidev，避免与 M2 文档治理混跑。
