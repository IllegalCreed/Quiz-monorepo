# VitePress M2 速查治理批次 10

> 日期：2026-07-11
> 范围：SheetJS、ExcelJS、PptxGenJS
> 结论：电子表格读写与演示文稿生成子批次门禁通过，已提交、推送并部署生产环境；`frontend-framework/document` 的 M2 速查缺口由 28 页降至 16 页。

## 内容结果

| 技术      | 版本基线 | 补齐页面 | 速查要点数 |
| --------- | -------- | -------: | ---------: |
| SheetJS   | 0.20.3   |        4 |         32 |
| ExcelJS   | 4.4.0    |        4 |         32 |
| PptxGenJS | 4.0.1    |        4 |         32 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步复核三个节点的概览页和入门页，共审阅 18 个页面。速查覆盖工作簿模型、格式转换、流式与运行时边界、样式和条件格式，以及演示文稿的布局、母版、媒体、表格和输出方式。

速查审计变化：

| 指标                               | 批次前 | 批次后 |
| ---------------------------------- | -----: | -----: |
| 缺失速查                           |    239 |    227 |
| 位置异常                           |      0 |      0 |
| 空速查                             |      0 |      0 |
| `frontend-framework/document` 缺失 |     28 |     16 |
| 版本说明缺失                       |     31 |     31 |
| 版本说明未给出明确基线             |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；优先级由 `P0=1 / P1=253 / P2=70 / P3=3` 更新为 `P0=1 / P1=252 / P2=71 / P3=3`。SheetJS 去掉速查缺失后从 P1 降为 P2；ExcelJS 与 PptxGenJS 的 VitePress 问题已清零，但仍有 `slide-quality-d`，因此保持 P1。

## 事实复核与修正

- SheetJS 安装与运行时：以官方 CDN 发布的 0.20.3 为基线，不采用 npm 公共仓库中停留在 0.18.5 的旧包。Node ESM 使用文件 API 前必须执行 `XLSX.set_fs(fs)`；流式 API 还需要通过 `XLSX.stream.set_readable(Readable)` 注入运行时能力，CommonJS 构建则会自动接线。
- SheetJS 数据转换：本地探针确认 `json_to_sheet()` 的 `header` 用于控制已知字段顺序，不会过滤对象里未列出的额外字段；文档已删除把它当字段白名单的误导。
- SheetJS 加密边界：社区版可解密的是旧式 XOR 加密 XLS。AES-CBC 加密的 XLSX、XLSM、XLSB 以及较新的 XLS RC4 场景属于 Pro 能力，不再笼统宣称社区版支持 ECMA-376 加密。
- ExcelJS 流式读取：修正把 `{ filename }` 对象传给 `WorkbookReader` 的无效示例；4.4.0 的构造参数应是文件名或可读流，再传可选 options。隔离运行探针复现了旧写法报错，并验证修正后的读取路径。
- ExcelJS 能力边界：浏览器构建不包含流式 reader/writer；流模式不支持图片，已提交的行不能再访问，`unMergeCells()` 也不受支持。条件格式差异样式中的 `bgColor` 与普通单元格实心填充的 `fgColor` 分开说明。
- PptxGenJS 输出：4.0.1 的 `stream()` 实际返回由 JSZip `generateAsync({ type: "nodebuffer" })` 生成的 Buffer，不是 Node Readable。文档已同步修正流式传输和内存边界。
- PptxGenJS 文件写入：虽然公开类型把 `writeFile()` 参数标为可选，但 4.0.1 无参调用会在运行时读取 `fileName` 时报错；示例统一显式传入 `{ fileName }`。自定义十六进制颜色仍要求六位且不带 `#`，同时保留主题 SchemeColor 的存在边界。
- 链接复核：修复 SheetJS 与 PptxGenJS 基础页、进阶页共 4 个错误相对链接；三个节点的本地相对链接检查结果为 0 缺失。

主要来源：

- [SheetJS 官方文档](https://docs.sheetjs.com/)
- [SheetJS Node.js 安装说明](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/)
- [SheetJS 数据导入工具](https://docs.sheetjs.com/docs/api/utilities/array/)
- [SheetJS 本地文件访问](https://docs.sheetjs.com/docs/demos/local/file/)
- [ExcelJS 官方仓库与文档](https://github.com/exceljs/exceljs)
- [ExcelJS 4.4.0 发布页](https://github.com/exceljs/exceljs/releases/tag/v4.4.0)
- [PptxGenJS 官方文档](https://gitbrent.github.io/PptxGenJS/)
- [PptxGenJS 文件保存](https://gitbrent.github.io/PptxGenJS/docs/usage-saving/)
- [PptxGenJS 母版](https://gitbrent.github.io/PptxGenJS/docs/masters/)
- [PptxGenJS 集成说明](https://gitbrent.github.io/PptxGenJS/docs/integration/)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 227/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 726.34s
```

- 在隔离临时目录安装 SheetJS 0.20.3、ExcelJS 4.4.0、PptxGenJS 4.0.1、TypeScript 5.9.3 与 Node 类型；结合公开类型、发布包源码和运行探针核对文件适配器、字段顺序、流式读取、输出返回值与缺省参数行为。
- 最终完整 VitePress 构建成功，18 个目标 HTML 全部生成，15 个内容页均有渲染后的 `速查` 锚点；真实退出码为 0。
- 本地预览抽检三个专家页和 PptxGenJS 移动端参考页；`1440x900` 与 `390x844` 均无页面级横向溢出，移动端宽表格在自身容器内横向滚动，图片缺失和控制台错误均为 0。
- `git diff --check` 通过，三个节点的本地相对链接缺失数为 0。

## 提交与部署

- VitePress 提交：`3998681 docs: audit spreadsheet and presentation tooling`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，本批目标产物均在同步清单中。
- 正式 checksum rsync 成功退出；仅更新 VitePress 根站，未触碰 SlideStack。
- 三个节点共 18 个线上页面全部返回 HTTP 200，15 个内容页均命中速查锚点；SheetJS XOR 与 ESM 适配器、ExcelJS WorkbookReader 与浏览器边界、PptxGenJS Buffer 与 `writeFile()` 参数等生产标记均命中，既有 Prettier 幻灯片仍返回 HTTP 200。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一批

`frontend-framework/document` 还剩 4 个节点、16 页速查缺口。最后一个内容子批次处理 PDF.js、jsPDF、pdf-lib 与 docx-editor，继续保持官方文档、精确版本发布包验证、完整构建、双视口抽检与独立部署门禁；完成后再运行一次分类全量终审并形成收口报告。M3 按质量分数重做 D/C 级 Slidev，与当前 M2 文档治理保持独立。
