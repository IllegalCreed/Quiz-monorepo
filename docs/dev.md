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
- `Category`：id, name, groupId, parentId?(自引用树形), sort, **isDefault**(布尔, 默认 false) — 支持无限层级
- `QuestionCategory`：questionId + categoryId — 题目与分类多对多，**categoryId 必须指向叶子节点**

**「通识」节点机制（叶子节点约束）**：

> **核心原则**：`QuestionCategory` 和 `UserPreference` 只存储叶子节点 ID，查询时直接匹配，无需递归展开。
> 三态选中逻辑要求非叶子节点的状态由子节点计算得出，不可独立进入结果集。
> 为避免挂在非叶子节点上的题目「消失」，引入「通识」默认子节点。

**数据模型**：

- `Category` 新增 `isDefault: Boolean @default(false)` 字段
- `isDefault=true` 的节点名称固定为 `"通识"`，DB 只存 `"通识"`
- 前端显示时拼接父名：`"前端通识"`、`"Vue通识"`（数据转换层处理，非 DB 存储）

**创建子分类时（叶子 → 非叶子）**：

当管理员在叶子节点 X 下创建第一个子分类时，后端在同一事务中执行：

1. 检测 X 当前无子节点（即 X 是叶子）
2. 自动创建「通识」子节点（`isDefault=true`，`sort` 设最大值确保排最后）
3. 将所有 `QuestionCategory.categoryId = X` 的记录更新为 `categoryId = 通识.id`
4. 将所有 `UserPreference.categoryId = X` 的记录更新为 `categoryId = 通识.id`
5. 创建管理员请求的目标子分类

效果：X 下原有题目和用户偏好全部转移到「通识」，数据可见性不变。

**删除子分类时（可能触发非叶子 → 叶子）**：

删除前校验三条规则，任一不满足则拒绝：

- 目标节点 `isDefault=true` → 拒绝（「通识」不可直接删除）
- 目标节点有关联题目（`QuestionCategory` 有记录）→ 拒绝
- 目标节点有子节点 → 拒绝（必须自底向上逐层删除）

删除成功后，检测父节点 X 下是否只剩「通识」节点：

1. 如果是：将 `QuestionCategory.categoryId = 通识.id` 更新回 `categoryId = X`
2. 同步将 `UserPreference.categoryId = 通识.id` 更新回 `categoryId = X`
3. 删除「通识」节点
4. X 重新成为叶子，可直接关联题目

**管理端约束**：

- 「通识」节点：不可删除、不可改名、不可移动，视觉上灰色/斜体区分
- 题目编辑的分类选择器：只展示叶子节点供选择
- 分类树中「通识」始终排在同级最后

**前端显示名称处理**：

- DB 存 `"通识"`，前端数据转换层拼接父名展示（`"前端通识"`、`"后端通识"`）
- ColumnSelector 已选摘要区、用户偏好标签、答题页分类标签统一使用拼接名
- 避免 DB 存完整名：防止父节点改名导致不一致

**完整生命周期示例**：

```
前端(叶子, 3道题, 2个用户偏好)
  ↓ 管理员创建 "Vue"
前端(非叶子)
  ├── Vue(叶子, 0道题)
  └── 前端通识(叶子, isDefault, 继承3道题 + 2个用户偏好)
  ↓ 管理员创建 "React"
前端(非叶子)
  ├── Vue(叶子)
  ├── React(叶子)
  └── 前端通识(叶子, isDefault)
  ↓ 管理员删除 "React"（无关联题目，允许删除）
前端(非叶子)
  ├── Vue(叶子)
  └── 前端通识(叶子, isDefault)
  ↓ 管理员删除 "Vue"（无关联题目，触发通识回收）
前端(叶子, 3道题 + 2个用户偏好迁回)
```

### Phase 2 新增模型

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
├── user-profile/               # 用户自服务（历史+偏好，UserJwtAuthGuard）
├── categories/                 # 公开分类接口（@Public）
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

### 已实现 API 端点（37 个）

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
| UserProfile     | `/api/user`          | 3（history / preferences GET+PUT） |
| Categories      | `/api/categories`    | 1（公开分类树 groups）             |
| Questions       | `/api/questions`     | 2（随机题目，支持 categoryIds）    |
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

### Phase 2 计划：用户系统 + 分类筛选

#### 新增目录结构

```
src/
├── components/
│   ├── AuthDialog.vue         # 登录注册对话框（BaseDialog center）✅
│   ├── UserDropdown.vue       # 登录后用户下拉菜单（BasePopover）✅
│   ├── HistoryDrawer.vue      # 答题历史抽屉面板（BaseDialog right）✅
│   ├── CategorySelector.vue   # 分类选择器（BaseDialog center + ColumnSelector）✅
│   └── LoginPrompt.vue        # 答题后登录引导卡片 ✅
├── composables/
│   ├── useAuthDialog.ts       # 控制登录对话框开关 + 初始 Tab ✅
│   ├── useCategories.ts       # 分类数据获取 + 选中状态管理 ✅
│   └── useHistory.ts          # 历史数据无限滚动加载 ✅
├── stores/
│   └── useUserStore.ts        # 用户认证状态（Pinia）：token / user / login / register / logout ✅
├── api/
│   ├── auth.ts                # 注册/登录/获取用户信息 ✅
│   ├── categories.ts          # 公开分类树 ✅
│   └── user-profile.ts        # 用户答题历史 + 偏好 ✅
├── types/
│   ├── user.ts                # 用户/认证类型 ✅
│   ├── question.ts            # 题目/选项/答案类型 ✅
│   ├── category.ts            # 分类/维度/偏好类型 ✅
│   └── history.ts             # 历史条目/分页类型 ✅
└── utils/
    └── request.ts             # 统一请求封装（自动注入 token，替代裸 fetch）✅
```

#### 交互设计

**登录/注册**（对话框模式，不中断答题流程）：

- 触发方式：右上角浮动工具栏「登录」按钮 / 答题后底部提示卡片
- 内容：两个 Tab（登录/注册），使用 BaseDialog + BaseInput 组件
- 游客模式：不强制登录，答题功能照常（后端 OptionalUserJwtGuard 已支持）

**用户菜单**（登录后替换「登录」按钮）：

- 头像/图标 + 用户名，点击展开下拉菜单（BasePopover）
- 菜单项：做题历史 → 打开抽屉 / 分类偏好 → 打开选择器 / 退出登录

**答题历史**（右侧抽屉面板，`BaseDialog placement="right"`）：

- 筛选：全部 / 答对 / 答错
- 列表：题干(截断) + 正误徽标 + 选择的选项 + 相对时间
- 无限滚动：IntersectionObserver 触底自动加载下一页
- 空状态：未登录提示 / 无记录提示

**分类筛选**（居中对话框，Miller Columns 分栏浏览器）：

- 答题页显示「选择分类」按钮 + 已选分类标签
- 对话框内采用类似 macOS Finder 的分栏布局：
  - 左列维度 → 中列一级分类 → 右列二级分类 → 水平滚动展更深层级
  - **点击文字** = 展开子级到右列
  - **点击选中指示器** = 切换选中/取消
- 三态选中逻辑：
  - `●` 节点选中 → 所有后代自动包含
  - `◐` 半选 → 节点未选中但部分后代已选中
  - `○` 未选中
- 选中父级 → 子级自动全选；取消子级 → 父级变为半选
- 顶部搜索框：跨层级搜索所有分类
- 已选摘要区：显示所有已选分类标签（可单独移除）
- 保存后：已登录 → 同步到后端 UserPreference；游客 → localStorage
- 后端存储显式选中的叶子 categoryId 列表，直接查询匹配（题目也只挂叶子节点，无需递归展开）

---

## packages/ui（共享组件库）

### 已有组件

- `CheckRadio.vue`：单选题选项组件（支持 correct/incorrect/default 状态）
- `CheckRadioGroup.vue`：选项组封装（键盘导航、v-model）
- `BaseButton.vue`：按钮组件（variant: default/outline/ghost, size: sm/md/lg）
- `BaseCard.vue` / `BaseCardHeader.vue` / `BaseCardContent.vue`：可组合卡片系统
- `ThemeToggle.vue`：暗色/亮色模式切换（VueUse useDark）
- Storybook 交互测试（Playwright）
- `quiz-app` 必须在 `uno.config.ts` 中扫描 UI 源码：`filesystem: ["../../packages/ui/src/**/*.vue"]`

### Phase 2 新增组件

#### BaseDialog（对话框 + 抽屉，单组件 `placement` prop）

支持居中对话框（`placement="center"`）和侧边抽屉（`placement="right"/"left"`），共享遮罩/滚动锁定/Esc 关闭/焦点管理逻辑。

**文件**：`BaseDialog.vue` + `dialog.scss`

**Props**：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | — | v-model 控制显示/隐藏 |
| `title` | `string?` | — | 标题（不传则不渲染 header） |
| `placement` | `"center" \| "right" \| "left"` | `"center"` | 居中=对话框，左右=抽屉 |
| `overlay` | `boolean` | `true` | 是否显示遮罩层 |
| `closeOnOverlay` | `boolean` | `true` | 点击遮罩层是否关闭 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `width` | `string` | `"28rem"` | 面板宽度 |
| `closeOnEsc` | `boolean` | `true` | Esc 键关闭 |

**Events**：`update:modelValue`、`close`（关闭动画结束后）、`opened`（打开动画结束后）

**Slots**：`header`（替代 title prop）、`default`（主体内容）、`footer`（底部操作区）

**两种模式差异**：
| 特性 | center（对话框） | right/left（抽屉） |
|------|------|------|
| 布局 | 居中 | 靠侧满屏高 |
| 圆角 | 四角 `rounded-xl` | 仅内侧两角 |
| 进入动画 | `scale(0.95)` → 1 | `translateX(100%)` → 0 |

**行为**：Teleport to body、Transition 动画、body 滚动锁定、Esc 键关闭、基础焦点管理。

**BEM**：`.dialog-overlay`（`--center`/`--right`）→ `.dialog`（`--center`/`--right`）→ `__header` / `__title` / `__close` / `__body` / `__footer`

#### BaseInput（输入框）

表单场景标准化输入框，支持 label、error 状态、password toggle。

**文件**：`BaseInput.vue` + `input.scss`

**Props**：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | — | v-model |
| `type` | `"text" \| "password" \| "email"` | `"text"` | 输入类型 |
| `placeholder` | `string?` | — | 占位文字 |
| `label` | `string?` | — | 标签 |
| `error` | `string?` | — | 错误信息 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `"md" \| "sm" \| "lg"` | `"md"` | 尺寸 |

**特性**：password 可见切换（眼睛图标）、error 红色边框 + 文字、focus-visible ring。

**BEM**：`.input` → `__label` / `__field` / `__error`，修饰符 `--error` / `--disabled`

#### BasePopover（弹出面板）

通用定位弹出面板，用于 UserDropdown 等场景。

**文件**：`BasePopover.vue` + `popover.scss`

**Props**：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placement` | `"bottom-start" \| "bottom-end" \| "top-start" \| "top-end"` | `"bottom-end"` | 弹出方向 |
| `offset` | `number` | `4` | 与触发元素的间距(px) |

**Slots**：`trigger`（触发元素）、`default`（弹出内容）

**行为**：点击 trigger 切换显示、点击外部关闭（VueUse `onClickOutside`）、Esc 关闭、CSS 绝对定位。

**BEM**：`.popover` → `__trigger` / `__content`（`--bottom-start` / `--bottom-end`）

#### ColumnSelector（Miller Columns 分栏选择器）

通用树形多选组件，macOS Finder 风格分栏浏览器。输入标准树形数据、输出选中 ID 数组，可用于任何多级分类/标签选择场景。

**文件**：`ColumnSelector.vue` + `column-selector.scss`

**Props**：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `(string \| number)[]` | `[]` | v-model 选中节点 ID 数组 |
| `data` | `TreeNode[]` | — | 树形数据（`{ id, label, children? }`） |
| `searchable` | `boolean` | `true` | 是否显示搜索框 |
| `searchPlaceholder` | `string` | `"搜索..."` | 搜索框占位文字 |

**TreeNode 接口**：

```typescript
interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
}
```

**交互**：

- 分栏布局：每列显示当前层级节点，点击有子级的节点 → 子级出现在右列
- **点击文字** = 展开子级到右列（高亮当前路径）
- **点击选中指示器**（圆圈图标）= 切换选中/取消
- 三态选中：`●` 全选 / `◐` 半选（部分子级选中）/ `○` 未选中
- 选中父级 → 所有后代自动包含；取消子级 → 父级变为半选
- 顶部搜索框跨层级过滤
- 底部已选摘要区，显示所有已选节点标签（可逐个移除）

**BEM**：`.column-selector` → `__search` / `__columns` / `__column` / `__node`（`--active` / `--selected` / `--indeterminate`）/ `__indicator` / `__summary`

#### BaseTag（标签）

轻量标签组件，用于分类标签、题目标签等场景。支持多种颜色变体和尺寸，提供确定性着色工具函数。

**文件**：`BaseTag.vue` + `tag.scss` + `tag-utils.ts`

**Props**：
| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸：sm（题目标签）、md（ColumnSelector 已选）、lg（醒目标签） |
| `color` | `TagColor` | `"default"` | 颜色变体：blue/green/purple/orange/pink/cyan/default |
| `removable` | `boolean` | `false` | 是否显示关闭按钮 |

**Events**：`remove`（点击关闭按钮时触发）

**工具函数**（`tag-utils.ts`）：

- `TAG_COLORS`：6 种预设颜色常量数组
- `TagColor`：颜色类型（6 种 + `"default"`）
- `getTagColor(text: string): TagColor`：根据字符串哈希确定性分配颜色，同一文本始终得到同一颜色

**BEM**：`.tag`（`--sm` / `--md` / `--lg` / `--blue` / `--green` / `--purple` / `--orange` / `--pink` / `--cyan`）→ `__remove`

---

## 测试策略

| 包           | 单元测试                         | E2E 测试                                            |
| ------------ | -------------------------------- | --------------------------------------------------- |
| quiz-app     | Vitest (~88 tests)               | Cypress（6 个 spec，Mock API 模式，~33 tests）      |
| quiz-admin   | Vitest (~211 tests)              | Cypress（8 个 spec，连真实后端 test DB，~58 tests） |
| quiz-backend | Jest (~267 tests, 86~95% 覆盖率) | —                                                   |
| ui           | Vitest (~224 tests)              | Playwright（Storybook 交互测试，10 个 story）       |

**E2E 注意事项**（详见 `.claude/skills/cypress-skill/`）：

- 选择器优先级：`[data-testid]` > `cy.contains()` > `[aria-label]` > `.class-name`
- `overflow:hidden/auto` 容器内用 `should("exist")`，不用 `should("be.visible")`
- prop 驱动 `el-input`（`:model-value`）用 `.invoke("val", v).trigger("input")`，不用 `.type()`
- E2E 前先 `pnpm clean:ports` 防止端口冲突
- 侧边栏默认收起，测试中需先 `cy.get(".header-icon-btn").first().click()` 展开，否则 `.menu-item` 不可交互

### Cypress 运行方式

```bash
# 完整 E2E（启动 preview + 后端 → 跑所有 spec → 关闭）
pnpm test:e2e

# 单独跑某个 spec（先 build，再用 SPEC 指定文件）
pnpm -C apps/quiz-admin run build:test
cd apps/quiz-admin
SPEC=cypress/e2e/users.cy.ts bash scripts/run-e2e.sh

# 测试服务器已在运行 + dist 已最新时，直接手动跑 cypress
# 注意：必须 unset ELECTRON_RUN_AS_NODE，否则 Cypress 以 Node 模式启动报错
unset ELECTRON_RUN_AS_NODE && pnpm -C apps/quiz-admin exec cypress run --e2e \
  --spec "cypress/e2e/foo.cy.ts" \
  --config baseUrl=http://localhost:10060

# 完整 E2E 的底层脚本（自动 unset ELECTRON_RUN_AS_NODE）
bash scripts/run-e2e.sh
```

**关键说明**：

- E2E 测试**必须用测试服务器**（端口 10060，test DB），**不能用 dev server**（10050，test/reset 会 403）
- `ELECTRON_RUN_AS_NODE` 被 Claude Code 设置后，Cypress（基于 Electron）会以纯 Node 模式启动，找不到 Electron app 入口文件而报错
- `run-e2e.sh` 已内置 `unset ELECTRON_RUN_AS_NODE`（第 65 行），完整流程不受影响
- Element Plus `el-tree-select` 的 DOM 结构特殊（用 `.el-select-dropdown__item` 而非 `.el-tree-node__label`），详见 `.claude/skills/cypress-skill/references/selectors.md`

---

## 待实现功能详细计划

### 1. App 端用户系统（Phase 2A~2D）

#### 1.1 后端新增：`user-profile` 模块

新建 `apps/quiz-backend/src/user-profile/`，提供用户自服务接口（与管理员 `app-users` 模块分离）。

| 方法 | 路径                | 守卫             | 说明                                 |
| ---- | ------------------- | ---------------- | ------------------------------------ |
| GET  | `/user/history`     | UserJwtAuthGuard | 当前用户答题历史（分页 + 正误筛选）  |
| GET  | `/user/preferences` | UserJwtAuthGuard | 当前用户偏好分类列表                 |
| PUT  | `/user/preferences` | UserJwtAuthGuard | 更新偏好 `{ categoryIds: number[] }` |

实现可复用 `AppUsersService` 中的 `getHistory()` / `getPreferences()` 逻辑，userId 从 JWT 提取。

#### 1.2 后端新增：公开分类接口

| 方法 | 路径                 | 守卫      | 说明                                                 |
| ---- | -------------------- | --------- | ---------------------------------------------------- |
| GET  | `/categories/groups` | @Public() | 公开分类树（复用 AdminCategoriesService 的读取逻辑） |

#### 1.3 后端修改：题目分类筛选 + 叶子节点约束

**题目分类筛选**：

修改 `GET /api/questions`：新增可选 `categoryIds` 查询参数，SQL 中 JOIN `QuestionCategory` + `WHERE categoryId IN (...)`。因题目只挂叶子节点，无需递归展开。

**叶子节点约束 — 需要修改的文件和逻辑**：

1. **`Category` 模型**（`prisma/schema.prisma`）：新增 `isDefault Boolean @default(false)` 字段 + 迁移 SQL

2. **`AdminCategoriesService.create()`**（创建子分类）：
   - 在事务中检测父节点是否为叶子（当前无子节点）
   - 若是：自动创建「通识」子节点（`name: "通识"`, `isDefault: true`, `sort: 9999`）
   - 迁移 `QuestionCategory`：`WHERE categoryId = 父节点id` → `SET categoryId = 通识.id`
   - 迁移 `UserPreference`：`WHERE categoryId = 父节点id` → `SET categoryId = 通识.id`
   - 然后创建管理员请求的目标子分类

3. **`AdminCategoriesService.delete()`**（删除分类）：
   - 拒绝条件：`isDefault=true` / 有关联 `QuestionCategory` / 有子节点
   - 删除后检测：父节点下是否只剩「通识」节点
   - 若是：迁移 `QuestionCategory` + `UserPreference` 从通识回到父节点 → 删除通识 → 父节点恢复为叶子

4. **`AdminCategoriesService.update()`**（更新分类）：
   - 拒绝对 `isDefault=true` 节点的改名操作

5. **`AdminQuestionsService.create()` / `.update()`**（题目 CRUD）：
   - 校验所有传入的 `categoryIds` 必须是叶子节点（无子节点），否则 400 拒绝

6. **公开分类接口** `GET /categories/groups` 返回值中包含 `isDefault` 字段，供前端识别

7. **App 前端数据转换**（`quiz-app/composables/useCategories.ts`）：
   - 对 `isDefault=true` 的节点拼接父名：`label = parentName + "通识"`

8. **Admin 分类管理页**（`quiz-admin/views/categories/`）：
   - `category-tree-node.vue`：对 `isDefault=true` 节点加灰色/斜体样式，隐藏「编辑」和「删除」按钮
   - `categories-view.vue`：通识节点禁止拖拽排序（如后续加排序功能）

9. **Admin 题目分类选择器**（`quiz-admin/views/questions/question-detail-view.vue`）：
   - 当前使用 `el-tree-select` + `check-strictly`（父子独立选择，可选任意层级）
   - 改为：非叶子节点禁用选中（`disabled: true`），只有叶子节点可被勾选
   - 数据转换：遍历树，给有 `children` 的节点添加 `disabled: true` 属性

10. **Admin 题目列表分类列**（`quiz-admin/views/questions/questions-view.vue`）：
    - 当前显示格式：`维度名·分类名`（如 `技术方向·前端`）
    - 对 `isDefault=true` 的节点拼接父名：`维度名·父分类名通识`（如 `技术方向·前端通识`）
    - 改动位置：`qc.category.name` 的展示逻辑，后端返回需包含 `isDefault` 和父节点名

#### 1.4 实施分阶段

**Phase 2A：UI 组件**（✅ 已完成）

1. ~~BaseDialog 组件（center + right 两种模式 + Storybook + 单元测试）~~ ✅
2. ~~BaseInput 组件（label/error/password toggle + Storybook + 单元测试）~~ ✅
3. ~~BasePopover 组件（定位弹出面板 + Storybook + 单元测试）~~ ✅
4. ~~ColumnSelector 组件（Miller Columns 分栏选择器 + 三态选中 + Storybook + 单元测试）~~ ✅

**Phase 2B：App 认证系统**（✅ 已完成）3. ~~`utils/request.ts` 统一请求封装（token 自动注入 + 401 回调 + 响应解包）~~ ✅ 4. ~~`api/auth.ts` + `stores/useUserStore.ts`（Pinia + useLocalStorage 持久化）~~ ✅ 5. ~~`App.vue` 右上角浮动工具栏（透明底色，登录按钮 / UserDropdown + ThemeToggle）~~ ✅ 6. ~~`components/AuthDialog.vue` + `composables/useAuthDialog.ts`（Tab 登录/注册）~~ ✅ 7. ~~`components/UserDropdown.vue`（BasePopover，历史/偏好 Phase 2D 禁用）~~ ✅

**Phase 2C：后端新接口 + 叶子节点约束**（✅ 已完成）8. ~~`Category` 模型新增 `isDefault` 字段 + 迁移 SQL~~ ✅ 9. ~~`AdminCategoriesService` 改造：创建/删除子分类时自动维护通识节点（含 `QuestionCategory` + `UserPreference` 迁移）~~ ✅ 10. ~~`AdminCategoriesService.update()` 拒绝通识改名 + `AdminQuestionsService` 校验叶子节点~~ ✅ 11. ~~`user-profile` 模块（history + preferences）~~ ✅ 12. ~~公开分类接口 `GET /categories/groups`（含 `isDefault` 字段）~~ ✅ 13. ~~`GET /questions` 添加 `categoryIds` 筛选~~ ✅ 14. ~~Admin 分类管理页：通识节点视觉区分 + 隐藏编辑/删除按钮（`category-tree-node.vue`）~~ ✅ 15. ~~Admin 题目分类选择器：非叶子节点禁用选中（`question-detail-view.vue` 的 `el-tree-select`）~~ ✅ 16. ~~Admin 题目列表分类列：通识节点拼接父名显示（`questions-view.vue`，`维度·父分类通识`）~~ ✅

**Phase 2D：历史 + 分类 + 引导**（✅ 已完成）17. ~~`components/HistoryDrawer.vue` + `composables/useHistory.ts`（BaseDialog right，IntersectionObserver 无限滚动，客户端筛选）~~ ✅ 18. ~~`components/CategorySelector.vue` + `composables/useCategories.ts`（BaseDialog center + ColumnSelector，后端 name→label 转换，通识拼接父名，游客 localStorage / 登录同步后端）~~ ✅ 19. ~~`components/LoginPrompt.vue`（游客答题后登录引导卡片，可永久关闭）~~ ✅ 20. ~~`UserDropdown.vue` 启用历史/偏好菜单项~~ ✅ 21. ~~`QuizPage.vue` 集成分类选择区 + 登录引导，`useQuiz.ts` 传入 categoryIds~~ ✅

**Phase 2E：打磨 + 测试**（✅ 已完成）22. ~~E2E 测试补齐~~ ✅ - quiz-app 新增 3 个 spec：`auth-flow.cy.ts`（12 tests）、`category-filtering.cy.ts`（8 tests）、`history-drawer.cy.ts`（7 tests），全部使用 Mock API 模式 - quiz-admin `categories.cy.ts` 追加 4 个通識节点行为测试（14 tests 总计）- quiz-admin `questions.cy.ts` 追加 3 个分类选择器测试（9 tests 总计）23. ~~Storybook play 测试补齐（10 个 story 文件均含交互测试）~~ ✅ 24. ~~BaseTag 组件（packages/ui，3 种尺寸 + 6 种颜色 + removable + 确定性着色工具函数）~~ ✅ 25. ~~Cypress skill 经验沉淀（选择器策略、竞态修复、Element Plus DOM 结构、Chrome DevTools 调试流程）~~ ✅

---

### ~~2. 用户管理真实实现~~ ✅ 已完成

后端 `user-auth` + `app-users` 模块、前端用户管理页面（列表+搜索+分页+详情页）均已实现。

详细端点见上方"已实现 API 端点"表格中 UserAuth 和 AppUsers 行。

---

### 3. 系统日志

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

### 4. WebSocket 客户端管理

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

### 5. 管理后台增强

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
4. ~~**UI 组件**（BaseDialog + BaseInput + BasePopover + ColumnSelector → packages/ui）~~ ✅ 已完成
5. ~~**App 认证系统**（useUserStore + AuthDialog + 浮动工具栏 + UserDropdown）~~ ✅ 已完成
6. ~~**后端新接口**（user-profile 模块 + 公开分类 + 题目分类筛选）~~ ✅ 已完成（含叶子节点约束 + Admin 前端适配）
7. ~~**App 历史 + 分类**（HistoryDrawer + CategorySelector + LoginPrompt）~~ ✅ 已完成
8. **App E2E 测试 + 边缘情况打磨** ← 当前
9. **系统日志**（独立模块，LoggingInterceptor + SystemLog 模型）
10. **WebSocket 客户端管理**（后端 ClientsGateway + quiz-app useWs）
11. **quiz-admin 前端**（系统日志视图 + 客户端管理视图）

---

_最后更新: 2026-02-27（Phase 2D 已完成：HistoryDrawer + CategorySelector + LoginPrompt + 分类筛选集成）_
