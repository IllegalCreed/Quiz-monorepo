# Quiz Admin 实施指南

## 快速概览

基于 survey-admin 架构 + quiz-app 设计风格的管理后台。

**特性**：Mock 登录 | 权限系统（菜单 + API） | 超级/普通管理员 | 动态路由 + Tab 历史 | Element Plus + UnoCSS + 紫色主题

**端口**：开发 10050 | E2E 测试 10060 | **测试账号**：`super_admin` / `super_admin`（全权限）、`admin` / `admin`（部分权限）

---

## 已完成功能

### 基础框架

- Vite/UnoCSS/Element Plus 配置，SCSS + 紫色主题
- Mock 登录 + Token 持久化（`mock-token-{userId}-{timestamp}` 格式，刷新不丢失）
- 权限系统：菜单权限 + API 权限，动态路由注册
- 主布局：Header + Sidebar + Tab 历史 + keep-alive
- 深色模式：全局切换 + Element Plus CSS 变量覆盖（slate 系配色）

### 权限模型（用户 vs 管理员分离）

- **用户管理**（users）：管理 Quiz App 使用者，普通管理员可操作
- **管理员管理**（admins）：管理 Admin 后台账号，仅超级管理员可操作
- 超级管理员保护：不可删除、不可修改权限
- 权限定义：`users:read/write/delete` + `admins:read/write/delete/permission`

### Element Plus 样式体系

- SCSS 变量覆盖：`styles/element/index.scss`（浅色）+ `dark.scss`（深色）
- CSS 自定义属性：`main.scss` 中显式设置 `--el-color-primary` 全系列（解决弹窗白底白字问题）
- 深色模式：覆盖 25+ Element Plus CSS 变量（bg/fill/text/border/mask/shadow）
- Tailwind OKLCH 色阶：完整 CSS 变量（与 UI 库统一）

---

## 项目结构

```
src/
├── api/mock/               # Mock API
│   ├── account.ts           # 登录/登出/用户信息
│   ├── users.ts             # App 用户 CRUD
│   └── admins.ts            # 管理员 CRUD + 权限管理
├── components/
│   └── history-tab/         # Tab 历史组件
├── composables/             # 全局 Composables
│   ├── use-token.ts         # 模块级 ref 单例
│   └── use-mock-store.ts
├── router/
│   ├── index.ts             # 路由守卫 + 动态加载
│   ├── home-routes.ts       # 业务页面路由（dashboard/users/admins/settings）
│   ├── dynamic-routes.ts    # 权限过滤 + 动态注册
│   └── permission-routes-mapping.ts
├── stores/modules/          # Pinia Stores
│   ├── account.ts           # 登录/登出/用户信息
│   ├── menu.ts              # 权限过滤菜单
│   └── router.ts            # Tab 历史 + keep-alive
├── styles/
│   ├── main.scss            # Tailwind 色阶 + 主题变量 + Element Plus 覆盖
│   └── element/
│       ├── index.scss        # Element Plus SCSS 变量（@forward）
│       └── dark.scss         # Element Plus 深色模式 SCSS 变量
├── types/
│   ├── account.ts           # AdminUser + AppUser + LoginForm
│   ├── permission.ts        # 菜单/API 权限定义
│   └── menu.ts              # 菜单项类型
├── views/
│   ├── login/               # 登录页
│   ├── master/              # 主布局（Header + Sidebar + Home）
│   ├── dashboard/           # 欢迎页（统计卡片）
│   ├── users/               # 用户管理（App 用户 CRUD + 状态切换）
│   ├── admins/              # 管理员管理（权限配置 + 超级管理员保护）
│   └── system/              # 系统设置（占位）
├── App.vue
└── main.ts                  # 入口 + Element Plus 基础/弹窗/暗色样式导入
```

## 关键架构决策

- **图标双模式**：模板中静态图标用 `<i-carbon-sun>` 组件语法（unplugin-icons）；动态绑定图标用 `<i :class>` CSS 语法（UnoCSS presetIcons + safelist）
- **菜单折叠共享状态**：`use-menu-collapse.ts` 模块级 `ref` 单例，Header/Menu/HomeView 共享 `isCollapse`
- **深色模式菜单**：非 scoped `<style>` + `html.dark` 选择器覆盖 Element Plus CSS 变量
- **Element Plus 样式策略**：按需引入组件 SCSS（via unplugin-vue-components）+ `base.scss`（CSS 变量生成）+ `dark/css-vars.css`（深色模式兜底）+ `main.scss`（自定义覆盖）+ 弹窗组件 SCSS 手动导入

---

## 待完成任务

### P1: Header 图标 hover 配色优化

**现状**：深色模式下图标 hover 变白色，视觉不协调。

**期望**：使用主题色浅色变体（如 `indigo-300`），与整体深色主题一致。

**涉及文件**：

- `src/views/master/header/header-view.vue`（`.header-icon-btn` 样式）

---

### P2: 题目管理模块

管理后台核心功能，管理 Quiz App 的题目数据。

**功能需求**：

- 题目列表：分页、按标签搜索/筛选
- 创建题目：题干 + 多个选项（标记正确答案）+ 标签
- 编辑/删除题目
- 批量导入题目（JSON 格式，复用 seed-test.json 结构）
- 题目预览（渲染效果预览）

**涉及新增文件**：

- `src/views/questions/` — 题目管理页面
- `src/api/mock/questions.ts` — Mock 题目 CRUD API
- `src/router/home-routes.ts` — 新增 questions 路由
- `src/types/question.ts` — 题目/选项类型（对齐后端 Prisma schema）

**菜单权限**：`questions`（菜单）+ `questions:read/write/delete`（API）

---

### P3: 真实 API 对接

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

**前端改造**：

- 新增 `src/api/account.ts`、`src/api/users.ts`、`src/api/admins.ts`
- 配置 axios 拦截器（token 注入、401 跳转）
- 根据 `VITE_MOCK` 环境变量切换 mock/真实 API

---

## 注意事项

1. **Mock 模式**：`.env.development.local` 中 `VITE_MOCK=true`
2. **端口**：开发 10050，E2E 测试 10060
3. **SCSS 注入**：Element Plus 依赖 `styles/element/index.scss` 通过 Vite `additionalData` 注入
4. **类型生成**：首次 `pnpm dev` 后自动生成 `components.d.ts` 和 `auto-imports.d.ts`
5. **超级管理员保护**：admins.ts Mock API 中硬编码 `role === 'super_admin'` 检查

## 参考

- **survey-admin**：`/Users/zhangxu/workspace/beitou-survey-admin`
- **quiz-app**：`apps/quiz-app`

---

_最后更新: 2026-02-11_
