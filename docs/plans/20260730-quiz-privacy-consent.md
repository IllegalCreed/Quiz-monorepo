# Quiz 隐私、同意与分析命名正规化

> 状态：用户端已验证；后端日志收敛待随题库发布
> 日期：2026-07-30

## Context

Quiz 用户端当前在 `index.html` 中无条件加载 Google Analytics、百度统计和
Google AdSense。站点支持可选注册登录、已登录答题历史、分类偏好、SSE 在线客户端
管理和服务端操作日志，不能复用“无账号、仅本地存储”的静态站隐私文案。

Google Analytics 后台的 Quiz 属性仍沿用 Firebase 自动生成名称
`rootcms-6b924`，Web 数据流名称和协议也未与线上事实对齐。

## 目标

1. GA4 属性统一命名为 `IllegalCreed Quiz`，Web 数据流命名为
   `IllegalCreed Quiz Web`，URL 使用 `https://quiz.illegalscreed.cn`。
2. 未明确允许、明确拒绝、浏览器 DNT/GPC 信号或本地存储异常时，不加载 GA4 和
   百度统计脚本。
3. 同意后只发送经过清洗的标准页面浏览；任意 query/hash、题目、答案、账号标识和
   分类偏好不进入分析 payload。
4. Enhanced Measurement 关闭，避免 GA4 自动采集滚动、出站点击等交互。
5. Google AdSense 在本轮保持失败关闭；在审核通过且 Google 认证的同意管理路径就绪前，
   用户端不加载广告脚本。
6. 新增 Quiz 隐私页、Footer 入口和可随时重新打开的隐私设置。
7. 如实披露账号、答题历史、分类偏好、本地存储、短期在线客户端状态和服务日志边界。
8. 服务端不再把每次答题内容复制进通用操作日志；已登录答题历史仍按产品功能保存。
9. SSE 心跳只发送 pathname，不发送 URL 查询参数。
10. 个人站托管的中英文总隐私政策扩展为四个产品，并单列 Quiz 的账号与服务端数据。

## 设计

### 用户端

- `src/analytics/consent.ts`
  - 三态：`unset | granted | denied`。
  - 持久化异常返回 `unset`，写入失败不关闭提示。
  - 无已存选择时，DNT/GPC 作为默认 `denied`；用户仍可明确覆盖。
- `src/analytics/googleAnalytics.ts`
  - production gate、Measurement ID 校验、脚本单例、撤回停发。
  - `page_location` 仅 pathname 与校验后的四个 UTM 字段。
  - `send_page_view: false` 后手动发送标准 `page_view`。
- `src/analytics/baiduAnalytics.ts`
  - production gate、site ID 校验、脚本单例。
  - 同意后加载；后续路由只发送清洗后的 pathname。
- `src/components/AnalyticsConsent.vue`
  - 拒绝与允许同屏，提供隐私政策链接。
  - 已选择后显示“隐私设置”入口。
- `src/pages/PrivacyPage.vue`
  - 描述账号、浏览器存储、服务端记录、分析、广告和用户选择。
- `index.html`
  - 删除所有无条件第三方统计/广告脚本。

### 后端

- `LoggingInterceptor` 跳过 `/api/answers`，防止把答题内容和结果复制到通用操作日志。
- `AnswerAttempt` 行为不变：游客不持久化；已登录用户按“做题历史”功能保存。

### 中央政策

- 更新 `/Users/zhangxu/workspace/IllegalCreedWebsite/src/{,zh/}privacy.md`。
- 四个产品使用独立 GA4 属性；Quiz 额外使用百度统计。
- 个人站、算法站和第一阶段 Type Pal 不提供账号；Quiz 提供可选账号。

## 测试与验证

1. L3：consent 三态、DNT/GPC、存储失败关闭。
2. L3：GA4 production/ID gate、URL 清洗、脚本单例、页面去重和撤回停发。
3. L3：百度统计 consent gate、脚本单例、路径清洗和撤回停发。
4. L4：首次提示、允许/拒绝、存储失败、隐私信号和重新打开设置。
5. L4：隐私页包含账号、答题历史、在线状态、分析与广告边界。
6. 后端单元：`/api/answers` 不进入通用操作日志。
7. 用户端 lint、type-check、unit、build；后端相关单测。
8. 生产预览：同意前第三方脚本与请求为 0，拒绝后仍为 0；不向真实属性发送测试事件。
9. 部署 Quiz 用户端和个人站后，验证自有域首页/隐私页 HTTP 200。

### 本地验证结果

- `pnpm run check`：四个 workspace lint、type-check、单元测试全部通过。
- Quiz App：22 个 Vitest 文件 / 158 个用例通过；`src/analytics` 覆盖率为
  93.18% statements / 87.17% branches / 84.21% functions / 96.07% lines。
- Quiz Backend：38 个 Jest 文件 / 382 个用例通过。
- Quiz App Cypress：6 个文件 / 52 个用例通过；门禁曾发现首次统计提示遮挡
  注册、分类确认和下一题按钮，增加布局预留并降低提示层级后全绿。
- Quiz App production build：通过。
- 生产预览：未选择和拒绝后均只有站内 bundle，不加载 GA4、百度统计或 AdSense；
  `/privacy` 可访问。为避免污染真实属性，未在预览中点击“允许”，允许路径由依赖注入
  单元测试覆盖。
- 个人站中英文隐私政策专项测试：2 个文件 / 4 个用例通过。
- 个人站全量 VitePress 构建：3,176 页构建及 sitemap 生成通过。
- 发布边界复核：14 个未推送题库提交没有修改 `apps/quiz-app`，因此 Quiz
  用户端可独立部署；后端日志收敛补丁会与题库后端代码一起等待 Owner 确认。上线隐私
  文案在此之前保守披露通用日志仍可能包含答题提交和结果元数据，避免描述超前。
- Quiz 用户端已部署至 `https://quiz.illegalscreed.cn`：首页与 `/privacy` 均返回
  HTTP 200；线上 HTML 已使用 `IllegalCreed Quiz`，且不包含 GA4、百度统计或 AdSense
  的第三方脚本 URL。未点击“允许”，未向真实属性发送测试事件。

## 非目标

- 不修改 GA Property ID、Measurement ID、历史数据、时区或币种。
- 不读取或输出 Google/Firebase/百度账号凭据。
- 不启用个性化广告，不代替 Google 认证 CMP。
- 不改管理后台、题库内容、数据库 schema 或第二阶段 Type Pal 引擎。
