# E2E 调试工作流

## 标准运行流程

```bash
# ⚠️ E2E 测试必须用测试服务器，不能用 dev server
# 原因：dev 后端没有 ENABLE_TEST_ENDPOINT，/api/test/reset 会 403

# 方式一（推荐）：通过 pnpm script，先 build:test 再跑全部 E2E
pnpm -C apps/quiz-admin run test:e2e

# 方式二：先编译，再用 SPEC 环境变量跑单个 spec
pnpm -C apps/quiz-admin run build:test
cd apps/quiz-admin
SPEC=cypress/e2e/users.cy.ts bash scripts/run-e2e.sh

# 方式三：测试服务器已在运行 + dist 已最新时，直接手动跑 cypress
# 适用于连续调试多个 spec，避免每次重新构建和重启服务器
# 先在另一个终端启动：bash scripts/preview-test.sh
unset ELECTRON_RUN_AS_NODE
pnpm -C apps/quiz-admin exec cypress run --e2e \
  --spec "cypress/e2e/foo.cy.ts" \
  --config baseUrl=http://localhost:10060
```

> **关键**：`test:e2e` = `build:test` + `run-e2e.sh`。`run-e2e.sh` 本身**不构建**，只启动服务器 + 跑 Cypress。
> 直接 `bash scripts/run-e2e.sh` 会跳过 build 步骤，导致使用旧的 dist 产物。

## 测试服务器 vs 开发服务器

| 模式        | 前端端口 | 后端端口 | 数据库  | test/reset | 命令                      |
| ----------- | -------- | -------- | ------- | ---------- | ------------------------- |
| 开发（dev） | 10050    | 10020    | dev DB  | ❌ 403     | `pnpm dev`                |
| E2E 测试    | 10060    | 10020    | test DB | ✅ 可用    | `bash scripts/run-e2e.sh` |

**关键区别**：E2E 后端以 `start:test` 启动（加载 `.env.test` + `.env.test.local`），开启了 `ENABLE_TEST_ENDPOINT`，
并连接 test 数据库。dev 后端不具备这些条件，所以 E2E 测试**必须用测试服务器**。

## `test:e2e` / `run-e2e.sh` 工作原理

`package.json` 中定义：`"test:e2e": "pnpm run build:test && sh ./scripts/run-e2e.sh"`

1. **build:test** — `vite build --mode test`，生成 `dist/` 目录
2. **run-e2e.sh** 执行流程：
   1. 清理端口（10060, 10020）— 防止 dev 服务器污染
   2. 启动 `preview-test.sh`（quiz-app/admin preview + 后端 test 模式）
   3. 等待前端和后端就绪（HTTP 探测）
   4. `unset ELECTRON_RUN_AS_NODE`（Claude Code 环境必须）
   5. 运行 Cypress（支持 `SPEC` 环境变量指定单个文件）
   6. 优雅停止所有服务，返回 Cypress 退出码

## 聚焦失败测试

```js
// 只跑这个 describe 下的所有 it
describe.only("分类管理", () => { ... });

// 只跑某个 it
it.only("应该能够创建根分类节点", () => { ... });
```

⚠️ **提交前必须移除 `.only`**，否则 CI 里其他 spec 不会执行。

## 测试结构最佳实践

### beforeEach 模板（quiz-admin 登录）

```ts
beforeEach(() => {
  cy.clearLocalStorage();
  cy.visit("/login");
  cy.get('input[placeholder="用户名"]').type("super_admin");
  cy.get('input[placeholder="密码"]').type("super_admin");
  cy.contains("button", "登录").click();
  cy.url().should("include", "/home/dashboard");
  // 重要：侧边栏默认折叠，必须展开才能点击菜单项
  cy.get(".header-icon-btn").first().click();
});
```

### 组织测试用例

```ts
describe("功能模块名", () => {
  beforeEach(() => { /* 登录 + 导航到目标页 */ });

  context("正向流程", () => {
    it("应该能够 XXX", () => { ... });
  });

  context("边界情况", () => {
    it("当 YYY 时应该 ZZZ", () => { ... });
  });
});
```

## 右键菜单测试技巧

浏览器原生右键菜单会拦截 `contextmenu` 事件，Cypress 默认不弹出原生菜单。
触发 `contextmenu` 事件用 `trigger`，然后检查自定义菜单是否出现：

```ts
cy.get(".history-tab-item").eq(1).trigger("contextmenu");
cy.get(".tab-context-menu").should("exist");
```

点击菜单项关闭时，用 `cy.contains` 精准定位菜单项文字：

```ts
cy.contains(".menu-item", "关闭其他页签").click();
// 验证只剩目标 tab
cy.get(".history-tab-item").should("have.length", 1);
```

## 运行 ResizeObserver 错误处理

Element Plus 组件（el-dialog 等）快速打开/关闭时可能触发 ResizeObserver 错误，
这是无害的浏览器行为，在 `support/e2e.ts` 中已忽略：

```ts
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver loop")) return false;
  return true;
});
```

---

## 使用 Chrome DevTools MCP 排查 DOM 结构

当 Element Plus 组件的选择器不符合预期时（如 `el-tree-select` 不用 `.el-tree-node__label`），
可通过 Chrome DevTools MCP 实时检查 DOM：

1. **导航到目标页面**：`navigate_page` → 目标 URL
2. **用 a11y 快照定位**：`take_snapshot` → 找到 combobox/treeitem 的 uid
3. **点击打开弹出层**：`click` → uid
4. **用 JS 提取真实 DOM**：
   ```js
   evaluate_script: () => {
     const popper = document.querySelector(".el-tree-select__popper");
     return popper.innerHTML.substring(0, 2000);
   };
   ```
5. 根据真实 DOM 结构修正 Cypress 选择器

> 这比盲猜选择器 → 跑测试 → 失败 → 再猜的循环快得多（一个 spec 跑 3 分钟）。
