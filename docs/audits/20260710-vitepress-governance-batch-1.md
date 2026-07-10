# VitePress M2 速查治理批次 1

> 日期：2026-07-10
> 范围：速查审计口径、位置异常、空速查、在线编辑器参考页
> 结论：批次 1 门禁通过；M2 仍在进行，未部署生产环境。

## 审计口径

- Markdown 总数：2057。
- 技术节点首页：327。
- 需速查技术内容页：1712。
- 明确豁免：4 个根级非技术页面，分别为个人简历、站点说明和两个 VitePress 脚手架示例。
- 审计器不再只判断标题是否存在，还会区分缺失、位置异常、空速查，并记录字符、列表、表格、代码围栏和链接数量，为后续模板化质量审查提供信号。

豁免页面与理由由 `IllegalCreedWebsite/scripts/audit-vitepress-content.mjs` 显式登记，避免未来新增页面被目录规则意外放过。

## 本批修复

| 项目     | 修复前 | 修复后 |
| -------- | -----: | -----: |
| 缺失速查 |    344 |    335 |
| 位置异常 |     18 |      0 |
| 空速查   |      1 |      0 |

- 18 个位置异常页只调整完整速查块的位置，使其紧跟标题和版本说明，未删改原有正文事实。
- 补全 `vite-press/guideline-advance.md`，覆盖主题入口、默认主题扩展、布局插槽、完全自定义布局和 SSR 边界。
- 为 CodePen、CodeSandbox、Expo Snack、框架 Playground、StackBlitz 五个参考页增加高密度速查，内容来自各页已核验的正文与来源。
- 中央三仓库审计排除了四个免速查页面，并将空速查纳入 P1 问题。

## 验证结果

```bash
node scripts/audit-vitepress-content.mjs
# Content pages: 1712
# Quick check missing/misplaced/empty: 335/0/0
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 906.80s
```

- 完整 VitePress 构建成功；新增和修改页面均生成目标 HTML。
- 预览环境抽查 CodePen 参考页、Astryx 入门页、VitePress 高级页，三页的 `## 速查` 均位于首个二级标题，未发现裁切或横向溢出。
- 中央 `pnpm run content:audit` 成功，当前优先级为 `P0=1 / P1=261 / P2=62 / P3=3`。

## 后续批次

剩余 335 页按技术簇推进，每批遵循以下顺序：

1. 读取同节点全部内容，提取本页独有的 API、命令、配置、版本边界和官方链接。
2. 对可能变化或存在争议的事实核对官方网页，并在可行时做本地版本验证。
3. 写入非模板化速查，运行审计、完整构建或受影响范围构建，再抽查浏览器首屏。
4. 形成独立提交；部署前另行请求确认。

下一批优先处理缺口最大的 `web-advanced/js-extension` 技术簇。本批没有 Quiz 内容变化、prod 导入、rsync 或线上部署。
