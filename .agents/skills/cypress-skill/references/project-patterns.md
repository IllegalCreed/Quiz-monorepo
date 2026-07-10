# 项目专属模式

## Vue 3 + Pinia 响应式陷阱

### 问题：解构 Pinia store 导致 Ref 失效

```ts
// ❌ 危险：直接解构 store 方法，内部捕获的数组引用可能失效
const { visitedViews, close } = useRouterStore();
```

Pinia 的 `state` 是 `ref`，直接从 store 取出的是已解包的值（`RouteLike[]`）。
如果 store action 用 `= newArray` 替换了 `ref.value`，外部捕获的旧数组引用就失效了，
导致 UI 不更新。

**规则：store action 里对数组的修改必须用 in-place splice，不能替换 ref.value**：

```ts
// ❌ 错误：替换 ref.value，外部引用失效
visitedViews.value = visitedViews.value.filter(...);

// ✅ 正确：in-place 修改，保持同一个数组对象
const kept = visitedViews.value.filter(...);
visitedViews.value.splice(0, visitedViews.value.length, ...kept);
```

### 在 composable 中用 storeToRefs

```ts
import { storeToRefs } from "pinia";

// ✅ storeToRefs 返回的是和 store 同步的 Ref<T>，保持响应式追踪
const { visitedViews } = storeToRefs(routerStore);

// template 中自动解包（不需要 .value）
// <div v-for="item in visitedViews">

// script 中需要 .value
const hasItems = computed(() => visitedViews.value.length > 0); // ← .value 必须
```

---

## 数据库重置（E2E 测试前）

`resetTest()` 必须按 FK 顺序清除所有业务表：

```ts
// FK 优先删
await prisma.questionCategory.deleteMany();
await prisma.option.deleteMany();
await prisma.question.deleteMany();
// 自引用 FK：循环从叶节点删
let hasCategories = true;
while (hasCategories) {
  const { count } = await prisma.category.deleteMany({
    where: { children: { none: {} } },
  });
  hasCategories = count > 0;
}
await prisma.categoryGroup.deleteMany();
```

---

## Admin 种子数据注意事项

`seed-admin.ts` 中 admin 必须指定固定 `id`，否则 MySQL auto-increment 每次重置后递增，
导致旧 JWT token 失效（"管理员不存在"）：

```ts
await prisma.admin.upsert({
  where: { id: 1 },      // ← 用 id 而非 username
  create: { id: 1, username: "super_admin", ... },
  update: {},
});
```

---

## quiz-admin 特有的 UI 行为

### 侧边栏默认折叠

- 登录后侧边栏默认折叠，`.menu-item` 文字不可见
- **E2E 测试 beforeEach 必须展开**：`cy.get(".header-icon-btn").first().click()`

### 登录自动添加欢迎页 Tab

- 登录跳转 `/home/dashboard` 时，`useHistoryRouter` 自动把 dashboard 加入 Tab 历史
- **不要在 beforeEach 中手动点击欢迎页**，否则会有重复

### el-main 有独立滚动条

- `scrollBehavior` 只对 `window` 有效，无法控制 `el-main` 的滚动
- 路由切换重置 `el-main` 滚动：
  ```ts
  router.afterEach(() => {
    document.querySelector(".home-main")?.scrollTop = 0;
  });
  ```

### keep-alive + Tab 历史

Tab 历史记录依赖 `keep-alive` + `cachedViews`：

- `history-tab-panel.vue` 的 `v-for` 绑定的是 `visitedViews`（来自 `storeToRefs`）
- `keep-alive` 的 `:include` 绑定的是 `cachedViews`
- 两个数组都需要通过 `storeToRefs` 获取，或在 store action 中用 `splice` 原地修改

---

## 现有 E2E 测试文件速查

### quiz-admin（连真实后端 test DB）

| 文件                            | 测试数 | 测试范围                                         |
| ------------------------------- | ------ | ------------------------------------------------ |
| `cypress/e2e/login.cy.ts`       | 9      | 登录流程 + 菜单权限 + 登出                       |
| `cypress/e2e/dashboard.cy.ts`   | 10     | 仪表盘：欢迎卡片 + 统计 + 图表 + 在线状态 + 日志 |
| `cypress/e2e/users.cy.ts`       | 8      | 用户列表管理 + 详情页（做题历史、偏好分类）      |
| `cypress/e2e/questions.cy.ts`   | 9      | 题目管理 CRUD + 分类选择器（el-tree-select）     |
| `cypress/e2e/categories.cy.ts`  | 14     | 分类管理 CRUD + 通識节点行为                     |
| `cypress/e2e/admins.cy.ts`      | 6      | 管理员管理                                       |
| `cypress/e2e/roles.cy.ts`       | 5      | 角色管理                                         |
| `cypress/e2e/permissions.cy.ts` | 3      | 权限查看                                         |
| `cypress/e2e/system-logs.cy.ts` | 42     | 系统日志列表 + 筛选 + 分页                       |
| `cypress/e2e/clients.cy.ts`     | 14     | 客户端管理 + SSE Mock                            |
| `cypress/e2e/history-tab.cy.ts` | 9      | Tab 历史记录 + 右键菜单                          |

### quiz-app（Mock API 模式）

| 文件                                   | 测试数 | 测试范围                              |
| -------------------------------------- | ------ | ------------------------------------- |
| `cypress/e2e/quiz.cy.ts`               | 6      | 答题核心流程                          |
| `cypress/e2e/auth-flow.cy.ts`          | 12     | 登录/注册对话框 + 用户菜单 + 退出登录 |
| `cypress/e2e/category-filtering.cy.ts` | 8      | 分类筛选对话框 + 游客/登录偏好持久化  |
| `cypress/e2e/history-drawer.cy.ts`     | 7      | 答题历史抽屉 + 筛选 Tab               |

---

## quiz-app Mock API 模式

quiz-app E2E 使用 `cy.intercept()` 拦截所有 API 请求（不连真实后端），好处：

- 不依赖后端启动，速度快
- 可精确控制响应数据和时序
- 可模拟错误场景（403、409 等）

### Mock 登录辅助函数

```ts
/** 模拟已登录状态 */
function setupLoggedIn() {
  cy.intercept("POST", "**/user/auth/login", {
    statusCode: 200,
    body: {
      code: 0,
      data: {
        token: "fake-token",
        user: { id: 1, username: "tester", nickname: "测试用户" },
      },
      message: "ok",
    },
  }).as("loginRequest");

  cy.intercept("GET", "**/user/auth/info", {
    statusCode: 200,
    body: {
      code: 0,
      data: { id: 1, username: "tester", nickname: "测试用户", email: null },
      message: "ok",
    },
  });
}
```

### 统一响应格式

后端 `TransformInterceptor` 包装所有响应为 `{ code: 0, message: "success", data: T }`。
Mock 数据也必须遵循此格式：

```ts
cy.intercept("GET", "**/categories/groups", {
  statusCode: 200,
  body: { code: 0, data: mockGroups, message: "ok" },
});
```
