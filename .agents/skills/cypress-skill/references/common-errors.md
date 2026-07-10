# 常见错误与修复

## ELECTRON_RUN_AS_NODE 崩溃

### 症状

```
Cannot find module '.../Cypress.app/.../app/index.js'
```

### 原因

Claude Code 会设置 `ELECTRON_RUN_AS_NODE=1` 环境变量。
Cypress 基于 Electron，遇到这个变量会以 **Node 模式**启动而不是正常的 Electron 模式，导致找不到 app 入口。

### 修复

```bash
# 每次运行 Cypress 前必须 unset
unset ELECTRON_RUN_AS_NODE
pnpm -C apps/quiz-admin exec cypress run --e2e --spec "..."
```

---

## baseUrl 连接失败 / test/reset 403

### 症状 A — 连接失败

```
cy.visit() failed trying to load: http://localhost:10060
```

### 症状 B — 403 Forbidden

```
cy.request() failed: 403 Forbidden
Body: { "message": "Test endpoint disabled (ENABLE_TEST_ENDPOINT not set)" }
```

### 原因

- **连接失败**：`cypress.config.ts` 的 `baseUrl` 是 preview 端口（10060），但测试服务器没启动
- **403**：用 `--config baseUrl=http://localhost:10050` 指向了 dev server，dev 后端没有开启 `ENABLE_TEST_ENDPOINT`，`/api/test/reset` 被拒绝

### 修复

E2E 测试**必须用测试服务器**，不能指向 dev server：

```bash
# ✅ 正确：通过 run-e2e.sh 自动启动测试服务器
cd apps/quiz-admin
SPEC=cypress/e2e/foo.cy.ts bash scripts/run-e2e.sh

# ✅ 正确：测试服务器已在运行（preview-test.sh），指向 10060
unset ELECTRON_RUN_AS_NODE
pnpm -C apps/quiz-admin exec cypress run --e2e \
  --spec "cypress/e2e/foo.cy.ts" \
  --config baseUrl=http://localhost:10060

# ❌ 错误：指向 dev server，/api/test/reset 会 403
# --config baseUrl=http://localhost:10050
```

---

## 受控输入（:model-value）导致 input detach

### 症状

```
CypressError: cy.type() failed because this element is detached from the DOM.
```

### 原因

`el-input` 接收父组件 prop（`:model-value`）时，`.type()` 每次 keystroke 都触发 Vue 重新渲染，
原生 `<input>` DOM 被替换（detach），后续操作报错。

### 修复

```js
// ❌ 错误：逐字触发 re-render
cy.get("input").type("新名称");

// ✅ 正确：原子性设值 + 触发一次 input 事件
cy.get("input").invoke("val", "新名称").trigger("input", { force: true });
```

**区分方式**：查 Vue 模板，`:model-value="prop"` → 用 `invoke`；`v-model="localVar"` → 可用 `.type()`。

prop 驱动 input 触发 trigger 后，父组件 re-render 会替换确认按钮，后续 click 也加 `{ force: true }`：

```js
cy.contains("button", "确认").click({ force: true });
```

---

## opacity-0 悬浮按钮不可点击

### 症状

```
CypressError: cy.click() failed because this element is not visible.
```

### 原因

操作按钮用 CSS `opacity: 0` 默认隐藏，hover 时才显示。Cypress 判定为不可见。

### 修复

所有对这类按钮的操作加 `{ force: true }`：

```js
cy.find(".action-btn").eq(0).click({ force: true });
```

---

## 侧边栏折叠，菜单项不可交互

### 症状

`cy.contains(".menu-item", "用户管理")` 找不到元素或元素不可见。

### 原因

quiz-admin 侧边栏**默认折叠**，折叠时 `.menu-item` 文字不渲染或被隐藏。

### 修复

在 `beforeEach` 或测试开始时先展开侧边栏：

```js
cy.get(".header-icon-btn").first().click(); // 展开侧边栏
cy.contains(".menu-item", "用户管理").click();
```

---

## 端口冲突导致 E2E 连错数据库

### 症状

`resetTest()` 调用成功，但数据库内容没有被重置，E2E 测试拿到脏数据。

### 原因

dev 后端已经跑在 10020，`preview-test.sh` 检测到端口"就绪"就不再启动新后端，
但连接的是 dev 数据库，不是 test 数据库，数据库重置无效。

### 修复

```bash
# 运行 E2E 前先清理所有端口
pnpm clean:ports
```

---

## 等待加载完成（防止 re-render 竞态）

```js
// 操作前等 loading 消失
cy.get(".el-loading-mask").should("not.exist");

// 创建/修改后等待数据渲染
cy.contains(".list-item", "新建项目").should("exist");
cy.get(".el-loading-mask").should("not.exist");
```

---

## quiz-app Mock API 竞态条件

### 症状

```
Timed out retrying after 10000ms: cy.wait() timed out waiting 5000ms for the 2nd request
```

或 `watch` 触发的 API 调用没有发出。

### 原因

`QuizPage.vue` 的 `onMounted` 同时调用 `initCategories()`（不 await）和 `loadNext()`。
`useQuiz.ts` 中 `loadNext()` 有 `if (loading.value) return` 守卫。

当 Mock 响应过快时，`initCategories()` 设置 `selectedIds` 触发 `watch`，但此时 `loading=true`（第一次 `loadNext()` 仍在进行），导致 watch 触发的第二次 `loadNext()` 被守卫拦截。

### 修复

延迟触发 `selectedIds` 变化的响应（categories 或 preferences），确保初始 `loadNext()` 完成（`loading=false`）后再变更：

```js
// 延迟分类响应，让初始 loadNext() 先完成
cy.intercept("GET", "**/categories/groups", {
  statusCode: 200,
  body: { code: 0, data: mockGroups, message: "ok" },
  delay: 200, // ← 关键：200ms 延迟
});
```

---

## quiz-admin 种子数据名称冲突

### 症状

`cy.contains(".category-node__name", "前端")` 匹配到种子数据而非测试创建的节点，导致测试行为不可预期。

### 原因

`test/reset` 会种入"技术方向"→"前端"→"JavaScript / TypeScript" 等分类体系。如果测试中也创建同名维度/分类，会产生重复。

### 修复

- 使用唯一前缀命名：`"E2E通识维度"` / `"E2E父分类"` / `"E2E子A"`
- 或直接使用种子数据（不创建新数据），例如 questions.cy.ts 的分类选择器测试

---

## quiz-admin spec 不能并行跑

### 症状

同时跑 categories.cy.ts 和 questions.cy.ts 两个都挂在 `beforeEach` 阶段。

### 原因

两个 spec 的 `beforeEach` 都调用 `POST /api/test/reset`，同时重置数据库导致冲突。

### 修复

quiz-admin E2E spec 必须**串行执行**（Cypress 默认行为），不能用 `--parallel`。
