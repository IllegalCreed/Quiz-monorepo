---
name: cypress-skill
description: Cypress E2E 测试经验 —— 针对 Vue 3 + Element Plus + Pinia 管理后台的选择器策略、常见陷阱、调试工作流与项目专属模式
user-invokable: false
metadata:
  domain: testing
  frameworks: [cypress, vue3, element-plus, pinia, vite]
  project: quiz-admin
---

# Cypress E2E Skill

## Preferences（工作偏好）

- **选择器**：首选 `[data-testid]`，其次用户可见文字 `cy.contains()`，最后才用 class
- **断言**：`overflow` 容器内用 `should("exist")`，确认在视口中才用 `should("be.visible")`
- **受控输入**（`:model-value` 绑定）：用 `.invoke("val", v).trigger("input", { force: true })`，不用 `.type()`
- **opacity-0 按钮**：所有操作加 `{ force: true }`
- **聚焦测试**：`it.only()` / `describe.only()` 调试，提交前必须移除
- **单独测试**：只跑目标 spec，不跑完整 `test:e2e`（慢）

## Core（核心知识索引）

| 主题           | 参考文件                                                         |
| -------------- | ---------------------------------------------------------------- |
| 元素选择器策略 | [references/selectors.md](references/selectors.md)               |
| 常见错误与修复 | [references/common-errors.md](references/common-errors.md)       |
| 调试工作流     | [references/workflow.md](references/workflow.md)                 |
| 项目专属模式   | [references/project-patterns.md](references/project-patterns.md) |

## Quick Reference（速查）

### 启动 E2E 测试（项目标准命令）

```bash
# ⚠️ E2E 测试必须使用测试服务器（test 模式后端 + preview 前端）
# 不能用 dev server（10050），因为 dev 后端没有 ENABLE_TEST_ENDPOINT，
# beforeEach 中的 /api/test/reset 会 403

# 方式一（推荐）：通过 pnpm script，先 build:test 再跑全部 E2E
pnpm -C apps/quiz-admin run test:e2e

# 方式二：先编译，再跑单个 spec
pnpm -C apps/quiz-admin run build:test
cd apps/quiz-admin
SPEC=cypress/e2e/users.cy.ts bash scripts/run-e2e.sh

# 方式三：测试服务器已在运行 + dist 已最新时，直接手动跑 cypress
# 适用于连续调试多个 spec，避免每次重新构建和重启服务器
unset ELECTRON_RUN_AS_NODE
pnpm -C apps/quiz-admin exec cypress run --e2e \
  --spec "cypress/e2e/foo.cy.ts" \
  --config baseUrl=http://localhost:10060

# ❌ 错误示范：
# 1. 直接 bash scripts/run-e2e.sh 跳过了 build 步骤，会用旧的 dist
# 2. 指向 dev server（10050），test/reset 会 403
```

> **关键**：`test:e2e` = `build:test` + `run-e2e.sh`。`run-e2e.sh` 本身不构建，只启动服务器 + 跑 Cypress。

### 选择器优先级

```
[data-testid="xxx"]       ← 首选，测试专用属性
cy.contains("btn", "文字") ← 次选，贴近用户视角
[aria-label="xxx"]        ← 语义属性
.class-name               ← 尽量避免，样式重构会改名
:nth-child(n)             ← 最脆弱
```

### 受控输入写法

```js
// ❌ 错误：逐字触发 re-render，input detach from DOM
cy.get("input").type("新名称");

// ✅ 正确：原子性设值 + 触发一次 input 事件
cy.get("input").invoke("val", "新名称").trigger("input", { force: true });
```

### overflow 容器内的断言

```js
// overflow:hidden/auto 容器 → exist，不用 be.visible
cy.get('[data-testid="item"]').should("exist");

// 确认在视口内才用 be.visible
cy.get(".dialog-title").should("be.visible");
```

### beforeEach 登录模板（quiz-admin）

```ts
beforeEach(() => {
  cy.clearLocalStorage();
  cy.visit("/login");
  cy.get('input[placeholder="用户名"]').type("super_admin");
  cy.get('input[placeholder="密码"]').type("super_admin");
  cy.contains("button", "登录").click();
  cy.url().should("include", "/home/dashboard");
  // 侧边栏默认折叠，需先展开才能点击菜单项
  cy.get(".header-icon-btn").first().click();
});
```
