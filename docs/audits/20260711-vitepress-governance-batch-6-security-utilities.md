# VitePress M2 速查治理批次 6

> 日期：2026-07-11
> 范围：CryptoJS、DOMPurify、Nano ID
> 结论：安全边界与标识生成子批次门禁通过，已提交、推送并部署生产环境；M2 仍在进行。

## 内容结果

| 技术      | 版本基线 | 补齐页面 | 速查要点数 |
| --------- | -------- | -------: | ---------: |
| CryptoJS  | 4.2.0    |        4 |         32 |
| DOMPurify | 3.4.11   |        4 |         32 |
| Nano ID   | 5.1.16   |        4 |         32 |

每个节点补齐 `guide-line/base.md`、`guide-line/advanced.md`、`guide-line/expert.md` 与 `reference.md`，共 12 页；同步修正三个节点的概览页和入门页，使版本、运行时要求与安全边界一致。速查覆盖随机源、哈希与认证、KDF、AEAD、allowlist、Trusted Types、服务端 DOM、模块互操作、碰撞概率、React key 与数据库唯一性兜底。

速查审计变化：

| 指标                             | 批次前 | 批次后 |
| -------------------------------- | -----: | -----: |
| 缺失速查                         |    287 |    275 |
| 位置异常                         |      0 |      0 |
| 空速查                           |      0 |      0 |
| `web-advanced/js-extension` 缺失 |     36 |     24 |
| 版本说明缺失                     |     31 |     31 |
| 版本说明未给出明确基线           |     27 |     27 |

测试题链接仍为 327/327。中央审计仍为 327 个技术节点、Quiz 326/327、Slidev 327/327；三个本批节点从 P1 降为 P2，优先级更新为 `P0=1 / P1=256 / P2=67 / P3=3`。

## 事实复核与修正

- CryptoJS：按官方 README、GitBook、4.2.0 发布包源码与安全公告复核维护状态、随机数、PBKDF2、EvpKDF、AES 与哈希实现。修正“随机源偏弱”的旧说法：4.x 委托给原生 `getRandomValues` / `randomBytes`，不可用时抛错，不回退 `Math.random()`。补明 `CryptoJS.SHA3` 实际是历史误命名的 Keccak[c=2d]，与 NIST SHA-3 结果不同；4.2.0 的 PBKDF2 默认是 SHA-256 / 250000 次，但 AES 字符串口令模式仍走 MD5 / 1 次的 EvpKDF。
- CryptoJS 安全边界：删除自写 JavaScript “常量时间比较”示例，改为 Node `crypto.timingSafeEqual` / Web Crypto `subtle.verify`；明确 CBC / CTR 等不提供认证标签、库不支持 GCM / CCM，新系统优先平台 AES-GCM。OpenSSL 互通改为显式对齐 KDF、摘要、salt 与模式，不再暗示可依赖不同版本的命令默认值。
- DOMPurify：版本基线更新到 3.4.11，并按官方 README、SECURITY、发布包类型与 jsdom 29.1.1 运行探针复核。补上净化后再改写 markup 会使保证失效、`DOMPurify.removed` 不能用于安全决策、`setConfig()` 后单次 config 会被忽略、`RETURN_TRUSTED_TYPE` 在无 Trusted Types 环境会回退字符串，以及 `isSupported` 必须 fail closed。
- DOMPurify 服务端边界：明确服务端 DOM 属于可信计算基，必须保持 jsdom 最新；官方当前不推荐与 happy-dom 组合。iframe 示例改用 `URL` 解析、HTTPS + 精确 hostname + `/embed/` 路径校验，并固定 sandbox / referrer policy，不再只靠正则匹配前缀。
- Nano ID：按 5.1.16 发布包、官方 README 与源码复核 `engines.node = ^18 || >=20`、exports、CSPRNG、随机池、拒绝采样和类型声明。本地 Node 22.19 验证 CommonJS 可直接 `require('nanoid')`；文档改为 Node 22.12+ 直载、Node 20 使用官方实验标志、Node 18 动态 import 或 nanoid 3，不再笼统写成“5.x 不能 require”。
- Nano ID 工程边界：删除把随机 ID 用作 React render key 的错误建议，改为稳定数据 ID / `useId`；强调默认 126 bit 只是碰撞概率模型而非唯一性承诺，数据库仍需大小写敏感唯一索引与冲突重试。同步补充 seeded `customRandom` 不适合安全用途、`nanoid<OpaqueType>()` 类型能力与 UUID v7 / ULID 的时间有序选型边界。

主要来源：

- [CryptoJS 官方仓库与维护状态](https://github.com/brix/crypto-js)
- [CryptoJS 官方文档](https://cryptojs.gitbook.io/docs/)
- [CryptoJS PBKDF2 安全公告](https://github.com/brix/crypto-js/security/advisories/GHSA-xwcq-pm8m-c4vf)
- [DOMPurify 官方 README](https://github.com/cure53/DOMPurify/blob/main/README.md)
- [DOMPurify 安全策略](https://github.com/cure53/DOMPurify/blob/main/SECURITY.md)
- [Nano ID 官方 README](https://github.com/ai/nanoid/blob/main/README.md)
- [Nano ID 5.x 实现](https://github.com/ai/nanoid/blob/main/index.js)

## 验证结果

```bash
pnpm run content:audit
# Quick check missing/misplaced/empty: 275/0/0
# Version missing/unspecified: 31/27
# Quiz links missing/invalid: 0/0

pnpm run docs:build
# build complete in 858.02s
```

- 在隔离临时目录安装 CryptoJS 4.2.0、DOMPurify 3.4.11、jsdom 29.1.1、Nano ID 5.1.16 与 `@types/crypto-js`，核对发布包元数据、源码默认值和导出条件，并运行 Keccak / SHA-3 差异、安全随机、DOM 净化、返回类型、持久 config 与 CJS / ESM 互操作探针。
- 最终完整 VitePress 构建成功，12 个目标 HTML 全部生成；首次全量构建耗时 767.18 秒，最终措辞收紧后重新构建耗时 858.02 秒，退出码均为 0。
- 本地预览逐页检查 12 个目标路由，桌面 `1440×1000` 与移动 `390×844` 共 24 次访问；每页首个 H2 均为“速查”、速查均为 8 条、根页面横向溢出为 0、控制台错误为 0。
- 人工检查 DOMPurify 进阶桌面页与 Nano ID 专家移动页；顶部版本说明、速查长行、行内代码、侧栏和正文均无重叠或截断。

## 提交与部署

- VitePress 提交：`396e49e docs: audit security utility libraries`，已推送 `origin/main`。
- checksum dry-run 使用 `-azcvn --delete --exclude 'SlideStack'`；删除项 0、`SlideStack` 命中 0，目标页面与新哈希资源均在同步清单中。
- 正式 checksum 同步成功退出；未触碰 SlideStack。
- CryptoJS 参考、DOMPurify 进阶、Nano ID 专家三个线上页面及既有 Prettier 幻灯片均返回 HTTP 200；生产 HTML 命中 4.2.0 / Keccak、3.4.11 / happy-dom、5.1.16 / Node 22.12 等本批标记。
- 本批没有改动 Slidev 或 Quiz 题目，未执行 Slidev 部署、生产题库导入、数据库清理或分类变更。

## 下一批

`web-advanced/js-extension` 尚有 6 个技术节点、24 页缺失速查。下一子批次优先处理 Decimal.js、Fuse.js、PapaParse 三个“数值、检索与表格解析”节点；最后一批处理 Immer、RxJS、type-fest，并继续保持官方文档、精确版本本地验证、完整构建、双视口验收与独立部署门禁。
