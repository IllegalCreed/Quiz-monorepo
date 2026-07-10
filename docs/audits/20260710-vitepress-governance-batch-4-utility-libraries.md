# VitePress M2 速查治理批次 4

> 日期：2026-07-10
> 范围：Lodash-es、es-toolkit、常用工具库
> 结论：工具库子批次门禁通过，已提交、推送并部署生产环境；M2 仍在进行。

## 内容结果

| 技术       | 版本基线                                                              | 补齐页面 | 速查要点数 |
| ---------- | --------------------------------------------------------------------- | -------: | ---------: |
| Lodash-es  | lodash-es / lodash 4.18.1                                             |        4 |         31 |
| es-toolkit | 1.49.0                                                                |        4 |         32 |
| 常用工具库 | mitt 3.0.1、qs 6.15.3、JSZip 3.10.1、FileSaver 2.0.5、QRCode 1.5.4 等 |        4 |         32 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同时修正 es-toolkit 的概览页和入门页，使版本与 API 边界保持一致。速查覆盖 ESM / CommonJS 边界、不可变与可变 API、按需导入、compat 覆盖范围、超时与并发原语、事件快照语义、查询串数组边界、压缩包安全、浏览器下载限制、二维码输出、颜色分级和 Markdown 扩展。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    311 |    299 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     60 |     48 |
| 版本说明缺失                     |     31 |     31 |
| 版本说明未给出明确基线           |     30 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327，优先级保持 `P0=1 / P1=259 / P2=64 / P3=3`。

## 事实复核与修正

- Lodash-es：按 4.18.1 发布包、本地运行结果与 Lodash 变更记录核对模块格式、`sideEffects`、链式调用、可变 API 和原生替代边界。明确 `lodash-es` 是 ESM 入口，`lodash` 仍是 CommonJS 包；迁移需要逐调用点检查语义，不能把“可 tree-shake”写成所有构建器下的固定体积承诺。
- es-toolkit：按 1.49.0 发布包、官方 compat 范围和 API 文档核对。修正 compat 默认导入的边界：它可调用并挂载静态方法，但不提供 Lodash wrapper 的 `chain`、`value`、`mixin`；`withTimeout` 接收待执行函数，`timeout` / `withTimeout` 的 `AbortSignal` 只取消计时约束，不会替调用方中止底层任务。同步修正 Mutex、Semaphore 与 memoize 的签名和使用方式。
- mitt 与 qs：本地验证 mitt 发射时对处理器列表做快照，因此本轮删除的处理器仍会执行、本轮新增的同类型处理器要到下一轮才执行。qs 默认 `arrayLimit=20` 时索引 20 已转为对象；逗号数组要保留单元素数组形状需启用 `commaRoundTrip`，编码后的逗号不会被当作分隔符。
- JSZip、FileSaver 与 QRCode：区分 zip-slip 路径清理和 zip-bomb 资源限制，明确 JSZip 的内存模型与 FileSaver 的用户手势、浏览器容量边界；二维码库浏览器端 `toString` 只输出 SVG，终端字符输出属于 Node.js 环境。
- chroma.js 与 marked：分位数分级使用 `chroma.limits(data, "q", n)`；Marked 18 的 renderer 接收 token 对象，扩展优先使用隔离的 `new Marked(...)` 实例，避免全局配置相互污染。

主要来源：

- [Lodash Changelog](https://github.com/lodash/lodash/wiki/Changelog)
- [es-toolkit compat 范围](https://es-toolkit.dev/compat/intro.html)
- [es-toolkit withTimeout](https://es-toolkit.dev/reference/promise/withTimeout.html)
- [es-toolkit 性能基线](https://es-toolkit.dev/performance.html)
- [mitt 官方仓库](https://github.com/developit/mitt)
- [qs 官方仓库](https://github.com/ljharb/qs)
- [JSZip 限制说明](https://stuk.github.io/jszip/documentation/limitations.html)
- [JSZip loadAsync](https://stuk.github.io/jszip/documentation/api_jszip/load_async.html)
- [FileSaver.js 官方仓库](https://github.com/eligrey/FileSaver.js)
- [node-qrcode 官方仓库](https://github.com/soldair/node-qrcode)
- [chroma.js 官方文档](https://gka.github.io/chroma.js/)
- [Marked 扩展文档](https://marked.js.org/using_pro)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 299/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 648.54s
```

- 在隔离临时目录安装上述精确版本，并运行模块导出、compat wrapper、超时取消、并发原语、memoize、事件快照、查询串、二维码、颜色分级和 Marked renderer 行为探针。
- 12 个目标 HTML 全部生成。
- Playwright 逐页检查 12 个目标路由，桌面 `1440×1000` 与移动 `390×844` 共 24 次访问均为 HTTP 200；每页速查为 7 至 8 条，根节点横向溢出为 0，未发现页面异常。
- 人工检查 es-toolkit 进阶桌面页、常用工具库专家移动页和 es-toolkit 进阶移动页，速查位置、表格、代码块与正文排版正常。

## 提交与部署

- VitePress 提交：`d002b87 docs: audit utility library content`，已推送 `origin/main`。
- rsync dry-run 使用 `--delete --exclude 'SlideStack'`；45 个删除项全部是被新 hash 替代的静态资源，非资源删除项为 0，`SlideStack` 命中 0。
- 正式同步使用 checksum 模式并成功退出；未触碰 SlideStack。
- Lodash-es 基础、es-toolkit 进阶和常用工具库专家三个线上页面均返回 HTTP 200，并包含本批新增标记。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入或数据库清理。

## 下一批

`web-advanced/js-extension` 尚有 12 个技术节点、48 页缺失速查。后续继续按每批 3 个技术节点、约 12 页推进，并保持“官方文档、精确版本本地验证、完整构建、双视口验收、独立部署”的门禁。
