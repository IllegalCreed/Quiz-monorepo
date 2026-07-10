# VitePress M2 速查治理批次 3

> 日期：2026-07-10
> 范围：date-fns、Day.js、Luxon
> 结论：日期时间库子批次门禁通过，已提交、推送并部署生产环境；M2 仍在进行。

## 内容结果

| 技术     | 版本基线          | 补齐页面 | 速查要点数 |
| -------- | ----------------- | -------: | ---------: |
| date-fns | 4.x（含 4.1）     |        4 |         30 |
| Day.js   | 1.11.x            |        4 |         31 |
| Luxon    | 3.x（核验 3.7.2） |        4 |         31 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页。速查分别覆盖不可变语义、格式与解析、locale、区间与时长、UTC / IANA 时区、插件依赖、有效性模型、Intl / ICU 边界和迁移选型。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    323 |    311 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     72 |     60 |

版本说明问题保持为缺失 31 页、未给出明确基线 30 页；测试题链接仍为 327/327。

## 事实复核与修正

- date-fns：按 v3 发布记录、v4 时区公告、v4.1.0 源码与 `@date-fns/tz` 官方仓库核对区间、Duration、类型归一化和 `in` 上下文。本地运行 date-fns 4.1.0 证明 `interval(start, end)` 默认允许反向端点，只有 `{ assertPositive: true }` 才会拒绝。本批同步修正速查、进阶正文和专家迁移清单中的旧说法。
- Day.js：按官方 Timezone、Duration、IsoWeeksInYear 文档核对插件边界，并使用 Quiz 仓库实际安装的 Day.js 1.11.20 验证。`.utcOffset()` 是核心方法，UTC 插件提供的是 `dayjs.utc()`、`.utc()`、`.local()` 与 `.isUTC()`；本批同步修正基础页。运行验证也确认默认时区只影响 `dayjs.tz()`、Duration `humanize()` 依赖 RelativeTime、IsoWeeksInYear 依赖 IsLeapYear。
- Luxon：按官方 3.7.2 API 与本地独立运行核对 `Duration#toHuman()`、`showZeros`、`Info.features()`、`keepLocalTime` 和格式 locale。修正原专家页“没有 Duration humanize 等价能力”的绝对说法，明确 `toHuman()` 是单位列表，和 Moment 的模糊量级、DateTime 相对时间语义不同。

主要来源：

- [date-fns v3.0.0 发布记录](https://github.com/orgs/date-fns/discussions/3603)
- [date-fns v4 时区公告](https://blog.date-fns.org/v40-with-time-zone-support/)
- [date-fns 4.1.0 interval 源码](https://github.com/date-fns/date-fns/blob/v4.1.0/src/interval/index.ts)
- [Day.js Timezone](https://day.js.org/docs/en/plugin/timezone)
- [Day.js Duration humanize](https://day.js.org/docs/en/durations/humanize)
- [Luxon 3.7.2 API](https://moment.github.io/luxon/api-docs/index.html)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 311/0/0
# Version missing/unspecified: 31/30
# Quiz links missing/invalid: 0/0

pnpm docs:build
# build complete in 688.48s
```

- 12 个目标 HTML 全部生成。
- 浏览器抽查 date-fns 进阶、Day.js 基础与 Luxon 专家页；首个 H2 均为“速查”。
- 桌面 `1280×900` 与移动 `390×844` 下均无横向溢出，移动端 `scrollWidth = 390`。
- 中央审计为 327 个技术节点、Quiz 326/327、Slidev 327/327，优先级为 `P0=1 / P1=259 / P2=64 / P3=3`。

## 提交与部署

- VitePress 提交：`59cf85c docs: add date library quick checks`，已推送 `origin/main`。
- rsync dry-run 使用 `--delete --exclude 'SlideStack'`；`SlideStack` 命中 0，112 个删除项全部是 `assets/` 下被新 hash 替代的旧 JS。
- 正式同步使用 checksum 模式，实际传输 2174 个文件；未触碰 SlideStack。
- date-fns、Day.js、Luxon 三个线上页面及 `/SlideStack/prettier-slide/` 均返回 HTTP 200，并包含预期内容。

验收域名使用 `https://illegalscreed.cn`。`https://www.illegalscreed.cn` 当前证书不包含 `www` 主机名，curl 会报 SAN 不匹配；这是独立运维问题，不是本批内容部署引入。

## 下一批

`web-advanced/js-extension` 尚有 15 个技术节点、60 页缺失速查。后续继续按每批 3 个技术节点、约 12 页推进，不做无事实核验的模板注入。
