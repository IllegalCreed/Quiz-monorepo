# Quiz Monorepo - 技术开发指南

> 本文档面向 AI 助手，描述项目架构、已实现功能的技术细节，以及待开发功能的详细计划。
> 产品需求与路线图见 [docs/product.md](./product.md)。

---

## Monorepo 架构

```
quiz-monorepo/
├── apps/quiz-app/         # 用户端答题 (Vue 3, 端口 10000)
├── apps/quiz-admin/       # 管理后台 (Vue 3 + Element Plus, 端口 10050)
├── apps/quiz-backend/     # 后端 API (NestJS + Prisma 7 + MySQL, 端口 10020)
└── packages/ui/           # 共享 UI 组件库 (Storybook 端口 10030)
```

---

## 数据库 Schema

### 现有模型

**Admin / Role**（管理员与权限）

- `Admin`：id, username, password(bcrypt), nickname, roleId, status(ACTIVE/DISABLED)
- `Role`：id, name, description, isSystem, menuPermissions(Json), apiPermissions(Json)

**Question / Option / AnswerAttempt**（题目）

- `Question`：id, stem, type, explanation?, tags(Json?), deletedAt?(软删除)
- `Option`：id, questionId, text, isCorrect, description?(选项解析)
- `AnswerAttempt`：id, questionId, selectedOption, correct, elapsedMs?, userId?, createdAt

**Category / CategoryGroup / QuestionCategory**（多维度分类）

- `CategoryGroup`：id, name, sort — 维度（如"技术方向"/"难度"）
- `Category`：id, name, groupId, parentId?, sort, **isDefault** — 支持无限层级
- `QuestionCategory`：questionId + categoryId — **categoryId 必须指向叶子节点**

**User / UserPreference**（用户）

- `User`：id, username, password(bcrypt), email?, nickname?, status, createdAt
- `UserPreference`：userId + categoryId — **categoryId 必须指向叶子节点**

**SystemLog**（系统日志）

- `SystemLog`：id, type(LOGIN/API_MUTATION), action, module, actorType(ADMIN/USER), actorId?, actorName, ip?, params(Json?), result(Json?), success, createdAt

### 通识节点机制（叶子节点约束）

> **核心原则**：`QuestionCategory` 和 `UserPreference` 只存叶子 ID，查询直接匹配，无需递归。

- `isDefault=true` 标记通识节点，名称固定 `"通识"`，前端拼接父名显示（`"前端通识"`）
- **创建子分类**（叶子→非叶子）：事务中自动创建通识 + 迁移 `QuestionCategory`/`UserPreference` → 通识
- **删除子分类**：拒绝删通识/有题目的/有子节点的；只剩通识时自动回收 + 迁移数据回父节点
- 通识不可删除/改名/移动，`sort: 9999`，管理端灰色/斜体区分
- 题目编辑分类选择器只展示叶子节点

---

## quiz-backend（后端）

### 目录结构

```
src/
├── app.module.ts            # 根模块（全局守卫 + 过滤器 + 拦截器）
├── prisma/                  # PrismaModule + PrismaService
├── common/
│   ├── decorators/          # @Public, @RequirePermission, @CurrentUser, @SkipTransform
│   ├── filters/             # HttpExceptionFilter（统一错误格式）
│   └── interceptors/        # TransformInterceptor + LoggingInterceptor
├── auth/                    # JWT 认证（策略 + 守卫）
├── admins/                  # 管理员 CRUD
├── roles/                   # 角色 CRUD
├── permissions/             # 权限列表查询
├── questions/               # 公开题目接口（随机、答题）
├── answers/                 # 答案提交（支持 userId 关联）
├── admin-questions/         # 管理员题目 CRUD
├── admin-categories/        # 管理员分类 CRUD
├── app-users/               # App 用户管理（管理端）
├── user-auth/               # 用户认证（注册/登录/信息）
├── user-profile/            # 用户自服务（历史+偏好）
├── categories/              # 公开分类接口
├── system-logs/             # 系统日志模块
├── clients/                 # SSE 客户端管理（实时监控+广播）
└── test/                    # 测试重置接口（仅测试环境）
```

### 全局机制

| 机制     | 类                     | 说明                                                        |
| -------- | ---------------------- | ----------------------------------------------------------- |
| JWT 认证 | `JwtAuthGuard`         | 全局，`@Public()` 跳过                                      |
| 权限检查 | `PermissionGuard`      | 匹配 `@RequirePermission("xxx:yyy")`，超管 `["*"]` 直接放行 |
| 异常格式 | `HttpExceptionFilter`  | 统一 `{ statusCode, message, error }`                       |
| 响应格式 | `TransformInterceptor` | 包装为 `{ code: 0, data, message }`，`@SkipTransform` 跳过  |
| 操作日志 | `LoggingInterceptor`   | 拦截 POST/PATCH/PUT/DELETE，过滤敏感字段，非阻塞写入        |

### 已实现 API 端点（41 个）

| 模块            | 前缀                 | 端点数                             |
| --------------- | -------------------- | ---------------------------------- |
| Auth            | `/admin/auth`        | 3（login / refresh / logout）      |
| Admins          | `/admin/admins`      | 5（CRUD + 状态切换）               |
| Roles           | `/admin/roles`       | 5（CRUD）                          |
| Permissions     | `/admin/permissions` | 2（菜单列表 + API 列表）           |
| AdminQuestions  | `/admin/questions`   | 5（CRUD，软删除）                  |
| AdminCategories | `/admin/categories`  | 7（维度 CRUD + 树形节点 CRUD）     |
| AppUsers        | `/admin/app-users`   | 6（列表/详情/历史/偏好/状态/删除） |
| Clients         | `/admin/clients`     | 2（在线列表 + 广播推送）           |
| UserAuth        | `/api/user/auth`     | 3（register / login / info）       |
| UserProfile     | `/api/user`          | 3（history / preferences GET+PUT） |
| Categories      | `/api/categories`    | 1（公开分类树 groups）             |
| Questions       | `/api/questions`     | 2（随机题目，支持 categoryIds）    |
| Answers         | `/api/answers`       | 1（提交答案，支持 userId）         |
| Clients(public) | `/api/clients`       | 2（SSE stream + 心跳）             |
| Test            | `/api/test/reset`    | 1（E2E 数据重置，仅测试环境）      |

---

## quiz-admin（管理后台）

### 目录结构

```
src/
├── api/
│   ├── mock/               # Mock API（account/users/admins/questions/categories/clients/system-logs）
│   └── {module}.ts         # 真实 API 调用
├── components/history-tab/ # Tab 历史组件
├── composables/            # use-token.ts, use-mock-store.ts
├── router/
│   ├── index.ts            # 路由守卫 + 动态路由加载
│   ├── home-routes.ts      # 业务页面路由定义
│   └── permission-routes-mapping.ts  # 菜单权限 → 路由名称映射
├── stores/modules/         # account.ts, menu.ts, router.ts
├── styles/                 # Element Plus 深色模式 + 主题变量
├── types/                  # permission.ts, category.ts, question.ts
└── views/                  # login/master/dashboard/users/admins/roles/permissions/questions/categories/system/clients
```

### 关键技术实现

**CSS 导入顺序**（`main.ts`，不可改）：`styles/index.scss` → `styles/main.scss` → Element Plus 弹窗 CSS → `virtual:uno.css`（最后=最高优先级）

**超级管理员通配符** `["*"]`：在 `jwt.strategy.ts`（解析）、`stores/menu.ts`（菜单过滤）、`dynamic-routes.ts`（路由生成）三处处理。

**keep-alive + 列表刷新**：详情页不设 `meta.componentName` 不参与缓存。列表刷新用 VueUse `useEventBus`。

### 添加新页面的标准流程

1. 创建 `src/views/{module}/{module}-view.vue`
2. `home-routes.ts` 添加路由（列表页加 `componentName`，详情页不加）
3. `types/permission.ts` — `ALL_MENU_PERMISSIONS` + `ALL_API_PERMISSION_GROUPS` 新增条目
4. `permission-routes-mapping.ts` 配置映射
5. `stores/modules/menu.ts` 添加菜单项
6. （可选）`api/mock/{module}.ts` 创建 Mock API
7. 操作按钮加 `v-permission="'module:action'"`
8. `seed-admin.ts` 的 `superAdminApiPermissions` 添加 `"module:*"`（create + update 部分都要）
9. `api/mock/roles.ts` Mock 角色添加新权限
10. re-seed：`db:seed:dev` + `db:reset:test` + `db:seed:prod`

---

## quiz-app（用户端）

### 目录结构

```
src/
├── pages/quiz-page.vue       # 主答题页
├── components/               # AuthDialog, UserDropdown, HistoryDrawer, CategorySelector, LoginPrompt
├── composables/              # useQuiz, useTheme, useAuthDialog, useCategories, useHistory, useSse
├── stores/useUserStore.ts    # 用户认证状态
├── api/                      # questions, auth, categories, user-profile
└── utils/request.ts          # 统一请求封装（自动注入 token）
```

### 核心流程

- **答题**：随机获取题目 → 点击选项提交 → 答对自动跳转/答错手动下一题
- **用户系统**：对话框登录（不中断答题）、游客可直接答题（OptionalUserJwtGuard）
- **分类筛选**：Miller Columns 选择器 + 三态选中，已登录同步后端/游客存 localStorage
- **答题历史**：右侧抽屉面板，无限滚动
- **SSE**：自动建立连接，接收 refresh（reload）/announcement（toast），路由变更/登录/退出时发心跳

---

## packages/ui（共享组件库）

| 组件                                              | 说明                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `CheckRadio` / `CheckRadioGroup`                  | 单选题选项（correct/incorrect 状态、键盘导航）                       |
| `BaseButton`                                      | 按钮（variant: default/outline/ghost, size: sm/md/lg）               |
| `BaseCard` / `BaseCardHeader` / `BaseCardContent` | 可组合卡片                                                           |
| `ThemeToggle`                                     | 暗色/亮色切换（VueUse useDark）                                      |
| `BaseDialog`                                      | 对话框+抽屉（`placement`: center/right/left），共享遮罩/Esc/焦点管理 |
| `BaseInput`                                       | 输入框（label/error/password toggle）                                |
| `BasePopover`                                     | 弹出面板（onClickOutside 关闭）                                      |
| `ColumnSelector`                                  | Miller Columns 分栏选择器（树形多选、三态选中、搜索+已选摘要）       |
| `BaseTag`                                         | 标签（多色变体、确定性着色 `getTagColor()`、removable）              |

详细 Props/Events/Slots 见各组件源码。Storybook 交互测试（Playwright）覆盖所有组件。

---

## 已完成功能摘要

1. ~~App 端用户系统（Phase 2A~2E）~~ ✅ — UI 组件 + 认证系统 + 历史/分类/引导 + E2E
2. ~~用户管理~~ ✅ — 后端 `user-auth` + `app-users`，前端列表+详情
3. ~~系统日志~~ ✅ — LoggingInterceptor 全局拦截 + 登录日志 + 管理端筛选视图
4. ~~SSE 客户端管理~~ ✅ — 后端 clients 模块 + quiz-app useSse + quiz-admin 管理页
5. ~~Dashboard 数据可视化~~ ✅ — 后端聚合接口 + Chart.js 图表（答题趋势/分类分布/正确率排名）
6. ~~生产部署~~ ✅ — Nginx HTTPS 反向代理 + PM2 + 一键部署脚本 + GA4 流量统计
7. ~~生产安全加固~~ ✅ — 登录页隐藏测试账号 + JWT 环境变量修复 + 游客引导弹窗优化

---

## 生产环境部署

### 架构

```
                        ┌─ quiz.illegalscreed.cn ──────→ /var/www/quiz-app/dist (静态)
用户 → Nginx (HTTPS) ──┤─ quiz-admin.illegalscreed.cn → /var/www/quiz-admin/dist (静态)
                        └─ quiz-api.illegalscreed.cn ──→ 127.0.0.1:10020 (PM2 + NestJS)
```

### 关键配置

- **HTTPS**：Let's Encrypt 证书（Certbot 自动续期）
- **PM2**：`/root/server/quiz-backend/ecosystem.config.js`（环境变量直接写在 env 块中，避免 NestJS 模块初始化时 `process.env` 为空的问题）
- **部署脚本**：`scripts/deploy.sh [app|admin|backend|all]` — 本地构建 → scp 上传 → 远程安装/迁移/重启
- **SPA 路由**：Nginx `try_files $uri $uri/ /index.html` 支持客户端路由

### 生产环境踩坑记录

**JWT 401 问题**：`JwtModule.register({ secret: process.env.JWT_SECRET })` 在 NestJS 模块加载时执行，早于 `main.ts` 的 `dotenv.config()`，导致 secret 为 `undefined`。解决方案：将所有环境变量写入 PM2 的 `ecosystem.config.js` env 块。

**UnoCSS 图标生产构建不加载**：pnpm 严格依赖隔离下 `presetIcons` 自动发现机制失效。解决方案：在 `uno.config.ts` 中显式导入 `import { icons as carbonIcons } from "@iconify-json/carbon"` 并传入 `collections: { carbon: () => carbonIcons }`。参考 [unocss#2905](https://github.com/unocss/unocss/issues/2905)。

---

## 待实现功能

### 商业化 + 增强

- **百度统计**：国内流量统计接入
- **广告接入**：Carbon Ads / Google AdSense（需流量达标）
- **批量导入题目**：JSON 文件上传，复用 `seed-test.json` 数据结构
- **个人学习报告**：正确率、弱项分析
- **题目预览**：管理后台预览题目样式，对齐 quiz-app 风格

---

## 实施顺序

1. ~~DB Schema + 迁移~~ ✅
2. ~~用户认证 + 用户管理~~ ✅
3. ~~UI 组件 + App 认证~~ ✅
4. ~~后端新接口 + 叶子节点约束~~ ✅
5. ~~App 历史 + 分类 + E2E~~ ✅
6. ~~系统日志~~ ✅
7. ~~SSE 客户端管理~~ ✅
8. ~~Dashboard 数据可视化~~ ✅
9. ~~生产部署 + 安全加固 + GA4~~ ✅
10. **商业化 + 增强**（广告接入、百度统计、批量导入等） ← 下一阶段

---

_最后更新: 2026-03-10_
