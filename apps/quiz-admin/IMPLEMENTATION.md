# Quiz Admin 实施指南

## 快速概览

基于 survey-admin 架构 + quiz-app 设计风格的管理后台。

**特性**：Mock 登录 | 权限系统（菜单 + API） | 超级/普通管理员 | 动态路由 + Tab 历史 | Element Plus + UnoCSS + 紫色主题

**端口**：开发 10050 | E2E 测试 10060 | **测试账号**：`super_admin` / `super_admin`（全权限）、`admin` / `admin`（部分权限）

---

## 已完成功能

### 后端 API 实施（2026-02-12 完成）

**✅ Phase 1: 数据库基础**

- Admin/Role 数据模型设计与实现（分表策略）
- 完整迁移 SQL（DROP + CREATE，支持开发阶段快速迭代）
- 种子数据脚本（3 角色 + 2 管理员，bcrypt 加密，支持密码更新）

**✅ Phase 2: 认证体系**

- JWT 认证完整实现（7 天过期，Passport Strategy）
- Guards 系统（JwtAuthGuard + PermissionGuard，支持通配符）
- 装饰器系统（@CurrentAdmin, @RequirePermission, @Public）
- 全局过滤器和拦截器（统一响应格式 + 异常处理）

**✅ Phase 3: 业务模块**

- **Permissions 模块**：静态权限查询（6 个菜单权限 + 完整 API 权限列表）
- **Roles 模块**：完整 CRUD + 保护规则（超管角色/系统角色/使用中角色保护）
- **Admins 模块**：完整 CRUD + 保护规则（超管账号保护 + 密码加密 + 密码字段移除）

**✅ Phase 4: 后端单元测试（2026-02-12 完成）**

- **测试文件**：10 个测试文件，90 个测试用例全部通过
- **覆盖率**：Admins 86%，Roles 84%，Auth Guards 95%，Permissions 76%
- **测试覆盖**：
  - Auth 模块：登录逻辑、JWT 验证、权限守卫（通配符支持）
  - 业务模块：完整 CRUD + 业务规则（超管保护、系统角色保护）
  - 密码处理：bcrypt 加密、字段移除、角色兼容性

**✅ Phase 5: E2E 测试（2026-02-12 完成）**

- **测试文件**：4 个按模块组织的 Cypress 测试文件
  - `login.cy.ts` - 登录流程（9 个测试场景）
  - `admins.cy.ts` - 管理员管理（8 个测试场景）
  - `roles.cy.ts` - 角色管理（10 个测试场景）
  - `permissions.cy.ts` - 权限查询（9 个测试场景）
- **测试策略**：
  - 连接真实后端 API（http://localhost:10020）
  - 每个测试前自动重置数据库（调用 /api/test/reset）
  - 测试完整用户流程（登录 → CRUD → 权限验证 → 登出）
- **测试覆盖**：
  - 登录成功/失败、权限加载、菜单过滤、登出
  - 管理员 CRUD、超管保护、权限验证
  - 角色 CRUD、系统角色保护、使用中角色检查
  - 权限查询、API 权限结构验证、权限选择器

**已实现的后端接口（20 个）**：

| 模块                | 端点                           | 方法   | 权限               | 状态 |
| ------------------- | ------------------------------ | ------ | ------------------ | ---- |
| **Auth**            | `/api/admin/auth/login`        | POST   | Public             | ✅   |
|                     | `/api/admin/auth/info`         | GET    | JWT                | ✅   |
|                     | `/api/admin/auth/logout`       | POST   | JWT                | ✅   |
| **Admins**          | `/api/admin/admins`            | GET    | `admins:list`      | ✅   |
|                     | `/api/admin/admins/:id`        | GET    | `admins:list`      | ✅   |
|                     | `/api/admin/admins`            | POST   | `admins:create`    | ✅   |
|                     | `/api/admin/admins/:id/role`   | PATCH  | `admins:update`    | ✅   |
|                     | `/api/admin/admins/:id`        | DELETE | `admins:delete`    | ✅   |
| **Roles**           | `/api/admin/roles`             | GET    | `roles:list`       | ✅   |
|                     | `/api/admin/roles/:id`         | GET    | `roles:list`       | ✅   |
|                     | `/api/admin/roles`             | POST   | `roles:create`     | ✅   |
|                     | `/api/admin/roles/:id`         | PUT    | `roles:update`     | ✅   |
|                     | `/api/admin/roles/:id`         | DELETE | `roles:delete`     | ✅   |
| **Permissions**     | `/api/admin/permissions/menus` | GET    | `permissions:list` | ✅   |
|                     | `/api/admin/permissions/apis`  | GET    | `permissions:list` | ✅   |
| **Admin Questions** | `/api/admin/questions`         | GET    | `questions:list`   | ✅   |
|                     | `/api/admin/questions/:id`     | GET    | `questions:list`   | ✅   |
|                     | `/api/admin/questions`         | POST   | `questions:create` | ✅   |
|                     | `/api/admin/questions/:id`     | PATCH  | `questions:update` | ✅   |
|                     | `/api/admin/questions/:id`     | DELETE | `questions:delete` | ✅   |

**✅ Phase 6: 题目管理模块（2026-02-24 完成）**

- **后端**：`AdminQuestionsModule` 独立模块，5 个 CRUD 端点
  - 软删除（`deletedAt` 字段）+ 题型字段（`type`，默认 `single_choice`）
  - Schema 迁移 + 公开 API 软删除过滤修复
  - 选项 replace-all 更新策略（`$transaction`）
  - 创建时验证恰好 1 个正确答案
- **前端**：列表页 + 详情页（新建/编辑复用同一组件）
  - Mock API（5 条测试数据）+ 真实 API（`/api/admin/questions`）
  - 按关键词/标签搜索筛选 + 分页
  - 选项动态增删 + 单选正确答案 Radio Group
  - 权限路由：`questions`（列表）+ `question-detail`（详情，不缓存）
  - 超级管理员菜单权限通配符 `["*"]`：JWT 策略、菜单 Store、动态路由全部支持

- 超级管理员：`super_admin` / `super_admin`（全部权限）
- 普通管理员：`admin` / `admin123`（仅 users:\* 权限）

**测试验证**：

- ✅ 所有接口手动测试通过（认证、权限控制、CRUD、业务规则保护）
- ✅ 代码质量检查通过（ESLint + TypeScript + Lint）
- ✅ 权限控制验证（超管全权限、普通管理员权限隔离、403/401 错误处理）

### 核心架构（2026-02-11 前完成）

- ✅ Vite/UnoCSS/Element Plus 配置，SCSS + 紫色主题
- ✅ Mock 登录 + Token 持久化，权限系统（菜单 + API）
- ✅ 主布局：Header + Sidebar + Tab 历史 + keep-alive
- ✅ 深色模式：全局切换 + Element Plus slate 系配色
- ✅ 用户管理/管理员管理模块（CRUD + 权限配置）

### 样式优化（2026-02-11 完成）

- ✅ **Element Plus 样式修复**：移除 Tailwind reset，使用 Wind4 内置 reset，优化 CSS 导入顺序（参考 beitou-survey-admin）
- ✅ **菜单 hover 统一**：与 Header 按钮一致（slate 灰色系）
- ✅ **Tab 历史优化**：关闭所有 Tab 后停留在 `/home` 空白状态，移除自动重定向
- ✅ **测试覆盖**：添加 `use-token` composable 单元测试（4 个测试用例）

### 环境配置（2026-02-11 完成）

- ✅ **环境变量模板**：按环境拆分 `.env.{development,test,production}.example`（参考 quiz-app）
- ✅ **Mock 策略**：开发环境 `VITE_MOCK=true`，测试/生产环境 `VITE_MOCK=false`（连接真实后端）
- ✅ **配置项**：`VITE_API_BASE`（API 地址）、`VITE_MOCK`（Mock 开关）、`VITE_PORT`（端口）

### Bug 修复（2026-02-11 完成）

- ✅ **深色模式 Table/Card 背景色**：选择器从 `.dark` 改为 `html.dark`（匹配 Element Plus 优先级），新增 Table/Card 组件专属 CSS 变量
- ✅ **侧边栏手动展开收起失效**：参考 beitou-survey-admin，引入 `isManual` 标志区分手动/自动模式，跨越阈值时重置为自动模式

---

## 项目结构

```
apps/quiz-admin/
├── .env.development.example   # 开发环境模板（VITE_MOCK=true）
├── .env.test.example          # 测试环境模板（VITE_MOCK=false，连接真实后端）
├── .env.production.example    # 生产环境模板（VITE_MOCK=false）
├── .env.development.local    # 开发环境配置（git ignored）
├── .env.test.local           # 测试环境配置（git ignored）
├── .env.production.local     # 生产环境配置（git ignored）
├── src/
│   ├── api/mock/             # Mock API（account/users/admins）
│   ├── components/
│   │   └── history-tab/      # Tab 历史组件
│   ├── composables/          # 全局 Composables
│   │   ├── use-token.ts      # Token 管理（模块级单例）
│   │   └── use-mock-store.ts # Mock 开关
│   ├── router/
│   │   ├── index.ts          # 路由守卫 + 动态加载
│   │   ├── dynamic-routes.ts # 权限过滤 + 动态注册（已移除自动重定向）
│   │   └── home-routes.ts    # 业务页面路由
│   ├── stores/modules/       # Pinia Stores（account/menu/router）
│   ├── styles/
│   │   ├── index.scss        # Element Plus 深色模式（@use 导入）
│   │   ├── main.scss         # 全局样式 + Tailwind 色阶 + Element Plus 覆盖
│   │   └── element/          # Element Plus SCSS 变量覆盖
│   ├── views/
│   │   ├── login/            # 登录页（登录后跳转 /home/dashboard）
│   │   ├── master/           # 主布局（Header + Sidebar + Home）
│   │   ├── dashboard/        # 欢迎页（统计卡片）
│   │   ├── users/            # 用户管理（CRUD + 状态切换）
│   │   ├── admins/           # 管理员管理（权限配置 + 超级管理员保护）
│   │   ├── roles/            # 角色管理（CRUD + 权限配置/查看）
│   │   ├── questions/        # 题目管理（列表页 + 详情页）
│   │   └── system/           # 系统设置（占位）
│   └── main.ts               # 入口（优化后的 CSS 导入顺序）
├── vitest.config.ts          # 单元测试配置（已移除 passWithNoTests）
└── IMPLEMENTATION.md         # 本文档
```

---

## 关键技术决策

### 样式架构

**CSS 导入顺序**（参考 beitou-survey-admin）：

```ts
import "./styles/index.scss"; // Element Plus 深色模式（@use dark/css-vars.scss）
import "./styles/main.scss"; // 全局样式 + 主题变量
import "element-plus/.../message-box.scss"; // 弹窗组件（非按需引入）
import "virtual:uno.css"; // UnoCSS（最后导入，最高优先级）
```

**Element Plus 样式体系**：

- **SCSS 变量覆盖**：`styles/element/index.scss`（@forward 浅色）+ `dark.scss`（@forward 深色）
- **按需引入**：通过 unplugin-vue-components 自动引入组件 SCSS
- **深色模式配色**：`main.scss` 中完整覆盖 25+ CSS 变量（slate 系 bg/fill/text/border）
- **不需要手动导入 base.scss**：按需引入会自动处理

### 路由架构

- **动态路由**：根据用户权限动态加载子路由（`dynamic-routes.ts`）
- **Tab 历史**：关闭所有 Tab 后停留在 `/home` 空白状态（无自动重定向）
- **登录跳转**：登录成功后默认跳转 `/home/dashboard`（欢迎页）

### 图标系统

- **静态图标**：模板中用 `<i-carbon-sun>` 组件语法（unplugin-icons）
- **动态图标**：绑定时用 `<i :class="icon">` CSS 语法（UnoCSS presetIcons + safelist）

---

## 待完成任务

### P1: 题目管理模块全套测试 ⭐⭐⭐

**后端单元测试**（参考 `src/admins/__tests__/` 和 `src/roles/__tests__/`）：

- `admin-questions.service.spec.ts`：`findAll`（关键词/标签筛选、分页）、`findOne`（软删除过滤、NotFoundException）、`create`（正确答案校验、选项嵌套创建）、`update`（`$transaction` replace-all）、`remove`（软删除时间戳）
- `admin-questions.controller.spec.ts`：5 个端点权限装饰器验证、DTO 转换、Service 调用

**前端单元测试**（Vitest）：

- `question.ts` 类型验证
- Mock API 数据一致性

**前端 E2E 测试**（Cypress）：

- `questions.cy.ts`：列表展示、搜索/筛选、新建题目、编辑题目、软删除
- 权限隔离：无 `questions` 权限的账号不显示菜单、直接访问 URL 被重定向

---

### P2: 其他待完成功能

- **批量导入题目**：JSON 格式上传（复用 seed-test.json 结构）
- **题目预览**：渲染效果预览（对齐 quiz-app 样式）
- **Dashboard 统计**：真实数据（题目数、用户数、答题次数）

---

## 开发指南

### 环境配置

1. **复制环境变量模板**：

   ```bash
   cp .env.development.example .env.development.local  # 开发（Mock 模式）
   cp .env.test.example .env.test.local                # 测试（连接真实后端）
   cp .env.production.example .env.production.local    # 生产
   ```

2. **修改配置**（可选）：
   - `VITE_MOCK=true`：启用 Mock 数据（默认）
   - `VITE_API_BASE`：真实 API 地址（对接后端时）
   - `VITE_PORT`：开发服务器端口（默认 10050）

### 常用命令

```bash
# 开发
pnpm dev                    # 启动开发服务器（10050）
pnpm dev:backend            # 启动后端服务器（10020）

# 代码质量
pnpm test:unit              # 单元测试（~4 tests, <1s）
pnpm lint                   # Lint（oxlint + eslint）
pnpm type-check             # TypeScript 类型检查

# 构建
pnpm build                  # 生产构建
pnpm preview                # 预览生产构建
```

### 添加新页面流程

1. **创建页面组件**：`src/views/{module}/{module}-view.vue`
2. **添加路由定义**：`src/router/home-routes.ts`
3. **定义权限**：`src/types/permission.ts`（菜单 + API 权限）
4. **配置权限映射**：`src/router/permission-routes-mapping.ts`
5. **创建 Mock API**：`src/api/mock/{module}.ts`（可选）
6. **更新菜单**：`src/stores/modules/menu.ts`（添加菜单项）

---

## 技术栈参考

| 技术         | 版本   | 用途                          |
| ------------ | ------ | ----------------------------- |
| Vue          | 3.5.x  | 前端框架（Composition API）   |
| Element Plus | 2.13.x | UI 组件库                     |
| UnoCSS       | 66.x   | 原子化 CSS（Tailwind 4 风格） |
| Pinia        | 3.0.x  | 状态管理                      |
| Vue Router   | 5.0.x  | 路由管理                      |
| Vite         | 7.3.x  | 构建工具                      |
| TypeScript   | 5.9.x  | 类型系统                      |
| Vitest       | 4.0.x  | 单元测试                      |
| Cypress      | 15.x   | E2E 测试                      |

---

## 故障排查

### 问题：样式丢失/按钮白底白字

**原因**：CSS 导入顺序错误或 Vite 缓存问题。

**解决方案**：

1. 检查 `main.ts` 导入顺序（Element Plus → 全局样式 → UnoCSS）
2. 清理 Vite 缓存：`rm -rf node_modules/.vite .vite`
3. 重启开发服务器

### 问题：动态路由 404

**原因**：路由守卫中动态路由未正确加载。

**解决方案**：

1. 检查 `router/index.ts` 的 `beforeEach` 守卫
2. 确认 `needToRefreshRouter` 标志正确设置
3. 查看控制台是否有路由加载错误

### 问题：Tab 历史异常

**原因**：路由重定向或 visitedViews 状态错误。

**解决方案**：

1. 确认 `dynamic-routes.ts` 中已移除 `/home` 的自动重定向
2. 检查 `use-history-router.ts` 的 close 逻辑
3. 清理浏览器缓存并刷新

---

## 参考资源

- **beitou-survey-admin**：`/Users/zhangxu/workspace/beitou-survey-admin`（参考架构）
- **quiz-app**：`apps/quiz-app`（参考设计风格）
- **Element Plus**：https://element-plus.org/
- **UnoCSS**：https://unocss.dev/

---

_最后更新: 2026-02-24_
