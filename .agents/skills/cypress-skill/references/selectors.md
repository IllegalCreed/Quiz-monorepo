# 元素选择器策略

## 选择器优先级（从好到差）

| 优先级 | 选择器                          | 原因                                 |
| ------ | ------------------------------- | ------------------------------------ |
| 1 ✅   | `[data-testid="xxx"]`           | 测试专用属性，开发者不因样式原因修改 |
| 2 ✅   | `cy.contains("button", "确认")` | 贴近用户视角，文字即语义             |
| 3 ⚠️   | `[aria-label="xxx"]`            | 语义属性，但不是每个元素都有         |
| 4 ❌   | `.class-name`                   | 样式重构时随时改名，会摧毁测试       |
| 5 ❌   | `:nth-child(n)` / `.eq(n)`      | 结构改变就挂，最脆弱                 |

## 添加 data-testid 的时机

**新增测试前**，先在 Vue 组件模板加 `data-testid`，再在测试里引用：

```html
<!-- 组件模板 -->
<el-button data-testid="create-btn">新增</el-button>
<div data-testid="list-item" class="list-item">...</div>
```

```js
// Cypress 测试
cy.get('[data-testid="create-btn"]').click();
cy.get('[data-testid="list-item"]').contains("目标文字").should("exist");
```

## overflow 容器内的断言

Cypress 的 `should("be.visible")` 检查 **CSS 可见性**（不是"在 DOM 中"）。
父容器有 `overflow:hidden` / `overflow-y:auto` 时，子元素即使在 DOM 中也可能被判定为 "not visible"。

```
规则：容器有 overflow 截断 → 用 should("exist")，不用 should("be.visible")
```

**本项目高风险容器**：

- `.categories-view__sidebar`（`overflow-y: auto`）
- `.categories-view__tree`（`overflow-y: auto`）
- `el-main`（Element Plus 内置滚动）
- `.history-tab-panel`（tab 横向滚动）

## 编辑模式下的定位策略

进入编辑模式后，原文字 span 被 `v-if`/`v-else` 替换为 input，文字定位失效。

```js
// 进入编辑模式
cy.contains(".group-item", "旧名称")
  .find(".group-actions button")
  .eq(0)
  .click({ force: true });

// 编辑模式后，用结构选择器（不依赖文字）
cy.get(".group-item input").invoke("val", "新名称").trigger("input");

// 确认用图标类定位，比 button:first 更精准
cy.get(".group-item .i-carbon-checkmark").click({ force: true });
```

## 项目按钮索引约定

| 组件                                         | `.eq(0)`   | `.eq(1)` | `.eq(2)` |
| -------------------------------------------- | ---------- | -------- | -------- |
| `.categories-view__group-actions button`     | 编辑       | 删除     | -        |
| `.category-node__actions button`             | 新增子节点 | 编辑     | 删除     |
| `.category-node__actions button`（通识节点） | 新增子节点 | -        | -        |

---

## Element Plus 组件 DOM 结构速查

### el-tree-select（v2.13）

`el-tree-select` 的 popper **不使用** `.el-tree-node__label`，而是用 `.el-select-dropdown__item`：

```
.el-tree-select__popper
  .el-tree-node                           ← 节点容器
    .el-tree-node__content
      .el-tree-node__expand-icon          ← 展开箭头
      .el-select-dropdown__item span      ← 文字区域
```

**选择器对照**：

| 操作          | ❌ 错误选择器              | ✅ 正确选择器                            |
| ------------- | -------------------------- | ---------------------------------------- |
| 找节点文字    | `.el-tree-node__label`     | `.el-select-dropdown__item`              |
| disabled 状态 | `.el-checkbox.is-disabled` | `.el-select-dropdown__item.is-disabled`  |
| 展开子节点    | 点击 label                 | `.el-tree-node__expand-icon`             |
| 选中后标签    | -                          | `.el-tag`（在 `.el-select__wrapper` 内） |

```js
// 找到"前端"节点
cy.contains(".el-select-dropdown__item", "前端");

// 展开"前端"子树
cy.contains(".el-select-dropdown__item", "前端")
  .closest(".el-tree-node")
  .find(".el-tree-node__expand-icon")
  .first()
  .click();

// 验证非叶子 disabled
cy.contains(".el-select-dropdown__item", "前端").should(
  "have.class",
  "is-disabled",
);

// 验证叶子可选
cy.contains(".el-select-dropdown__item", "JavaScript / TypeScript").should(
  "not.have.class",
  "is-disabled",
);

// 选中叶子并验证标签
cy.contains(".el-select-dropdown__item", "JavaScript / TypeScript").click();
cy.get(".question-detail-view__category-select .el-tag").should(
  "contain",
  "JavaScript / TypeScript",
);
```

> **排查技巧**：遇到 Element Plus 组件选择器失败时，用 Chrome DevTools MCP 的 `evaluate_script` + `innerHTML` 查看真实 DOM 结构。
