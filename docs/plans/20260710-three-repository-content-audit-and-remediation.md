# 三仓库内容全量审计与治理计划

> 状态：M0、M1 已完成，M2 进行中
> 范围：Quiz 题库/API、IllegalCreedWebsite、SlideStack
> 基线日期：2026-07-10

## 目标

以 VitePress 技术节点为审计单位，建立文档、幻灯片、测试题之间可重复生成的统一登记表，并完成三类治理：

1. VitePress 内容页顶部速查、事实准确性、版本和链接质量。
2. Slidev 教学路径、版式、代码演进、交互演示、构建和页面溢出质量。
3. Quiz 分类映射、题目结构、解析质量、本地内容与生产库的一致性。

质量基线建立前暂缓继续扩张新的三件套，避免把现有问题复制到更多内容。

## 不可变规则

- 正式题目只允许执行 `pnpm -C apps/quiz-backend run import:content:prod`。
- prod 导入、prod 清理和任何 rsync 部署前必须再次征得用户确认。
- 正式题目不得导入 dev/test。
- 变更分类结构前先只读核查 prod，确认旧节点的题目数和子节点数。
- VitePress 内容页必须在标题和版本说明后紧跟 `## 速查`。
- Slidev 改动包必须 build，并运行 `node scripts/check-slidev-overflow.mjs {pkg}`，0 溢出才完成。
- 三路部署相互独立，不混合运行。

## 当前基线

| 项目                      |        当前规模或缺口 |
| ------------------------- | --------------------: |
| VitePress Markdown        |                  2057 |
| VitePress 技术节点        |                   327 |
| 需速查技术内容页          |                  1712 |
| 免速查非技术根页面        |                     4 |
| 缺失 / 位置异常 / 空速查  |           275 / 0 / 0 |
| 版本说明缺失 / 未给出基线 |               31 / 27 |
| Slidev 套件               |                   327 |
| Quiz 内容 JSON            |                   326 |
| Quiz 本地技术方向叶子     | 407（另有难度叶子 5） |
| 测试题链接无法匹配分类    |  1（AI 时代如何测试） |

基线数量由审计脚本重新生成；速查范围校准后，缺失数量允许合理变化，但必须记录原因。

## M0：统一审计底座

产出一份以技术节点路由为稳定 ID 的登记表，至少包含：

- VitePress 文件、线上路由、内容页数量和速查状态。
- Slidev 链接、包名、包是否存在、自动质量信号和初步等级。
- Quiz URL 参数、匹配的技术方向叶子、题库 JSON 和题量。
- 未链接幻灯片、孤立 Slidev 包、孤立题库文件和跨仓库命名差异。

自动评分只用于排序人工审查优先级，不作为最终质量结论。

## M1：质量样板

以 `prettier-slide` 为仓库内部参考，保留其清晰教学路径、布局切换、代码变化、点击节奏、演讲者注释和官方链接设计。

先完成三类样板：

- TypeScript：分步类型推导、代码行高亮、magic-move 或 Twoslash。
- JSON：可编辑输入、解析结果、校验错误和定位反馈。
- Three.js：真实 Canvas、相机、材质、光照和参数控制。

样板通过 build、0 溢出、全页截图和实际交互检查后，才固化为后续治理参考。

完成于 2026-07-10：

- `typescript-slide`：23 页重构为 16 页，增加控制流窄化实验、分步代码、状态图与 TypeScript 7.0 迁移边界。
- `json-slide`：21 页重构为 14 页，增加实时解析、语法错误定位、大整数精度反馈与协议决策图。
- `threejs-slide`：18 页重构为 16 页，增加 Three.js r185 实景、材质与光照控制、真实渲染统计及资源释放路径。
- 三包 build 成功，overflow 均为 0；桌面与移动视口、实际控件和 Three.js Canvas 像素均已验收。
- 自动分数分别由 56、60、59 提升至 82、81、84，原有风险信号全部清零。详细记录见 `docs/audits/20260710-slidev-quality-pilot.md`。

## M2：VitePress 全量治理

1. 校准 `CV.md`、`api-examples.md` 等特殊页面是否属于速查范围。
2. 修复位置异常，再按领域补齐缺失速查。
3. 对已有速查检查空洞、模板化、版本冲突、错误命令和失效链接。
4. 每个技术节点核对官方文档、核心 API、安装方式、版本边界和弃用信息。
5. 每批运行内容审计和完整 VitePress build。

完成标准：缺失与位置异常均为 0，链接检查通过，完整构建成功。

2026-07-10 完成批次 1：

- 明确豁免 `CV.md`、`api-examples.md`、`markdown-examples.md`、`start.md` 四个非技术根页面，并把豁免原因写入审计器，不使用路径猜测。
- 18 个位置异常页已将完整速查块移动到标题和版本说明之后，正文内容未删减；位置异常由 18 降至 0。
- 补全 VitePress 高级页原有空速查，并完成 CodePen、CodeSandbox、Expo Snack、框架 Playground、StackBlitz 五个在线编辑器参考页速查；空速查由 1 降至 0，缺失由 344 降至 335。
- 审计器新增空速查检测及速查字符、列表、表格、代码围栏、链接等质量信号；三仓库登记表同步采用新口径。
- VitePress 完整构建成功，并在桌面视口抽查 CodePen、Astryx、VitePress 高级页的首屏速查位置与版式。

批次记录见 `docs/audits/20260710-vitepress-governance-batch-1.md`。M2 后续按技术簇继续补齐，不采用无事实校验的统一模板批量注入。

2026-07-10 完成批次 2：

- 按 HTTP 客户端主题补齐 Axios、ky、ofetch 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 335 降至 323；`web-advanced/js-extension` 剩余 72 页。
- 对照 Axios 当前 v1 文档、ky v2.0.2 与 ofetch v1.5.1 官方仓库复核事实，并用本地 Axios 1.16.0 请求链验证拦截器中的 `config.headers` 为 `AxiosHeaders`。
- 修正 Axios 专家页“headers 到 adapter 阶段才规范化”的错误说法，改为拦截器中可直接使用 `AxiosHeaders` 方法。
- 审计器新增顶部版本说明门禁，当前发现 31 页缺版本说明块、30 页虽有说明但没有明确基线；中央登记表逐节点记录文件清单。
- 完整 VitePress 构建成功；桌面端抽查三类页面，移动端 `390×844` 无横向溢出。

批次记录见 `docs/audits/20260710-vitepress-governance-batch-2-http-clients.md`。

2026-07-10 完成批次 3：

- 按日期时间主题补齐 date-fns、Day.js、Luxon 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 323 降至 311；`web-advanced/js-extension` 剩余 60 页。
- 对照 date-fns v3 / v4 发布记录、4.1.0 源码、Day.js 官方插件文档与 Luxon 3.7.2 API 复核事实，并做对应版本的本地运行验证。
- 修正三处原有内容边界：date-fns 反向区间需 `{ assertPositive: true }` 才拒绝、Day.js `.utcOffset()` 属于核心、Luxon `Duration#toHuman()` 可生成人类可读单位列表。
- VitePress 完整构建成功；桌面和移动视口抽查无横向溢出。
- 提交 `59cf85c` 已推送并部署，三个内容页与既有 Prettier 幻灯片线上抽样均为 HTTP 200。

批次记录见 `docs/audits/20260710-vitepress-governance-batch-3-date-libraries.md`。下一子批次继续处理 `web-advanced/js-extension`，每批限制为 3 个技术节点、约 12 页。

2026-07-10 完成批次 4：

- 按工具库主题补齐 Lodash-es、es-toolkit、常用工具库的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 311 降至 299；`web-advanced/js-extension` 剩余 48 页。
- 对照 Lodash、es-toolkit、mitt、qs、JSZip、FileSaver、node-qrcode、chroma.js 与 Marked 官方文档，并在隔离目录安装精确版本做本地行为验证。
- 修正 es-toolkit compat wrapper、`withTimeout` / AbortSignal、并发原语与 memoize 边界，以及 mitt 事件快照、qs 数组阈值和逗号往返、JSZip 安全边界、二维码环境差异、chroma 分位数 API、Marked 18 renderer 签名等旧说法。
- 版本说明未给出明确基线由 30 降至 27；VitePress 完整构建成功，12 个路由在桌面与移动视口共 24 次检查无横向溢出或页面异常。
- 提交 `d002b87` 已推送并部署；三个线上抽样页面均为 HTTP 200，本批未改动或部署 Slidev，未执行 Quiz 生产导入。

批次记录见 `docs/audits/20260710-vitepress-governance-batch-4-utility-libraries.md`。下一子批次继续处理 `web-advanced/js-extension` 剩余 12 个技术节点、48 页，每批限制为 3 个技术节点、约 12 页。

2026-07-10 完成批次 5：

- 按类型安全工具主题补齐 Zod、Valibot、ts-pattern 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 299 降至 287；`web-advanced/js-extension` 剩余 36 页。
- 对照三个项目的官方完整文档导航，并在隔离目录安装 Zod 4.4.3、Valibot 1.4.2、ts-pattern 5.9.0 做发布包和运行时验证。
- 修正 Zod 转换 / 校验顺序与坏相对链接，补充 codec；修正 Valibot `forward` 分类、parser 语义、版本与性能口径；修正 ts-pattern `isMatching` 对未知输入的能力边界并补充 `.narrow()`。
- VitePress 完整构建成功；12 个路由在桌面与移动视口共 24 次检查均为 HTTP 200、无横向溢出或页面异常。
- 提交 `e447714` 已推送并部署；三个内容页与既有 Prettier 幻灯片线上抽样均为 HTTP 200，本批未改动或部署 Slidev，未执行 Quiz 生产导入。

批次记录见 `docs/audits/20260710-vitepress-governance-batch-5-type-safety-libraries.md`。下一子批次继续处理 `web-advanced/js-extension` 剩余 9 个技术节点、36 页，每批限制为 3 个技术节点、约 12 页。

2026-07-11 完成批次 6：

- 按安全边界与标识生成主题补齐 CryptoJS、DOMPurify、Nano ID 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 287 降至 275；`web-advanced/js-extension` 剩余 24 页。
- 对照三个项目官方文档、当前发布包与源码，并在隔离目录安装 CryptoJS 4.2.0、DOMPurify 3.4.11、jsdom 29.1.1、Nano ID 5.1.16 做本地行为验证。
- 修正 CryptoJS 原生随机源、Keccak / NIST SHA-3、KDF 与常量时间比较边界；补齐 DOMPurify 服务端 DOM、Trusted Types、持久 config 与 post-sanitize 风险；修正 Nano ID CommonJS、React key、碰撞与数据库兜底说法。
- 中央优先级由 `P0=1 / P1=259 / P2=64 / P3=3` 更新为 `P0=1 / P1=256 / P2=67 / P3=3`；三个节点速查全部合规，从 P1 降为 P2。
- 最终 VitePress 完整构建成功；12 个路由在桌面与移动视口共 24 次检查均为首个 H2“速查”、8 条要点、0 根页面横向溢出、0 控制台错误。
- 提交 `396e49e` 已推送并部署；三个线上代表页与既有 Prettier 幻灯片均为 HTTP 200，本批未改动或部署 Slidev，未执行 Quiz 生产导入。

批次记录见 `docs/audits/20260711-vitepress-governance-batch-6-security-utilities.md`。下一子批次处理 Decimal.js、Fuse.js、PapaParse；`web-advanced/js-extension` 完成后再切换到下一个 M2 领域。

2026-07-11 完成批次 7：

- 按精确数值、模糊检索与 CSV 数据管线主题补齐 decimal.js、Fuse.js、Papa Parse 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 275 降至 263；`web-advanced/js-extension` 剩余 12 页。
- 对照三个项目官方文档、当前发布包与源码，并在隔离目录安装 decimal.js 10.6.0、Fuse.js 7.4.2、Papa Parse 5.5.4、`@types/papaparse` 5.5.2 做元数据与运行时验证。
- 修正 Decimal 随机数参数、整数除法别名和可审计随机边界；补齐 Fuse token search、官方 FuseWorker、basic 构建与安全高亮；修正 Papa 类型来源、ISO Date / null 转型、流式内存、重复表头和 CSV 公式注入边界。
- 中央优先级由 `P0=1 / P1=256 / P2=67 / P3=3` 更新为 `P0=1 / P1=255 / P2=68 / P3=3`；Fuse.js 降为 P2，decimal.js 与 Papa Parse 因 Slidev 仍为 D 继续保持 P1。
- VitePress 完整构建在 724.44 秒内成功；18 个 HTML 均生成，12 个路由在桌面与移动视口共 24 次检查均为首个 H2“速查”、8 条要点、0 根页面横向溢出、0 控制台错误。
- 提交 `41cc305` 已推送并部署；三个线上代表页与既有 Prettier 幻灯片均为 HTTP 200，本批未改动或部署 Slidev，未执行 Quiz 生产导入。

批次记录见 `docs/audits/20260711-vitepress-governance-batch-7-numeric-search-csv.md`。下一子批次处理 Immer、RxJS、type-fest，完成 `web-advanced/js-extension` 的 M2 速查治理。

2026-07-11 完成批次 8：

- 按不可变状态、响应式数据流与类型工具主题补齐 Immer、RxJS、type-fest 的 `base`、`advanced`、`expert`、`reference` 共 12 页速查，缺失由 263 降至 251；`web-advanced/js-extension` 的速查缺口归零。
- 对照三个项目官方文档、当前发布包、源码与声明，并在隔离目录安装 Immer 11.1.11、RxJS 7.8.2、type-fest 5.8.0、TypeScript 5.9.3 做运行时与 strict 类型验证。
- 修正 Immer draft-only API、异步 draft、预冻结与性能口径；修正 RxJS 退订 / Promise / fetch 取消边界、ValueFrom 与弃用时间线；把 type-fest 更新到 5.x 工具链基线并澄清 Opaque、AsyncReturnType 与 Entries。
- 中央优先级由 `P0=1 / P1=255 / P2=68 / P3=3` 更新为 `P0=1 / P1=254 / P2=69 / P3=3`；RxJS 降为 P2，Immer 与 type-fest 因 Slidev 仍为 D 继续保持 P1。
- VitePress 最终完整构建在 684.47 秒内成功；本地桌面 / 移动抽检无横向溢出或控制台错误，18 个线上页面全部返回 HTTP 200。
- 提交 `7eeea3d` 已推送并部署；本批未改动或部署 Slidev，未执行 Quiz 生产导入。

批次记录见 `docs/audits/20260711-vitepress-governance-batch-8-state-stream-types.md`。下一子批次转入 `frontend-framework/document`，优先处理 docx、docxtemplater、mammoth。

## M3：Slidev 全量治理

自动基线从以下维度给出信号：教学路径、示例质量、视觉表达、分步讲解、交互演示、讲稿和可读性。人工审查通过整套缩略图和关键页实际操作完成。

整改顺序：

1. 前端可视化 27 套。
2. Web 进阶语言 15 套及 Astryx。
3. UI、组件库、框架和编辑器。
4. 测试、工具链、DevOps 和工程化。
5. 其余内容按自动基线从低到高处理。

不机械要求每套使用固定控件。代码主题优先代码演进，架构主题优先关系图，可视化主题优先真实画布，UI 主题优先真实组件状态。

完成标准：所有套件至少达到人工 B 级；可视化和交互主题达到 A 级；全部 build 且 0 溢出。

## M4：Quiz 审计

本地全量检查 JSON 解析、题干、解析、选项、正确答案、分类合法性、重复 stem、技术覆盖和题量。自动规则覆盖每道题，人工语义审查按技术节点推进。

随后只读核查 prod：分类树、题量、重复或孤儿节点、本地题目导入状态。任何修复导入前单独报备并等待确认。

## M5：三仓库一致性收口

逐一解决缺失幻灯片链接、Quiz 分类未匹配、标题与 slug 不一致、Slidev 包名不一致和无归属内容。每个技术节点必须完整映射，或明确记录暂缺原因。

## M6：提交与部署

- 每个逻辑批次独立提交并推送。
- VitePress 部署前执行带 `-v` 的 rsync dry-run，并保留 `--exclude 'SlideStack'`。
- Slidev 只逐包部署本批改动套件。
- Quiz 仅在题目变化且用户确认后执行 prod 增量导入。
- 部署后验证文档、幻灯片、Quiz 分类跳转和 API 响应。

## 交付物

- `docs/audits/content-node-registry.json`：统一机器可读登记表。
- `docs/audits/20260710-content-audit-baseline.md`：M0 汇总报告。
- VitePress、Slidev、Quiz 各自可独立运行的审计命令。
- 后续每批治理记录、构建结果、溢出结果和部署验收记录。
