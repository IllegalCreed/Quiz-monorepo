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

| 层级     | 技术                                        |
| -------- | ------------------------------------------- |
| 前端     | Vue 3 Composition API + Vite + Pinia + SCSS |
| 管理后台 | Vue 3 + Element Plus + UnoCSS + Pinia       |
| 后端     | NestJS + Prisma 7 + MySQL (MariaDB adapter) |
| 测试     | Vitest / Jest (单元) + Cypress (E2E)        |
| 包管理   | pnpm workspace + Turborepo                  |

---

## 数据库 Schema

### 现有模型

**Admin / Role**（管理员与权限）

- `Admin`：id, username, password(bcrypt), nickname, roleId, status(ACTIVE/DISABLED)
- `Role`：id, name, description, isSystem, menuPermissions(Json), apiPermissions(Json)

**Question / Option / AnswerAttempt**（题目）

- `Question`：id, stem, type(default:"single_choice"), explanation?, tags(Json?), deletedAt?(软删除)
- `Option`：id, questionId, text, isCorrect, description?(选项解析)
- `AnswerAttempt`：id, questionId, selectedOption, correct, elapsedMs?, createdAt — 目前 MVP 阶段未与用户关联

**Category / CategoryGroup / QuestionCategory**（多维度分类）

- `CategoryGroup`：id, name, sort — 维度（如"技术方向"/"难度"）
- `Category`：id, name, groupId, parentId?(自引用树形), sort — 支持无限层级
- `QuestionCategory`：questionId + categoryId — 题目与分类多对多

### 计划新增模型（Phase 2）

> **已实现**: User、UserStatus、UserPreference 模型已在 Phase 2.1 中实现（含迁移 + 种子数据）。
> AnswerAttempt 已新增 `userId` 字段关联用户。

```prisma
/// 系统操作日志（待实现）
model SystemLog {
  id         Int       @id @default(autoincrement())
  type       LogType
  actorType  ActorType
  actorId    Int?
  actorName  String?   // 操作时的用户名快照
  action     String    // CREATE / UPDATE / DELETE / LOGIN
  module     String    // 如 "questions"
  path       String
  method     String
  params     Json?     // 已过滤 password 等敏感字段
  result     Json?     // 截断至 2KB
  success    Boolean
  error      String?
  ip         String?
  durationMs Int?
  createdAt  DateTime  @default(now())
  @@index([type])
  @@index([actorId, actorType])
  @@index([createdAt])
}

enum LogType   { LOGIN API_MUTATION }
enum ActorType { ADMIN USER }
```

同时需要修改现有模型（待实现）：

- `Category`：新增反向关联 `userPreferences UserPreference[]`（已完成）

---

## quiz-backend（后端）

### 目录结构

```
src/
├── app.module.ts            # 根模块（全局守卫 + 过滤器 + 拦截器）
├── prisma/                  # PrismaModule + PrismaService
├── common/
│   ├── decorators/          # @Public(), @RequirePermission(), @CurrentUser()
│   ├── filters/             # HttpExceptionFilter（统一错误格式）
│   └── interceptors/        # TransformInterceptor（统一响应格式）
├── auth/                    # JWT 认证（策略 + 守卫）
├── admins/                  # 管理员 CRUD
├── roles/                   # 角色 CRUD
├── permissions/             # 权限列表查询
├── questions/               # 公开题目接口（随机、答题）
├── answers/                 # 答案提交（支持 userId 关联用户）
├── admin-questions/         # 管理员题目 CRUD（5 个端点）
├── admin-categories/        # 管理员分类 CRUD（7 个端点）
├── app-users/               # App 用户管理（6 个端点）
├── user-auth/               # 用户认证（注册/登录/信息）
└── test/                    # 测试重置接口（仅测试环境启用）
```

### 全局机制

| 机制       | 类                     | 说明                                                                              |
| ---------- | ---------------------- | --------------------------------------------------------------------------------- |
| JWT 认证   | `JwtAuthGuard`         | 全局，`@Public()` 跳过                                                            |
| 权限检查   | `PermissionGuard`      | 读取 JWT payload 中的 `role.apiPermissions`，匹配 `@RequirePermission("xxx:yyy")` |
| 超级管理员 | 通配符 `["*"]`         | JWT 策略解析时展开，PermissionGuard 直接放行                                      |
| 异常格式   | `HttpExceptionFilter`  | 统一返回 `{ statusCode, message, error }`                                         |
| 响应格式   | `TransformInterceptor` | 统一包装为 `{ code: 0, data, message }`                                           |

### 已实现 API 端点（33 个）

| 模块            | 前缀                 | 端点数                             |
| --------------- | -------------------- | ---------------------------------- |
| Auth            | `/admin/auth`        | 3（login / refresh / logout）      |
| Admins          | `/admin/admins`      | 5（CRUD + 状态切换）               |
| Roles           | `/admin/roles`       | 5（CRUD）                          |
| Permissions     | `/admin/permissions` | 2（菜单列表 + API 列表）           |
| AdminQuestions  | `/admin/questions`   | 5（CRUD，软删除）                  |
| AdminCategories | `/admin/categories`  | 7（维度 CRUD + 树形节点 CRUD）     |
| AppUsers        | `/admin/app-users`   | 6（列表/详情/历史/偏好/状态/删除） |
| UserAuth        | `/api/user/auth`     | 3（register / login / info）       |
| Questions       | `/api/questions`     | 2（随机题目）                      |
| Answers         | `/api/answers`       | 1（提交答案，支持 userId）         |
| Test            | `/api/test/reset`    | 1（E2E 数据重置，仅测试环境）      |

### Prisma 迁移说明

- DB URL 在 `prisma.config.ts`（Prisma 7），不在 `schema.prisma`
- `prisma migrate dev` 需要 shadow DB 权限（RDS 没有）→ 手动写 SQL + `prisma migrate deploy`
- 每次新增模型后需 `pnpm -C apps/quiz-backend run prisma:generate`

---

## quiz-admin（管理后台）

### 目录结构

```
src/
├── api/
│   ├── mock/               # Mock API（account / users / admins / questions / categories）
│   └── {module}.ts         # 真实 API 调用（admins / roles / questions / categories / users）
├── components/history-tab/ # Tab 历史组件
├── composables/
│   ├── use-token.ts        # JWT Token 管理
│   └── use-mock-store.ts   # Mock 数据持久化
├── router/
│   ├── index.ts            # 路由守卫 + 动态路由加载
│   ├── dynamic-routes.ts   # 权限过滤生成可访问路由
│   ├── home-routes.ts      # 业务页面路由定义
│   └── permission-routes-mapping.ts  # 菜单权限 → 路由名称映射
├── stores/modules/
│   ├── account.ts          # 登录用户信息 + 权限
│   ├── menu.ts             # 侧边菜单配置 + 过滤
│   └── router.ts           # 动态路由 + Tab 历史状态
├── styles/
│   ├── index.scss          # Element Plus 深色模式（必须第一个 import）
│   ├── main.scss           # 全局样式 + 25+ 深色 CSS 变量（slate 系）
│   └── element/            # SCSS 变量覆盖（浅色/深色）
├── types/
│   ├── permission.ts       # 所有菜单权限 + API 权限定义
│   ├── category.ts         # CategoryItem / CategoryGroupItem / CategoryForm
│   └── question.ts         # QuestionItem / QuestionDetail / OptionForm
└── views/
    ├── login/              # 登录页
    ├── master/             # 主布局（Header + Sidebar + Tab + RouterView）
    ├── dashboard/          # 欢迎页
    ├── users/              # 用户管理（列表+搜索+分页+详情页）
    ├── admins/             # 管理员 CRUD
    ├── roles/              # 角色 CRUD
    ├── permissions/        # 权限查看
    ├── questions/          # 题目列表 + 详情（新建/编辑复用）
    ├── categories/         # 分类管理（左维度列表 + 右树形）
    └── system/             # 系统设置
```

### 关键技术实现

**CSS 导入顺序**（`main.ts` 中，顺序不可改）：

```ts
import "./styles/index.scss"; // 1. Element Plus 深色模式（必须最先）
import "./styles/main.scss"; // 2. 全局样式 + 主题变量
import "element-plus/.../message-box.scss"; // 3. 弹窗（非按需引入）
import "virtual:uno.css"; // 4. UnoCSS（必须最后，最高优先级）
```

**超级管理员通配符**：菜单权限 `["*"]` 在以下三处均已处理：

1. `auth/jwt.strategy.ts`：解析时识别通配符
2. `stores/menu.ts`：菜单过滤时放行所有
3. `router/dynamic-routes.ts`：路由生成时不过滤

**v-permission 按钮级权限指令**：

`v-permission` 指令根据用户 `apiPermissions` 控制操作按钮的显示/隐藏，支持三种匹配模式：

- 精确匹配：`users:list === users:list`
- 模块通配符：`users:*` 匹配 `users:list`、`users:delete` 等
- 全局通配符：`*:*` 匹配所有权限

各模块按钮权限对照：

| 视图               | 按钮       | v-permission 值     |
| ------------------ | ---------- | ------------------- |
| users-view         | 查看       | `users:list`        |
| users-view         | 禁用/启用  | `users:status`      |
| users-view         | 删除       | `users:delete`      |
| questions-view     | 新增题目   | `questions:create`  |
| questions-view     | 编辑       | `questions:update`  |
| questions-view     | 删除       | `questions:delete`  |
| admins-view        | 新增管理员 | `admins:create`     |
| admins-view        | 查看       | `admins:list`       |
| admins-view        | 分配角色   | `admins:update`     |
| admins-view        | 删除       | `admins:delete`     |
| roles-view         | 新增角色   | `roles:create`      |
| roles-view         | 编辑       | `roles:update`      |
| roles-view         | 配置权限   | `roles:update`      |
| roles-view         | 查看权限   | `roles:list`        |
| roles-view         | 删除       | `roles:delete`      |
| categories-view    | 新增维度   | `categories:create` |
| categories-view    | 编辑维度   | `categories:update` |
| categories-view    | 删除维度   | `categories:delete` |
| categories-view    | 新增根分类 | `categories:create` |
| category-tree-node | 新增子分类 | `categories:create` |
| category-tree-node | 编辑       | `categories:update` |
| category-tree-node | 删除       | `categories:delete` |

**keep-alive + 列表刷新**：详情页（`question-detail-view`）不设 `meta.componentName`，不参与缓存。列表页刷新用 VueUse `useEventBus`，详情页成功后 `bus.emit()`，列表页 `bus.on(() => load())`。

### 添加新页面的标准流程

1. 创建 `src/views/{module}/{module}-view.vue`
2. `src/router/home-routes.ts` 添加路由定义（列表页加 `componentName`，详情页不加）
3. `src/types/permission.ts` 中 `ALL_MENU_PERMISSIONS` 和 `ALL_API_PERMISSION_GROUPS` 新增条目
4. `src/router/permission-routes-mapping.ts` 配置菜单权限 → 路由名称映射
5. `src/stores/modules/menu.ts` 添加菜单项
6. （可选）`src/api/mock/{module}.ts` 创建 Mock API
7. **操作按钮加 `v-permission`**：所有增删改操作按钮必须加上对应的 `v-permission` 指令（如 `v-permission="'module:create'"`)
8. **更新种子数据**：在 `apps/quiz-backend/prisma/data/seed-admin.ts` 的 `superAdminApiPermissions` 数组中添加 `"module:*"`，确保超级管理员覆盖新模块权限；如需内容管理员等角色也有权限，同步更新对应角色的 `apiPermissions`
9. **更新 Mock 角色数据**：在 `apps/quiz-admin/src/api/mock/roles.ts` 中为 Mock 角色添加新权限，确保 Mock 模式下角色权限与种子数据一致
10. 重新 seed 数据库（dev + test + prod）：`pnpm -C apps/quiz-backend run db:seed:dev` / `db:reset:test` / `db:seed:prod`

---

## quiz-app（用户端）

### 目录结构

```
src/
├── pages/quiz-page.vue    # 主答题页（唯一页面）
├── api/questions.ts       # 获取题目 + 提交答案
├── composables/
│   ├── use-quiz.ts        # 答题核心逻辑（随机获取、提交、跳转）
│   └── use-theme.ts       # 主题切换（系统检测 + 手动）
└── stores/                # Pinia stores
```

### 答题流程

1. 页面加载 → `useQuiz` 调用 `GET /api/questions/random`
2. 用户点击选项 → `POST /api/answers` → 后端返回 `{ correct, options[].description }`
3. 答对：绿色高亮 + 展示解析 + 1 秒自动跳转下一题
4. 答错：红色高亮 + 绿色正确答案 + 展示解析 + 手动点击下一题

---

## packages/ui（共享组件库）

- `CheckRadio.vue`：单选题选项组件（支持 correct/incorrect/default 状态）
- `CheckRadioGroup.vue`：选项组封装
- Storybook 交互测试（Playwright）
- `quiz-app` 必须在 `uno.config.ts` 中扫描 UI 源码：`filesystem: ["../../packages/ui/src/**/*.vue"]`

---

## 测试策略

| 包           | 单元测试                         | E2E 测试                        |
| ------------ | -------------------------------- | ------------------------------- |
| quiz-app     | Vitest (~22 tests)               | Cypress（含真实后端）           |
| quiz-admin   | Vitest (~199 tests)              | Cypress（6 个文件，连真实后端） |
| quiz-backend | Jest (~223 tests, 86~95% 覆盖率) | —                               |
| ui           | Vitest (~85 tests)               | Playwright（Storybook 交互）    |

**E2E 注意事项**（详见 [memory/cypress.md](../../../.claude/projects/-Users-zhangxu-illegal-quiz-monorepo/memory/cypress.md)）：

- 选择器优先级：`[data-testid]` > `cy.contains()` > `[aria-label]` > `.class-name`
- `overflow:hidden/auto` 容器内用 `should("exist")`，不用 `should("be.visible")`
- prop 驱动 `el-input`（`:model-value`）用 `.invoke("val", v).trigger("input")`，不用 `.type()`
- E2E 前先 `pnpm clean:ports` 防止端口冲突
- 侧边栏默认收起，测试中需先 `cy.get(".header-icon-btn").first().click()` 展开，否则 `.menu-item` 不可交互

### Cypress 运行方式

```bash
# 完整 E2E（启动 preview + 后端 → 跑所有 spec → 关闭）
pnpm test:e2e

# 单独跑某个 spec（指向已运行的 dev server，不需要后端时用）
# 注意：必须 unset ELECTRON_RUN_AS_NODE，否则 Cypress 以 Node 模式启动报错
unset ELECTRON_RUN_AS_NODE && pnpm cypress run \
  --spec "cypress/e2e/foo.cy.ts" \
  --config baseUrl=http://localhost:10050

# 完整 E2E 的底层脚本（自动 unset ELECTRON_RUN_AS_NODE）
bash scripts/run-e2e.sh
```

**关键说明**：

- `ELECTRON_RUN_AS_NODE` 被 Claude Code 设置后，Cypress（基于 Electron）会以纯 Node 模式启动，找不到 Electron app 入口文件而报错
- `run-e2e.sh` 已内置 `unset ELECTRON_RUN_AS_NODE`（第 65 行），完整流程不受影响
- 单独跑 spec 时，`baseUrl=http://localhost:10050` 指向 dev server；若需要真实后端，确保 `apps/quiz-backend` dev 模式已启动

---

## 待实现功能详细计划（Phase 2）

### ~~1. 用户管理真实实现~~ ✅ 已完成

后端 `user-auth` + `app-users` 模块、前端用户管理页面（列表+搜索+分页+详情页）均已实现。

详细端点见上方"已实现 API 端点"表格中 UserAuth 和 AppUsers 行。

---

### 2. 系统日志

**目标**：自动记录所有增删改 API 操作及登录行为，管理后台提供可筛选查看界面。

#### 2.1 后端：`system-logs` 模块

新建 `apps/quiz-backend/src/system-logs/`

**`LoggingInterceptor`**（注册为全局 `APP_INTERCEPTOR`，在 AppModule 中）：

```typescript
// 逻辑概要
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // 只处理 POST/PATCH/PUT/DELETE 请求
  // 跳过 /test/* 路径
  // 用 RxJS tap/catchError 在 handler 完成后写日志
  // params 去除 password 字段；result 截断至 2KB
  // actorType = ADMIN，actorId 从 request.user 读取
}
```

**登录日志**：`AuthService.login()` 直接调用 `SystemLogsService.create()`（成功+失败均记录）。

| 方法 | 路径                 | 权限          | 说明                  |
| ---- | -------------------- | ------------- | --------------------- |
| GET  | `/admin/system-logs` | `system:logs` | 日志列表（分页+筛选） |

查询参数：`type`, `actorType`, `actorId`, `success`, `startDate`, `endDate`, `page`, `pageSize`

#### 2.2 前端：quiz-admin

新建 `views/system/system-logs-view.vue`：

- 筛选栏：类型 / 操作者类型 / 成功失败 / 日期范围
- 表格：时间 / 操作者 / 操作 / 模块 / 路径 / 耗时 / 状态
- 行展开：完整 params 和 result（JSON 格式化）
- 新增路由 `system-logs`，菜单权限 `system:logs`（`ALL_MENU_PERMISSIONS` 中 `system` 新增子项）

---

### 3. WebSocket 客户端管理

**目标**：服务端通过 WebSocket 监控在线 quiz-app 客户端状态，并支持主动广播事件（刷新页面、公告通知）。

#### 3.1 后端：`clients` 模块

**依赖**：`@nestjs/websockets` + `@nestjs/platform-ws` + `ws` + `@types/ws`

新建 `apps/quiz-backend/src/clients/`

**`ClientRegistryService`**（内存状态，不持久化）：

```typescript
interface ClientInfo {
  clientId: string; // 客户端 UUID（localStorage 生成）
  ws: WebSocket;
  ip: string;
  userId?: number;
  username?: string;
  page: string; // 当前页面，如 "/quiz"
  connectedAt: Date;
  lastSeenAt: Date;
}
// Map<clientId, ClientInfo> 存储活跃连接，断开时自动清除
```

**`ClientsGateway`**：

```typescript
@WebSocketGateway({ path: "/api/ws", cors: true })
export class ClientsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  handleConnection(client: WebSocket, req: IncomingMessage) {
    // 从 req.url 读 clientId query param，注册到 registry
  }
  handleDisconnect(client: WebSocket) {
    /* 从 registry 移除 */
  }

  @SubscribeMessage("heartbeat")
  onHeartbeat(
    client: WebSocket,
    data: { page: string; userId?: number; username?: string },
  ) {
    // 更新 registry 中的 page / userId / username / lastSeenAt
  }
}
```

**`main.ts` 配置**：

```typescript
import { WsAdapter } from "@nestjs/platform-ws";
app.useWebSocketAdapter(new WsAdapter(app));
```

**HTTP 管理端点**：
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/admin/clients` | `clients:list` | 在线客户端列表 |
| POST | `/admin/clients/broadcast` | `clients:broadcast` | 广播事件 |

广播消息格式（服务器 → 客户端）：

```typescript
{ type: "refresh", payload?: { version?: string } }
{ type: "announcement", payload: { message: string } }
```

#### 3.2 前端：quiz-app 新增

- `composables/useWs.ts`：WebSocket 连接管理
  - 连接：`new WebSocket('ws://host/api/ws?clientId=xxx')`
  - 断线自动重连（指数退避，最大 30s）
  - 发 heartbeat 的时机：App 挂载、路由变化、用户登录/登出
  - 接收 `refresh` → `window.location.reload()`
  - 接收 `announcement` → 全局提示
- `App.vue`：mount 时初始化 WS 连接

心跳消息格式（客户端 → 服务器）：

```typescript
{ type: "heartbeat", page: string, userId?: number, username?: string }
```

#### 3.3 前端：quiz-admin 新增

新建 `views/clients/clients-view.vue`：

- 在线客户端数量 + 客户端表格（用户/IP/当前页面/连接时长/最后心跳）
- 5s 轮询 `/admin/clients` 自动刷新
- 广播表单：事件类型 + 可选消息 + 发送按钮

**权限配置**（新增到 `types/permission.ts`）：

- 菜单权限：`clients`（新增到 `ALL_MENU_PERMISSIONS`）
- API 权限：`clients:list`, `clients:broadcast`（新增 `clients` 模块到 `ALL_API_PERMISSION_GROUPS`）
- API 权限：`system:logs` 已存在于 `system` 模块，无需新增

---

### 4. 管理后台增强

以下功能独立于三大模块，可随时穿插实现：

- **历史页签右键菜单**：右键点击页签弹出上下文菜单，支持"关闭全部页签"、"关闭其他页签"操作（参考 vue-element-admin 实现）
- **批量导入题目**：JSON 文件上传，复用 `seed-test.json` 数据结构，后端 `POST /admin/questions/import`
- **题目预览**：管理后台中预览题目样式，对齐 quiz-app 答题界面风格
- **Dashboard 真实统计数据**：替换当前静态内容，展示题目总数、答题次数、用户数等实时统计

---

## 实施顺序（推荐）

1. ~~**DB Schema + 迁移 SQL**（User / UserPreference 模型，AnswerAttempt 更新）~~ ✅ 已完成
2. ~~**用户认证 + app-users 管理**（后端 user-auth + app-users 模块）~~ ✅ 已完成
3. ~~**quiz-admin 用户管理前端**（users 真实 API + 详情页）~~ ✅ 已完成
4. **系统日志**（独立模块，LoggingInterceptor + SystemLog 模型）
5. **WebSocket 客户端管理**（后端 ClientsGateway + quiz-app useWs）
6. **quiz-app 前端**（userAuth store + useSession composable）
7. **quiz-admin 前端**（系统日志视图 + 客户端管理视图）

---

_最后更新: 2026-02-26（用户管理已实现，新增 v-permission 权限指令文档，更新 API 端点和测试数量）_
