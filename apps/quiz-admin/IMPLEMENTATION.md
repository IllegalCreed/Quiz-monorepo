# Quiz Admin 实施指南

## 快速概览

基于 survey-admin 架构 + quiz-app 设计风格的管理后台。

**特性**：Mock 登录 | 权限系统（菜单 + API） | 超级/普通管理员 | 动态路由 + Tab 历史 | Element Plus + UnoCSS + 紫色主题

**端口**：开发 10050 | E2E 测试 10060 | **测试账号**：`super_admin` / `super_admin`（全权限）、`admin` / `admin`（部分权限）

---

## 已完成功能

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

- ✅ **环境变量文件**：`.env.example`（模板）、`.env.development.local`（开发）、`.env.test.local`（测试）、`.env.production.local`（生产）
- ✅ **配置项**：`VITE_API_BASE`（API 地址）、`VITE_MOCK`（Mock 开关）、`VITE_PORT`（端口）

### Bug 修复（2026-02-11 完成）

- ✅ **深色模式 Table/Card 背景色**：选择器从 `.dark` 改为 `html.dark`（匹配 Element Plus 优先级），新增 Table/Card 组件专属 CSS 变量
- ✅ **侧边栏手动展开收起失效**：参考 beitou-survey-admin，引入 `isManual` 标志区分手动/自动模式，跨越阈值时重置为自动模式

---

## 项目结构

```
apps/quiz-admin/
├── .env.example              # 环境变量模板
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
import './styles/index.scss' // Element Plus 深色模式（@use dark/css-vars.scss）
import './styles/main.scss' // 全局样式 + 主题变量
import 'element-plus/.../message-box.scss' // 弹窗组件（非按需引入）
import 'virtual:uno.css' // UnoCSS（最后导入，最高优先级）
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

### P1: 题目管理模块 ⭐⭐⭐

管理后台核心功能，管理 Quiz App 的题目数据。

**功能需求**：

- 题目列表：分页、按标签搜索/筛选
- 创建题目：题干 + 多个选项（标记正确答案）+ 标签
- 编辑/删除题目
- 批量导入题目（JSON 格式，复用 seed-test.json 结构）
- 题目预览（渲染效果预览）

**技术实现**：

- 新增 `src/views/questions/` 页面组件
- 新增 `src/api/mock/questions.ts` Mock API
- 更新 `src/router/home-routes.ts` 添加 questions 路由
- 新增 `src/types/question.ts` 类型定义（对齐后端 Prisma schema）
- 更新权限定义：`questions`（菜单）+ `questions:read/write/delete`（API）

**参考设计**：

- 列表页：Element Plus Table + Pagination
- 表单页：Element Plus Form + Dynamic Form Items（选项动态添加/删除）
- 标签筛选：Element Plus Select（multiple）

---

### P2: 真实 API 对接 ⭐⭐

将 Mock API 替换为真实后端接口。

**需要新增的后端接口**：

| 接口                                | 方法       | 功能                                |
| ----------------------------------- | ---------- | ----------------------------------- |
| `/api/admin/login`                  | POST       | 管理员登录，返回 token              |
| `/api/admin/info`                   | GET        | 获取当前管理员信息 + 权限           |
| `/api/admin/logout`                 | POST       | 登出                                |
| `/api/admin/users`                  | GET/POST   | App 用户列表/创建                   |
| `/api/admin/users/:id`              | PUT/DELETE | 更新/删除 App 用户                  |
| `/api/admin/admins`                 | GET/POST   | 管理员列表/创建（super_admin only） |
| `/api/admin/admins/:id`             | PUT/DELETE | 更新/删除管理员                     |
| `/api/admin/admins/:id/permissions` | PUT        | 更新管理员权限                      |
| `/api/admin/questions`              | GET/POST   | 题目列表/创建                       |
| `/api/admin/questions/:id`          | PUT/DELETE | 更新/删除题目                       |

**前端改造**：

- 新增 `src/api/` 真实 API 调用（account.ts/users.ts/admins.ts/questions.ts）
- 配置 axios 实例（baseURL/timeout/interceptors）
- 请求拦截器：注入 token（`Authorization: Bearer ${token}`）
- 响应拦截器：401 自动跳转登录，统一错误处理
- 根据 `VITE_MOCK` 环境变量切换 mock/真实 API

---

### P3: E2E 测试补充 ⭐

为 admin 添加完整的 E2E 测试覆盖。

**测试场景**：

- 登录流程（正确/错误密码）
- 权限验证（普通管理员访问 admins 页面应被拦截）
- 用户管理 CRUD
- 管理员管理 CRUD（超级管理员）
- Tab 历史功能（打开/关闭/切换）

**技术方案**：

- 使用 Cypress（已安装）
- 参考 quiz-app 的 E2E 测试结构
- 测试端口：10060（`.env.test.local`）

---

## 开发指南

### 环境配置

1. **复制环境变量模板**：

   ```bash
   cp .env.example .env.development.local
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

_最后更新: 2026-02-11_
