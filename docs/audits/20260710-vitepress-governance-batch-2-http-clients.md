# VitePress M2 速查治理批次 2

> 日期：2026-07-10
> 范围：Axios、ky、ofetch；版本说明审计门禁
> 结论：HTTP 客户端子批次门禁通过；M2 仍在进行，未部署生产环境。

## 内容结果

| 技术   | 版本基线 | 补齐页面 | 速查要点数 |
| ------ | -------- | -------: | ---------: |
| Axios  | 1.x      |        4 |         32 |
| ky     | 2.0.2    |        4 |         31 |
| ofetch | 1.x      |        4 |         31 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页、94 个页面专属要点。内容分别覆盖实例与默认值、生命周期、重试与超时、错误模型、类型边界、运行时差异及参考 API，没有复用统一模板正文。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    335 |    323 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     84 |     72 |

## 事实复核

- Axios：官方文档确认实例隔离、拦截器顺序、`AxiosHeaders`、`AbortController`、三类内置 adapter 与 XSRF 配置。Quiz 锁文件实际解析到 Axios 1.16.0；本地自定义 adapter 请求链验证请求拦截器中的 headers 是 `AxiosHeaders`，`.set()` 可直接写入。
- ky：按官方 v2.0.2 tag 核对 `baseUrl` / `prefix`、五类 hooks、retry、双重 timeout、错误体 `data`、Standard Schema 与 ESM / Node 版本边界。
- ofetch：按官方 v1.5.1 tag 与本地锁文件核对解析、写方法默认不重试、timeout、四类 hooks、raw `_data`、dispatcher 和同构入口；没有混入 main 分支的 v2 alpha 行为。

主要来源：

- [Axios 请求配置](https://axios.rest/pages/advanced/request-config)
- [Axios 拦截器与 AxiosHeaders](https://github.com/axios/axios)
- [ky v2.0.2](https://github.com/sindresorhus/ky/tree/v2.0.2)
- [ofetch v1.5.1](https://github.com/unjs/ofetch/tree/v1.5.1)

复核过程中修正一处原有错误：Axios 专家页曾称 `config.headers` 要到 adapter 阶段才变为 `AxiosHeaders`。官方文档与本地 Axios 1.16.0 运行结果均表明，它在请求拦截器中已初始化，可直接调用 `.set()`、`.setContentType()` 等方法。

## 审计增强

VitePress 审计器新增顶部版本说明检测：

- `missing`：H1 后没有说明块。
- `unspecified`：有说明块，但没有“基于 / 截至 / 适用”、`vN`、语义版本、技术名 + 主版本或明确运行时基线。
- 明确排除普通计数，避免把“7 个库”误判为版本号。

当前结果为 31 页缺版本说明块、30 页未给出明确基线。问题已写入独立 VitePress 报告和三仓库节点登记表，作为后续 M2 修复队列。

## 验证结果

```bash
node scripts/audit-vitepress-content.mjs
# Quick check missing/misplaced/empty: 323/0/0
# Version missing/unspecified: 31/30
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 715.64s
```

- 三类抽查页面均生成 HTML：Axios 专家页、ky 基础页、ofetch 参考页。
- 桌面视口 `1280` 宽：H1 后的首个 H2 均为 `速查`，随后才进入正文；未出现内容与目录重叠。
- 移动视口 `390×844`：主内容宽 342px，`scrollWidth = clientWidth = 390`，速查长行正常换行。
- 中央 `pnpm run content:audit` 成功，当前优先级为 `P0=1 / P1=260 / P2=63 / P3=3`。

下一子批次处理 date-fns、Day.js、Luxon 的 12 个缺失页。本批没有 Quiz 题目变化、prod 导入、rsync 或线上部署。
