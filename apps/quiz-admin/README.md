# quiz-admin

管理后台。提供题目、分类、管理员、角色、权限的完整 CRUD，支持 RBAC 权限系统、动态路由、深色模式。

**技术栈**：Vue 3 + Element Plus + UnoCSS + Pinia
**端口**：开发 `10050`，E2E 测试 `10060`

**测试账号**：`super_admin` / `super_admin`（全权限）、`admin` / `admin`（部分权限）

---

## 快速开始

```bash
# 在 monorepo 根目录
pnpm -C apps/quiz-admin dev

# 或在当前目录
pnpm dev
```

首次启动前，复制 `.env.example` 为 `.env.development.local`：

```bash
VITE_API_BASE=http://localhost:10020
VITE_MOCK=false
VITE_PORT=10050
```

---

## 常用命令

```bash
pnpm dev               # 开发服务器 (port 10050)
pnpm build             # 生产构建
pnpm test:unit         # 单元测试 (Vitest, ~120+ tests)
pnpm test:e2e          # E2E 测试 (Cypress, 连真实后端，5 个文件)
pnpm type-check        # TypeScript 类型检查
pnpm lint              # ESLint 检查
```

---

## 已实现功能

| 模块       | 功能                                                     |
| ---------- | -------------------------------------------------------- |
| 认证       | JWT 登录、7 天有效期                                     |
| 权限系统   | RBAC（菜单权限 + API 权限）、动态路由、超级管理员通配符  |
| 管理员管理 | CRUD、角色分配、保护规则                                 |
| 角色管理   | 自定义角色、菜单/API 权限配置                            |
| 题目管理   | 列表/搜索/筛选、新建/编辑/软删除、动态选项、分类关联     |
| 分类管理   | 多维度树形分类（无限层级递归组件）                       |
| 布局       | Header + Sidebar 折叠 + Tab 历史 + keep-alive + 深色模式 |

---

## 架构

```
src/
├── api/mock/             # Mock API（开发/测试用）
├── composables/          # use-token.ts | use-mock-store.ts
├── router/               # 动态路由 + 权限守卫
├── stores/modules/       # account / menu / router
├── styles/               # Element Plus 覆盖 + 全局变量
├── types/                # permission.ts | category.ts | question.ts
└── views/                # 各业务页面
```

---

## 相关文档

- [docs/dev.md](../../docs/dev.md) — 技术架构 + 添加新页面流程
- [docs/product.md](../../docs/product.md) — 产品需求
