# VitePress M2 速查治理批次 5

> 日期：2026-07-10
> 范围：Zod、Valibot、ts-pattern
> 结论：类型安全工具子批次门禁通过，已提交、推送并部署生产环境；M2 仍在进行。

## 内容结果

| 技术       | 版本基线 | 补齐页面 | 速查要点数 |
| ---------- | -------- | -------: | ---------: |
| Zod        | 4.4.3    |        4 |         32 |
| Valibot    | 1.4.2    |        4 |         32 |
| ts-pattern | 5.9.0    |        4 |         32 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步修正三个节点的概览页和入门页，使版本、安装要求和能力边界保持一致。速查覆盖解析结果、输入输出类型、对象额外键、默认值、pipeline 顺序、错误结构、异步传播、tree-shaking、模式组合、数据提取、穷尽检查和 schema / 控制流分工。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    299 |    287 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     48 |     36 |
| 版本说明缺失                     |     31 |     31 |
| 版本说明未给出明确基线           |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327，优先级保持 `P0=1 / P1=259 / P2=64 / P3=3`。

## 事实复核与修正

- Zod：按 4.4.3 发布包和官方完整导航核对 schema、错误、元数据、JSON Schema、codec 与库作者接口。精确版本探针证明 `z.email().trim()` 会先校验后转换，带首尾空白的邮箱仍失败；正文改为 `z.string().trim().pipe(z.email())` 明确先转换再校验。同步补充双向 `z.codec`、TypeScript 5.5+ / `strict` 要求，并修复进阶页原有重复 `guide-line/guide-line` 的坏相对链接。
- Valibot：版本更新到 1.4.2，并按发布包确认 ES2020、TypeScript 5.0.2、零依赖、ESM / CommonJS 与 `sideEffects: false`。修正 `forward` 的分类：它是包装 validation action 并转发 issue 路径的 method；实际判断仍由 `check` / `partialCheck` 等 action 完成。把 `parser` 从“预编译”改为“固化 schema 与 config 的可复用函数”，避免暗示会生成专用校验代码。
- Valibot 本地探针同时确认 `safeParse` 的三态：基础类型正确但 pipeline 失败时为 `typed: true, success: false` 且仍有 output；对象缺失 optional 键时不执行 pipeline，提供默认值后会继续执行。官方 bundle 数字改为“特定登录 schema 与打包器快照”，不再写成普遍体积承诺。
- ts-pattern：按 5.9.0 发布包与官方 README 的完整 API 核对 `match`、`P.*`、`isMatching`、`.narrow()` 与 `.exhaustive(handler)`。修正“完全不验证未知输入”的绝对说法：`isMatching` 能对 `unknown` 做布尔式结构校验并收窄，但不提供 schema 库的错误树、转换和默认值。专家页新增 `.narrow()` 深度排除已处理组合的示例。

主要来源：

- [Zod 文档导航与要求](https://zod.dev/)
- [Zod Schema API](https://zod.dev/api)
- [Zod Codecs](https://zod.dev/codecs)
- [Zod JSON Schema](https://zod.dev/json-schema)
- [Valibot 安装要求](https://valibot.dev/guides/installation/)
- [Valibot 对比与性能](https://valibot.dev/guides/comparison/)
- [Valibot optional](https://valibot.dev/api/optional/)
- [Valibot parser](https://valibot.dev/api/parser/)
- [Valibot 从 Zod 迁移](https://valibot.dev/guides/migrate-from-zod/)
- [ts-pattern 官方仓库与 API](https://github.com/gvergnaud/ts-pattern)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 287/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 737.47s
```

- 在隔离临时目录安装 Zod 4.4.3、Valibot 1.4.2、ts-pattern 5.9.0，核对发布包元数据并运行 pipeline 顺序、metadata 不可变性、codec、safeParse 三态、optional 默认值、parser、isMatching、exhaustive fallback 与 narrow 行为探针。
- 12 个目标 HTML 全部生成；18 个变更页的相对链接全部可解析。
- Playwright 逐页检查 12 个目标路由，桌面 `1440×1000` 与移动 `390×844` 共 24 次访问均为 HTTP 200；每页速查均为 8 条，根节点横向溢出为 0，控制台与页面异常为 0。
- 人工检查 Zod 基础桌面页、Valibot 参考移动页和 ts-pattern 专家移动页；最终截图等待完整水合与 network idle，速查、表格、行内代码和正文排版正常。

## 提交与部署

- VitePress 提交：`e447714 docs: audit type safety libraries`，已推送 `origin/main`。
- rsync dry-run 使用 `-v --delete --exclude 'SlideStack'`；删除项 0、非资源删除项 0、`SlideStack` 命中 0。
- 正式 checksum 同步成功退出；未触碰 SlideStack。
- Zod 基础、Valibot 专家、ts-pattern 专家三个线上页面及既有 Prettier 幻灯片均返回 HTTP 200，并包含预期内容标记。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入或数据库清理。

## 下一批

`web-advanced/js-extension` 尚有 9 个技术节点、36 页缺失速查。后续继续按每批 3 个技术节点、约 12 页推进，并保持“官方文档、精确版本本地验证、完整构建、双视口验收、独立部署”的门禁。
