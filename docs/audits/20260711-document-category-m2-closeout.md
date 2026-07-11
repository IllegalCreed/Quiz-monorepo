# 文档处理分类 M2 收口审计

> 日期：2026-07-11
> 范围：`frontend-framework/document` 的 VitePress 笔记治理，并只读核对对应 Slidev 与 Quiz 映射
> 结论：VitePress M2 已完成并部署；10 个技术节点、50 个内容页全部具备位置正确且非空的速查，明确版本基线与三件套链接完整。Slidev 质量升级属于下一阶段 M3，当前不宣称已完成。

## 分类范围

| 节点          | 笔记版本基线                      | Quiz 题数 | Slidev 分数 / 等级 |
| ------------- | --------------------------------- | --------: | -----------------: |
| docx          | 9.7.1                             |        55 |             57 / D |
| docxtemplater | 3.69.0                            |        46 |             69 / C |
| mammoth       | 1.12.0                            |        54 |             58 / D |
| SheetJS       | 0.20.3                            |        57 |             60 / C |
| ExcelJS       | 4.4.0                             |        59 |             59 / D |
| PptxGenJS     | 4.0.1                             |        59 |             55 / D |
| PDF.js        | 6.1.200                           |        53 |             60 / C |
| jsPDF         | 4.2.1；AutoTable 5.0.8            |        57 |             59 / D |
| pdf-lib       | 1.17.1；`@cantoo/pdf-lib` 2.7.1   |        67 |             59 / D |
| docx-editor   | 1.9.0（deprecated；仓库不可访问） |        36 |             58 / D |
| **合计**      | 10 节点                           |   **543** |      **3 C / 7 D** |

## M2 完成度

| 门禁                             |                  结果 |
| -------------------------------- | --------------------: |
| 技术节点                         |                 10/10 |
| Markdown 页面（概览 + 5 内容页） |                 60/60 |
| 内容页速查                       |                 50/50 |
| 速查缺失 / 位置异常 / 空速查     |             0 / 0 / 0 |
| 明确版本基线                     |                 50/50 |
| 文档 / 幻灯片 / 测试题入口       | 10/10 / 10/10 / 10/10 |
| 相对链接缺失                     |                     0 |
| Quiz 映射 / 题目错误 / 题目警告  |         10/10 / 0 / 0 |
| Slidev 包映射                    |                 10/10 |
| 生产页面 HTTP 200                |                 60/60 |
| 生产内容页速查锚点               |                 50/50 |

本分类在批次 9 前有 40 个速查缺口，经过三个子批次归零：

| 批次 | 范围                                | 补齐速查 | 审阅页面 | VitePress 提交   |
| ---- | ----------------------------------- | -------: | -------: | ---------------- |
| 9    | docx、docxtemplater、mammoth        |       12 |       18 | `01ba2df`        |
| 10   | SheetJS、ExcelJS、PptxGenJS         |       12 |       18 | `3998681`        |
| 11   | PDF.js、jsPDF、pdf-lib、docx-editor |       16 |       24 | `cc22519`        |
| 合计 | 10 节点                             |   **40** |   **60** | 三次均已推送部署 |

## 质量结论

1. **速查门禁已真正闭环**：50 个内容页的 `## 速查` 均位于标题与版本说明之后，且非空；概览页按规则免速查，但保留评价、文档、幻灯片和测试题入口。
2. **事实复核不是只补目录**：三个批次都对官方文档、发布包类型/源码与本地运行行为交叉验证，修正了流/Buffer、模板标签、HTML 渲染、加密、字体、表单、worker、浏览器/Node 边界等多处实质错误。
3. **生产闭环完整**：每批完成整站 build、目标 HTML/速查锚点核验、双视口浏览器抽检、rsync dry-run、独立 VitePress 部署和生产 HTTP/内容标记验证；三次部署均排除 `SlideStack`，既有 Prettier 幻灯片持续 HTTP 200。
4. **三件套映射完整但质量阶段不同**：10 个节点均有 Quiz 文件和 Slidev 包，Quiz 共 543 题且中央审计无节点级错误/警告；Slidev 仍为 7 个 D、3 个 C，因此“有幻灯片”不等于“教学质量合格”。
5. **docx-editor 是特殊风险节点**：最后发行版 1.9.0 已整体 deprecated，仓库返回 404，官网与发布包 API 漂移，且 i18n 类型声明发布错误。现有笔记已转为存量维护/退出策略，不再推荐新项目采用。

## 中央审计快照

```text
技术节点: 327
Quiz 映射: 326/327
Slidev 映射: 327/327
优先级: P0=1 P1=251 P2=72 P3=3
全站速查: missing=211 misplaced=0 empty=0
全站测试题链接: missing=0 invalid=0
```

本分类 10 个节点的 VitePress 问题全部清零。PDF.js、SheetJS、docxtemplater 因 Slidev C 归入 P2，其余 7 个节点因 Slidev D 仍归入 P1；这正是下一阶段顺序的依据。

## 未完成项与下一阶段

- **M3 Slidev 质量升级**：先处理 PptxGenJS 55、docx 57、docx-editor/mammoth 58，再处理 ExcelJS/jsPDF/pdf-lib 59，最后处理 PDF.js/SheetJS 60 与 docxtemplater 69。目标不是增页数，而是增加教学叙事、代码步骤、表格/图示、交互组件、讲者备注和布局变化。
- **Slidev 强制门禁**：每个包单独 build，再运行 `node scripts/check-slidev-overflow.mjs {pkg}`；只有 0 溢出才提交。部署逐包 rsync 到 `/SlideStack/{pkg}/`，不运行全量 deploy。
- **全站 M2 后续**：文档处理分类已归零，但站点其他分类仍有 211 个速查缺口；后续按中央优先级继续，不能把本分类收口误写成全站收口。
- **Quiz 全局遗留**：中央审计仍有 1 个 VitePress 节点未映射 Quiz，以及 2443 条 `missing-technical-prefix` 警告；这些不属于本分类本轮变更，后续应独立治理，且任何生产导入仍需单独确认。

## 相关报告

- [批次 9：Word 文档](./20260711-vitepress-governance-batch-9-word-documents.md)
- [批次 10：电子表格与演示文稿](./20260711-vitepress-governance-batch-10-spreadsheet-presentations.md)
- [批次 11：PDF 与 docx-editor](./20260711-vitepress-governance-batch-11-pdf-docx-editor.md)
- [中央审计基线](./20260710-content-audit-baseline.md)
