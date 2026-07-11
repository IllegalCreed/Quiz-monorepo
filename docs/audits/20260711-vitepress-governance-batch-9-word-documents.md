# VitePress M2 速查治理批次 9

> 日期：2026-07-11
> 范围：docx、docxtemplater、mammoth
> 结论：Word 文档生成、模板填充与语义转换子批次门禁通过，已提交、推送并部署生产环境；`frontend-framework/document` 的 M2 速查缺口由 40 页降至 28 页。

## 内容结果

| 技术          | 版本基线 | 补齐页面 | 速查要点数 |
| ------------- | -------- | -------: | ---------: |
| docx          | 9.7.1    |        4 |         24 |
| docxtemplater | 3.69.0   |        4 |         24 |
| mammoth       | 1.12.0   |        4 |         25 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步复核三个节点的概览页和入门页，共审阅 18 个页面。速查覆盖 docx 对象树、输出类型与 patch API，docxtemplater 标签作用域、格式/商业模块边界与实例生命周期，以及 mammoth style map、图片读取、HTML 安全与资源边界。

速查审计变化：

| 指标                               | 批次前 | 批次后 |
| ---------------------------------- | -----: | -----: |
| 缺失速查                           |    251 |    239 |
| 位置异常                           |      0 |      0 |
| 空速查                             |      0 |      0 |
| `frontend-framework/document` 缺失 |     40 |     28 |
| 版本说明缺失                       |     31 |     31 |
| 版本说明未给出明确基线             |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；优先级由 `P0=1 / P1=254 / P2=69 / P3=3` 更新为 `P0=1 / P1=253 / P2=70 / P3=3`。docxtemplater 去掉速查缺失后从 P1 降为 P2；docx 与 mammoth 的 VitePress 问题已清零，但各自仍有 `slide-quality-d`，因此保持 P1。

## 事实复核与修正

- docx：按 9.7.1 官方 API 与发布包声明复核 Packer、ImageRun、默认样式、编号和 patcher。修正“所有 Packer 方法都返回 Promise”：`toStream()` 立即返回 Stream，其余便捷出口返回 Promise；`toBuffer()` 的公开类型是 Node Buffer，浏览器应选 `toBlob()` / `toArrayBuffer()`。
- docx 输出与图片：本地源码确认 9.7.1 的 `toStream()` 仍先生成完整 `nodebuffer`，再一次性发出，不能宣称为低内存增量生成。`ImageRun.data` 接受 Buffer、字符串、Uint8Array、ArrayBuffer，不接受 Blob；默认无序列表为 0~8 共 9 级。
- docx 样式与补丁：生成样本文档确认 `Title`、`Heading1`~`Heading6`、`ListParagraph` 等常用样式会写入 `styles.xml`，删除“必须手动定义内置样式”的误导。补齐 `patchDetector()`、`placeholderDelimiters`、`keepOriginalStyles`、`recursive`，并修复把两个 PatchType 用位运算拼在一起的无效示例。
- docxtemplater：按 3.69.0 官方入门、标签、配置、异步、错误、API、FAQ 与发布包源码复核。明确免费核心支持 docx/pptx，xlsx 需要商业模块；商业模块清单与套餐不再硬编码数量。
- expressions：适配器由 `docxtemplater/expressions.js` 导出，但 `angular-expressions` 是独立依赖。依据 2026-05 官方安全公告把最低版本线更新为 1.5.2；修正 `configure()` 示例，必须接住它返回的新 parser 再传给构造函数。
- docxtemplater 模板与生命周期：本地生成两个不同格式 TextRun 分割 `{na` / `me}` 的模板，3.69.0 仍能正确渲染 `{name}`，删除“跨 run 必然失效”的旧说法，并把真实边界限定为单个标签字符跨段落/单元格。修正表格循环示例，明确实例与模块不能跨输出复用；`renderAsync()` 只异步解析数据，最终 XML 渲染仍占同步 CPU。
- mammoth：按 1.12.0 README、NEWS、类型声明与源码复核。修正“只认样式名、完全忽略直接格式”：它优先语义样式，仍保留粗体、斜体、删除线、链接等部分语义；输出是 HTML 片段，表格结构可保留但边框/底纹等视觉格式会丢失。
- mammoth API 与安全：补齐 `readAsBase64String()` / `readAsArrayBuffer()` / Node `readAsBuffer()`，标明旧 `read()` 与 `convertToMarkdown()` 已弃用。对不可信文档同时要求 HTML 消毒、保持 `externalFileAccess: false`、限制体积/时长/并发/内存；`transformDocument` 仍属不稳定 API。

主要来源：

- [docx 官方文档](https://docx.js.org/)
- [docx Packer API](https://docx.js.org/api/classes/Packer.html)
- [docx patchDocument API](https://docx.js.org/api/functions/patchDocument.html)
- [docxtemplater 官方文档](https://docxtemplater.com/docs/)
- [docxtemplater 标签类型](https://docxtemplater.com/docs/tag-types/)
- [docxtemplater expressions 解析器](https://docxtemplater.com/docs/angular-parse/)
- [docxtemplater 异步数据](https://docxtemplater.com/docs/async/)
- [docxtemplater FAQ 与授权](https://docxtemplater.com/faq/)
- [mammoth.js README](https://github.com/mwilliamson/mammoth.js#readme)
- [mammoth.js NEWS](https://github.com/mwilliamson/mammoth.js/blob/master/NEWS)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 239/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 661.26s
```

- 在隔离临时目录安装 docx 9.7.1、docxtemplater 3.69.0、mammoth 1.12.0、angular-expressions 1.5.2、PizZip 3.2.0 与 TypeScript 5.9.3。三套代表 API 在 strict + NodeNext 下类型检查通过。
- 运行 docx Packer 返回形态、默认样式 XML 与 docxtemplater 跨 run 标签探针；读取三包类型声明/源码确认输出、图片、patch、默认值、实例生命周期与 mammoth 选项。
- 最终完整 VitePress 构建成功，18 个目标 HTML 全部生成并命中精确版本，15 个内容页均有渲染后的 `速查` 锚点；真实退出码为 0。
- 本地预览抽检 docx 专家桌面页、docxtemplater 进阶与 mammoth 参考移动页；`1440x900` 与 `390x844` 均无页面级横向溢出，mammoth 的 7 个表格可在自身容器横向滚动，控制台错误为 0。

## 提交与部署

- VitePress 提交：`01ba2df docs: audit Word document tooling`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，三个节点的 18 个 HTML 全部在同步清单中。
- 正式 checksum rsync 成功退出；仅更新 VitePress 根站，未触碰 SlideStack。
- 三个节点共 18 个线上页面全部返回 HTTP 200，15 个内容页均命中速查锚点；docx Stream、docxtemplater 跨 run、mammoth HTML 片段三个生产标记均命中，既有 Prettier 幻灯片仍返回 HTTP 200。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一批

`frontend-framework/document` 还剩 7 个节点、28 页速查缺口。下一子批次优先处理 SheetJS、ExcelJS、PptxGenJS，继续保持官方文档、精确版本发布包验证、完整构建、双视口抽检与独立部署门禁；PDF.js、jsPDF、pdf-lib、docx-editor 放入随后子批次。M3 再按质量分数重做本批 D/C 级 Slidev，避免与 M2 文档治理混跑。
