# VitePress M2 速查治理批次 7

> 日期：2026-07-11
> 范围：decimal.js、Fuse.js、Papa Parse
> 结论：精确数值、模糊检索与 CSV 数据管线子批次门禁通过，已提交、推送并部署生产环境；M2 仍在进行。

## 内容结果

| 技术       | 版本基线 | 补齐页面 | 速查要点数 |
| ---------- | -------- | -------: | ---------: |
| decimal.js | 10.6.0   |        4 |         32 |
| Fuse.js    | 7.4.2    |        4 |         32 |
| Papa Parse | 5.5.4    |        4 |         32 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步修订三个节点的概览页和入门页，共审阅 18 个页面。速查覆盖十进制输入与舍入、模糊搜索调参和 token search、浏览器 Worker、CSV 类型转换、流式内存、重复表头、远程下载与公式注入。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    275 |    263 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     24 |     12 |
| 版本说明缺失                     |     31 |     31 |
| 版本说明未给出明确基线           |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；优先级由 `P0=1 / P1=256 / P2=67 / P3=3` 更新为 `P0=1 / P1=255 / P2=68 / P3=3`。Fuse.js 去掉速查缺失后从 P1 降为 P2；decimal.js 与 Papa Parse 的 VitePress 问题已清零，但各自仍有 `slide-quality-d`，因此保持 P1。

## 事实复核与修正

- decimal.js：按官方 API、README、10.6.0 发布包源码与声明文件复核构造、精度、舍入、随机数、序列化和静态方法。统一精确版本，补明 number 在进入库前就可能丢精度；修正整数除法别名为 `divToInt`、`toFraction()` 返回两个 Decimal、内部 `d` 块范围为 0~9999999，以及 `Decimal.random(sd)` 的参数是有效数字而非小数位。
- decimal.js 随机与工程边界：修正“加密安全随机等于可重复 / 可审计随机”的错误说法。`crypto: true` 只切换到 `getRandomValues` / `randomBytes`，缺失时抛错；令牌更适合随机字节或专用 ID API，抽奖审计仍需独立的承诺、记录与复核协议。同步收紧 decimal.js-light 的兼容表述，不再暗示完整等价替换。
- Fuse.js：按 7.4.2 官方 options、scoring、indexing、token search、Web Workers 文档与发布包类型复核。补上 `useTokenSearch / tokenize / tokenMatch`、BM25 风格 IDF、`Fuse.match / Fuse.use`，以及公开 `basic / min-basic / worker / worker-script` 导出；本地测得完整 / basic 压缩构建约 9.1 / 7.2 KB gzip。
- Fuse.js Worker 与 UI 边界：把旧的“自行放进 Web Worker”概述改为官方 Beta `FuseWorker` 实例，明确它仅支持浏览器 Web Worker、异步 `search / add / setCollection`，不支持 token search、函数选项、remove / getIndex 或 Node worker_threads，并要求 `terminate()`。高亮示例改为返回文本片段交给框架转义，删除直接拼接 HTML 的注入风险。
- Papa Parse：按 5.5.4 官方文档、发布包源码和 `@types/papaparse` 5.5.2 复核。修正“主包自带类型”和“dynamicTyping 不转日期”：npm 包没有 `.d.ts`，需安装社区类型；动态转型还会把完整 ISO 时间戳变为 Date、空字符串变为 null，并把超安全整数边界的数字保留为字符串。
- Papa Parse 流式与安全边界：区分“同步返回值”与“回调 / 事件消费”，不再把字符串 `step` 一律称为异步；明确流式只保证库不累计全部行，业务回调仍可能重新堆高内存，且流式 complete 不提供全量数据。同步补齐重复表头 `_1 / _2` 与 `meta.renamedHeaders`、transform 先于 dynamicTyping、chunk 仅用于本地 / 远程文件、XHR CORS，以及 `escapeFormulae` 默认覆盖 `= + - @ Tab CR`。

主要来源：

- [decimal.js 官方 API](https://mikemcl.github.io/decimal.js/)
- [decimal.js 官方仓库](https://github.com/MikeMcl/decimal.js)
- [Fuse.js 选项文档](https://www.fusejs.io/api/options.html)
- [Fuse.js token search](https://www.fusejs.io/token-search.html)
- [Fuse.js Web Workers](https://www.fusejs.io/web-workers.html)
- [Fuse.js 官方仓库](https://github.com/krisk/Fuse)
- [Papa Parse 官方文档](https://www.papaparse.com/docs)
- [Papa Parse 官方仓库](https://github.com/mholt/PapaParse)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 263/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 724.44s
```

- 在隔离临时目录安装 decimal.js 10.6.0、Fuse.js 7.4.2、Papa Parse 5.5.4 与 `@types/papaparse` 5.5.2，核对 package exports、声明与源码，并运行字符串精度、不可变性、静态 API、token any / all、basic 构建报错、Worker 环境、ISO Date / null 转型、重复表头、transform 顺序和公式转义探针。
- 最终完整 VitePress 构建成功，18 个目标 HTML 全部生成并命中新内容标记；真实退出码为 0。
- 本地预览逐页检查 12 个新增速查路由，桌面 `1440×1000` 与移动 `390×844` 共 24 次访问；每页首个 H2 均为“速查”、速查均为 8 条、根页面横向溢出为 0、控制台错误为 0。
- 人工检查 Fuse.js 进阶桌面页与 Papa Parse 参考移动页；顶部版本说明、速查长行、行内代码、侧栏、目录栏和正文均无重叠或截断。

## 提交与部署

- VitePress 提交：`41cc305 docs: audit numeric search and csv libraries`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，三个节点的 18 个 HTML 均在同步清单中。
- 正式 checksum 同步成功退出；未触碰 SlideStack。
- decimal.js 专家、Fuse.js 进阶、Papa Parse 参考三个线上页面及既有 Prettier 幻灯片均返回 HTTP 200；生产 HTML 命中有效数字、token search / FuseWorker、`@types/papaparse` / `renamedHeaders` 等本批标记。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一批

`web-advanced/js-extension` 尚有 3 个技术节点、12 页缺失速查。下一子批次处理 Immer、RxJS、type-fest，完成该领域的 M2 速查治理；之后按中央登记表切换到下一个缺失密集领域，并把 decimal.js、Papa Parse 的 D 级幻灯片留给 M3 专项重做。
