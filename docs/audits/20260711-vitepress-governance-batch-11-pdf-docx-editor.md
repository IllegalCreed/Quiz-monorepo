# VitePress M2 速查治理批次 11

> 日期：2026-07-11
> 范围：PDF.js、jsPDF、pdf-lib、docx-editor
> 结论：PDF 解析/生成/修改与浏览器 DOCX 编辑子批次门禁通过，已提交、推送并部署生产环境；`frontend-framework/document` 的 M2 速查缺口由 16 页降至 0 页。

## 内容结果

| 技术        | 版本基线                        | 补齐页面 | 速查要点数 |
| ----------- | ------------------------------- | -------: | ---------: |
| PDF.js      | 6.1.200                         |        4 |         33 |
| jsPDF       | 4.2.1；AutoTable 5.0.8          |        4 |         33 |
| pdf-lib     | 1.17.1；`@cantoo/pdf-lib` 2.7.1 |        4 |         26 |
| docx-editor | 1.9.0（npm deprecated）         |        4 |         27 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 16 页；同步复核四个概览页和四个入门页，共审阅 24 个页面。速查覆盖 PDF.js 任务/worker/文本层/注解层与 Node 边界、jsPDF 绘图/字体/HTML/表格/安全、pdf-lib 页面/表单/字体/加密/fork，以及 docx-editor 框架差异、headless、agents、内容控件和供应链退出策略。

速查审计变化：

| 指标                               | 批次前 | 批次后 |
| ---------------------------------- | -----: | -----: |
| 缺失速查                           |    227 |    211 |
| 位置异常                           |      0 |      0 |
| 空速查                             |      0 |      0 |
| `frontend-framework/document` 缺失 |     16 |      0 |
| 版本说明缺失                       |     31 |     31 |
| 版本说明未给出明确基线             |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；优先级由 `P0=1 / P1=252 / P2=71 / P3=3` 更新为 `P0=1 / P1=251 / P2=72 / P3=3`。PDF.js 去掉速查缺失后从 P1 降为 P2；jsPDF、pdf-lib 与 docx-editor 的 VitePress 问题已清零，但仍有 `slide-quality-d`，因此保持 P1。

## 事实复核与修正

- PDF.js 版本与运行时：基线更新到 6.1.200，发布包 `engines.node` 为 `>=22.13.0 || >=24`，Node 使用 `pdfjs-dist/legacy/build/pdf.mjs`。浏览器直接集成时要配置同版本 `workerSrc` 或 `workerPort`；react-pdf 等封装已接管 worker 时不能再笼统要求重复设置。
- PDF.js 分层 API：`TextLayer` 还需要 viewer CSS 或等价定位样式；低层 `AnnotationLayer` 需要 link service、download manager 与 annotation storage。补齐 `iccUrl`、`wasmUrl`、`useSystemFonts`、`disableAutoFetch` 和 `ttb` 书写方向；修正把所有 CJK 问题都归因于 CMap 的过度简化。
- PDF.js 编辑边界：`PDFDocumentProxy.saveDocument()` 与 viewer 的部分注解保存能力真实存在，删除“绝对只能渲染、不能保存任何修改”的说法；同时明确它仍不是任意建页、排版或改写正文的通用编辑器。
- jsPDF HTML 路径：4.2.1 源码把 html2canvas 的 canvas 指向 jsPDF context2d，`fillText` 会生成 PDF 文本，不能再描述成整页截图和全量不可选文字。示例移除会覆盖 `width/windowWidth` 缩放的 `html2canvas.scale`，并要求异步完成后再导出。
- jsPDF 类型与插件：运行时有 `getPageWidth()` / `getPageHeight()`，但 4.2.1 `index.d.ts` 未声明，TypeScript 示例改用 `internal.pageSize.getWidth()/getHeight()`。AutoTable 5.0.8 会写入运行时 `lastAutoTable`，却没有 module augmentation，文档用局部交叉类型收窄。
- jsPDF 字体、安全与 Node：数 MB 字体不能直接展开给 `String.fromCharCode`，改为分块转换。4.2.1 修复 output HTML injection 与 annotation color PDF object injection，并承接 4.0~4.2 的文件读取、AcroForm、`addJS` 与图片安全修复；Node 优先由宿主读取字节，确需路径访问时使用 Node permission flags。
- pdf-lib 图片与表单：1.17.1 的 JPEG 解析器包含常见 baseline 和 progressive SOF 标记，删除“渐进式 JPEG 易失败”的错误结论。表单 `addToPage` 选项改为 `width` / `height`，并保留 `getFieldMaybe`；中文表单外观先用完整字体验证，`subset` 作为需按字体回归的体积优化。
- pdf-lib 加密与 fork：`ignoreEncryption` 只跳过检查、不解密，危险示例已删除。`@cantoo/pdf-lib` 2.7.1 本地类型/源码确认了 `password`、`saveIncremental(snapshot)`、`commit()`、`embedSvg` / `drawSvg`；它服务 Cantoo 自身路线，不再宣称迁移只需替换导入名。
- docx-editor 供应链：npm 当前仍发布 1.9.0，但 React、Vue、core、i18n、agents 与 Nuxt 包均标为 deprecated，deprecation 文本没有继任包；`eigenpal/docx-editor` 仓库 API 与 git 访问均返回 404。概览首屏改为“不建议新生产项目采用”，存量系统要求锁版本、lockfile/integrity、保存制品并准备退出路径。
- docx-editor 发布包事实：1.9.0 React 有 `externalContent`、受控 `comments`、`agentPanel` 与 `save({ selective })`；Vue 没有相同入口且 `save()` 无参数。运行时 `agentTools` 是 15 个而非官网旧文档的 14 个，新增 `insert_break`；内容控件已覆盖 block、inline、table cell、页眉页脚与原子批量更新。
- docx-editor 类型与保真：`@eigenpal/docx-editor-i18n@1.9.0` 的根 `.d.ts` 实际含 JavaScript 初始化代码，`skipLibCheck:false` 会触发 TS1046/TS1039；Vue 3 `vue-tsc + skipLibCheck:true` 隔离探针可通过。`DocumentAgent.getPageCount()` 在 headless 中只是近似值；保真说明中的 run 级 legacy VML shape 例外也已写入。
- 链接复核：修复 PDF.js、jsPDF、pdf-lib 和 docx-editor 共 8 个 guide 深度页错误相对链接；四节点本地相对链接检查结果为 0 缺失，并用 `v-pre` 处理围栏外 mustache。

主要来源：

- [PDF.js 官方文档](https://mozilla.github.io/pdf.js/)
- [PDF.js Getting Started](https://mozilla.github.io/pdf.js/getting_started/)
- [PDF.js API](https://mozilla.github.io/pdf.js/api/)
- [PDF.js 6.1.200 发布页](https://github.com/mozilla/pdf.js/releases/tag/v6.1.200)
- [jsPDF 官方仓库](https://github.com/parallax/jsPDF)
- [jsPDF 4.2.1 发布页](https://github.com/parallax/jsPDF/releases/tag/v4.2.1)
- [jsPDF API 文档](https://parallax.github.io/jsPDF/docs/)
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [pdf-lib 官方文档](https://pdf-lib.js.org/)
- [pdf-lib API](https://pdf-lib.js.org/docs/api/)
- [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib)
- [cantoo-scribe/pdf-lib](https://github.com/cantoo-scribe/pdf-lib)
- [docx-editor 文档](https://www.docx-editor.dev/docs)
- [@eigenpal/docx-editor-react npm](https://www.npmjs.com/package/@eigenpal/docx-editor-react)
- [eigenpal/docx-editor 历史仓库链接（本次核验 404）](https://github.com/eigenpal/docx-editor)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 211/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 747.10s
```

- 隔离目录安装 PDF.js 6.1.200、jsPDF 4.2.1、AutoTable 5.0.8、pdf-lib 1.17.1、`@cantoo/pdf-lib` 2.7.1、docx-editor 1.9.0 与 TypeScript 5.9.3；类型探针验证页面、表单、增量保存、SVG、React/Vue 差异，运行探针验证 15 个 agent 工具与 AutoTable `lastAutoTable`。
- `tsc --strict --skipLibCheck` 的代表 API 探针通过；`vue-tsc --skipLibCheck` 的 Vue 适配器探针通过；关闭 `skipLibCheck` 按预期复现 `-i18n` 发布声明错误，作为已记录风险而非门禁误报。
- 最终完整 VitePress 构建成功，24 个目标 HTML 全部生成，20 个内容页均有渲染后的 `速查` 锚点；真实退出码为 0。
- 本地预览抽检 docx-editor 概览与四个参考页；`1280x720` 与 `390x844` 均无页面级横向溢出，宽表格在自身容器内横向滚动，浏览器控制台 error/warn 为 0。
- 文档处理分类全量复核为 10 个节点、60 个 Markdown、50 个内容页，速查缺失/错位/空白为 0/0/0，相对链接缺失为 0。
- `git diff --check` 通过；版本残留、危险 `ignoreEncryption` 示例、渐进式 JPEG 误判、`.html()` 整页截图误判与围栏外 mustache 均已清零。

## 提交与部署

- VitePress 提交：`cc22519 docs: audit PDF and DOCX tooling`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，四节点 24 个 HTML 全部在同步清单中。
- 正式 rsync 完成后再次幂等同步，真实退出码为 0；仅更新 VitePress 根站，未触碰 SlideStack。
- 四节点共 24 个线上页面全部返回 HTTP 200；PDF.js 6.1.200、jsPDF 4.2.1、pdf-lib `saveIncremental(snapshot)`、docx-editor deprecated / 404 / 15 工具等生产标记均命中，既有 Prettier 幻灯片仍返回 HTTP 200。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一阶段

`frontend-framework/document` 的 VitePress M2 治理已收口。中央审计显示该分类 10 套 Slidev 中 7 套 D、3 套 C，下一阶段进入 M3 幻灯片重做；每包仍须独立 build、运行 `check-slidev-overflow.mjs` 达到 0 溢出，再逐包 rsync，不能与题库或 VitePress 部署混跑。
