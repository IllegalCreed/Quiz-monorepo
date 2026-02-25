# Quiz Admin 实施指南

## 快速概览

基于 survey-admin 架构 + quiz-app 设计风格的管理后台。

**特性**：Mock 登录 | 权限系统（菜单 + API） | 超级/普通管理员 | 动态路由 + Tab 历史 | Element Plus + UnoCSS + 紫色主题

**端口**：开发 10050 | E2E 测试 10060 | **测试账号**：`super_admin` / `super_admin`（全权限）、`admin` / `admin`（部分权限）

---

## 已完成功能

- 认证体系：JWT（7 天）+ Passport + Guards（JwtAuthGuard/PermissionGuard 通配符支持）
- 业务模块：Admins / Roles / Permissions CRUD + 保护规则（150 个后端单元测试，86~95% 覆盖率）
- 前端单元测试：88 个测试（utils / stores / composables / directives / mock API），覆盖率配置完善
- E2E 测试：4 个 Cypress 文件，连接真实后端，每次自动重置数据库
- 核心布局：Header + Sidebar（手动/自动展开）+ Tab 历史 + keep-alive + 深色模式
- 题目管理模块：后端 AdminQuestionsModule（5 个端点，软删除，选项 replace-all）+ 前端列表/详情页（Mock+真实 API，搜索筛选，动态选项）

**后端接口（20 个，均已实现）**：Auth × 3 | Admins × 5 | Roles × 5 | Permissions × 2 | AdminQuestions × 5

---

## 项目结构

```
apps/quiz-admin/src/
├── api/mock/             # Mock API（account/users/admins/questions）
├── components/history-tab/
├── composables/          # use-token.ts | use-mock-store.ts
├── router/
│   ├── index.ts          # 路由守卫 + 动态加载
│   ├── dynamic-routes.ts # 权限过滤（无自动重定向）
│   ├── home-routes.ts    # 业务页面路由
│   └── permission-routes-mapping.ts
├── stores/modules/       # account / menu / router
├── styles/
│   ├── index.scss        # Element Plus 深色模式
│   ├── main.scss         # 全局样式 + 25+ 深色 CSS 变量（slate 系）
│   └── element/          # SCSS 变量覆盖（浅色/深色）
└── views/
    ├── login/ | master/ | dashboard/
    ├── users/ | admins/ | roles/
    ├── questions/        # 列表页 + 详情页（新建/编辑复用）
    └── system/
```

---

## 关键技术决策

**CSS 导入顺序**（`main.ts`）：

```ts
import "./styles/index.scss"; // Element Plus 深色模式
import "./styles/main.scss"; // 全局样式 + 主题变量
import "element-plus/.../message-box.scss"; // 弹窗（非按需引入）
import "virtual:uno.css"; // UnoCSS（最后，最高优先级）
```

**动态图标**：模板静态用 `<i-carbon-sun>` 组件语法；动态绑定用 `<i :class="icon">` + UnoCSS safelist。

**超级管理员通配符**：菜单权限 `["*"]` 在 JWT 策略、菜单 Store、动态路由三处均已支持。

---

## 待完成任务

### P1: 题目管理模块测试 ✅

**后端单元测试**（`src/admin-questions/__tests__/`）：

- `admin-questions.service.spec.ts`：16 个测试用例（findAll 筛选分页、findOne 软删除过滤、create 答案校验、update $transaction、remove 软删除）
- `admin-questions.controller.spec.ts`：10 个测试用例（5 端点委托 + DTO 透传）

**前端 E2E 测试**（`cypress/e2e/questions.cy.ts`）：

- 6 个测试场景（列表加载、关键词搜索、新建、编辑、软删除、权限隔离）

### P2: 其他功能

- 批量导入题目（JSON 上传，复用 seed-test.json 结构）
- 题目预览（对齐 quiz-app 样式）
- Dashboard 真实统计数据

---

## 添加新页面流程

1. 创建 `src/views/{module}/{module}-view.vue`
2. `src/router/home-routes.ts` 添加路由定义
3. `src/types/permission.ts` 定义菜单 + API 权限
4. `src/router/permission-routes-mapping.ts` 配置权限映射
5. `src/stores/modules/menu.ts` 添加菜单项
6. （可选）`src/api/mock/{module}.ts` 创建 Mock API

---

## 故障排查

| 问题              | 原因                             | 解决                                             |
| ----------------- | -------------------------------- | ------------------------------------------------ |
| 样式丢失/白底白字 | CSS 导入顺序错误或 Vite 缓存     | 检查 `main.ts` 顺序；`rm -rf node_modules/.vite` |
| 动态路由 404      | `needToRefreshRouter` 未正确设置 | 检查 `router/index.ts` 的 `beforeEach`           |
| Tab 历史异常      | visitedViews 状态错误            | 确认 `dynamic-routes.ts` 无 `/home` 自动重定向   |

---

_最后更新: 2026-02-25（新增前端单元测试 88 个，覆盖率配置，后端测试扩充至 150 个）_
