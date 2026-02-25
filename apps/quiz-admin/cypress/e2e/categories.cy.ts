/**
 * Quiz Admin E2E 测试 - 分类管理
 * 测试分类维度和分类节点的 CRUD 功能，以及权限隔离
 *
 * 关键技术说明：
 * - CategoryTreeNode 的 editingName / newCategoryName 是 prop 驱动的受控输入
 *   直接 .type() 会因每次 keystroke 引发 Vue re-render，导致 native input detach
 *   正确做法：.invoke("val", value).trigger("input") 原子性地设置值并触发一次事件
 * - overflow:hidden / overflow-y:auto 容器内的元素用 should("exist") 替代 should("be.visible")
 * - 创建维度后 loadGroups 会自动选中第一个维度，右侧显示的是空树而非"请选择维度"提示
 */

describe("分类管理", () => {
  const BACKEND_URL = Cypress.env("apiBaseUrl") || "http://localhost:10020";
  const RESET_SECRET = Cypress.env("TEST_RESET_SECRET");

  beforeEach(() => {
    // 重置测试数据库（分类表初始为空）
    cy.request({
      method: "POST",
      url: `${BACKEND_URL}/api/test/reset`,
      headers: { "x-reset-secret": RESET_SECRET },
    });

    // 清除 localStorage
    cy.clearLocalStorage();

    // 使用超级管理员登录
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home");

    // 直接访问分类管理页面
    cy.visit("/home/categories");
    cy.url().should("include", "/home/categories");

    // 等待 loading 消失
    cy.get(".el-loading-mask").should("not.exist");
  });

  // ── 基础加载 ─────────────────────────────────────────────────────────────

  it("分类管理页面应正常加载", () => {
    // 验证页面标题
    cy.contains("h2", "分类管理").should("be.visible");

    // 验证页面描述文本（contains 支持子串匹配）
    cy.contains("管理题目的多维度结构化分类体系").should("be.visible");

    // 验证左侧维度面板标题和按钮
    cy.contains(".categories-view__sidebar-title", "分类维度").should("be.visible");
    cy.contains("button", "新增维度").should("be.visible");

    // 验证空状态提示（初始无维度）
    cy.contains("暂无维度，点击「新增维度」开始").should("be.visible");
  });

  // ── 维度 CRUD ─────────────────────────────────────────────────────────────

  it("应该能够创建分类维度", () => {
    // 点击新增维度
    cy.contains("button", "新增维度").click();

    // 输入框出现（group-input-row 是 v-model 直接绑定，.type() 安全）
    cy.get(".categories-view__group-input-row").should("exist");
    cy.get(".categories-view__group-input-row input").type("技术方向");

    // 点击确认
    cy.contains(".categories-view__group-input-row button", "确认").click();

    // 维度出现在列表中
    cy.contains(".categories-view__group-item", "技术方向").should("exist");

    // 验证创建成功提示（不检查右侧面板内容，因为 DB 中可能存在系统预置的同名分类组）
    cy.get(".el-message--success").should("be.visible");
  });

  it("新增维度：输入为空时不允许创建（警告提示）", () => {
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").clear();
    cy.contains(".categories-view__group-input-row button", "确认").click();

    // 应提示名称不能为空
    cy.get(".el-message--warning").should("be.visible");

    // 输入框仍然存在（未关闭）
    cy.get(".categories-view__group-input-row").should("exist");
  });

  it("应该能够编辑维度名称", () => {
    // 先创建一个维度
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("旧维度名称");
    cy.contains(".categories-view__group-input-row button", "确认").click();
    cy.contains(".categories-view__group-item", "旧维度名称").should("exist");

    // 点击编辑按钮（index 0 = edit，opacity-0 需 force）
    cy.contains(".categories-view__group-item", "旧维度名称")
      .find(".categories-view__group-actions button")
      .eq(0)
      .click({ force: true });

    // editingGroupName 是 v-model 直接绑定（非 prop 驱动），但仍用 invoke 避免潜在问题
    cy.get(".categories-view__group-item input").should("exist");
    cy.get(".categories-view__group-item input").invoke("val", "新维度名称").trigger("input");

    // 点击确认（通过 checkmark 图标定位，比 button:first 更精准）
    cy.get(".categories-view__group-item .i-carbon-checkmark").click({ force: true });

    // 验证名称已更新
    cy.contains(".categories-view__group-item", "新维度名称").should("exist");
  });

  it("应该能够删除空维度", () => {
    // 先创建一个维度
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("待删除维度");
    cy.contains(".categories-view__group-input-row button", "确认").click();
    cy.contains(".categories-view__group-item", "待删除维度").should("exist");

    // 点击删除按钮（index 1 = delete/danger，opacity-0 需 force）
    cy.contains(".categories-view__group-item", "待删除维度")
      .find(".categories-view__group-actions button")
      .eq(1)
      .click({ force: true });

    // 确认删除对话框
    cy.contains(".el-message-box", "删除确认").should("be.visible");
    cy.contains(".el-message-box button", "确认删除").click();

    // 验证维度已消失
    cy.contains(".categories-view__group-item", "待删除维度").should("not.exist");

    // 验证成功提示
    cy.contains(".el-message", "维度已删除").should("be.visible");
  });

  // ── 分类节点 CRUD ─────────────────────────────────────────────────────────

  it("应该能够在维度下创建根分类节点", () => {
    // 先创建维度
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("技术方向");
    cy.contains(".categories-view__group-input-row button", "确认").click();

    // 等待维度创建完成 + 自动选中后右侧内容出现
    cy.contains(".categories-view__group-item", "技术方向").should("exist");

    // 等待右侧树区域出现（overflow:hidden 容器，用 exist）
    cy.contains("「技术方向」分类树").should("exist");

    // 点击新增根分类
    cy.contains("button", "新增根分类").click();

    // 根分类输入框（categories-view__add-row 中 v-model 直接绑定，.type() 安全）
    cy.get(".categories-view__add-row").should("exist");
    cy.get(".categories-view__add-row input").type("前端");
    cy.contains(".categories-view__add-row button", "确认").click();

    // 分类节点出现在树中（位于 overflow-y:auto 树容器内，用 exist）
    cy.contains(".category-node__name", "前端").should("exist");

    // 维度旁的数字徽章应不为空
    cy.contains(".categories-view__group-item", "技术方向")
      .find(".categories-view__group-count")
      .should("not.be.empty");
  });

  it("应该能够创建子分类节点", () => {
    // 先建维度和根分类
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("技术方向");
    cy.contains(".categories-view__group-input-row button", "确认").click();
    cy.contains(".categories-view__group-item", "技术方向").click();
    cy.contains("button", "新增根分类").click();
    cy.get(".categories-view__add-row input").type("前端");
    cy.contains(".categories-view__add-row button", "确认").click();

    // 等待"前端"出现且加载完成（避免 loadGroups async 完成导致 re-render）
    cy.contains(".category-node__name", "前端").should("exist");
    cy.get(".el-loading-mask").should("not.exist");

    // 点击"前端"节点旁的"新增子节点"按钮（index 0 = add-child，opacity-0 需 force）
    cy.contains(".category-node__row", "前端")
      .find(".category-node__actions button")
      .eq(0)
      .click({ force: true });

    // category-node__add-row 的 input 是 prop 驱动（newCategoryName 从父传入）
    // 用 invoke("val").trigger("input") 原子性设值，避免 .type() 触发多次 re-render 导致 detach
    cy.get(".category-node__add-row").should("exist");
    cy.get(".category-node__add-row input").invoke("val", "Vue").trigger("input", { force: true });
    cy.contains(".category-node__add-row button", "确认").click({ force: true });

    // "Vue" 子节点出现
    cy.contains(".category-node__name", "Vue").should("exist");
  });

  it("应该能够编辑分类节点名称", () => {
    // 建维度、根分类
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("技术方向");
    cy.contains(".categories-view__group-input-row button", "确认").click();
    cy.contains(".categories-view__group-item", "技术方向").click();
    cy.contains("button", "新增根分类").click();
    cy.get(".categories-view__add-row input").type("旧分类名");
    cy.contains(".categories-view__add-row button", "确认").click();

    // 等待节点稳定
    cy.contains(".category-node__name", "旧分类名").should("exist");
    cy.get(".el-loading-mask").should("not.exist");

    // 点击编辑按钮（index 1 = edit，opacity-0 需 force）
    cy.contains(".category-node__row", "旧分类名")
      .find(".category-node__actions button")
      .eq(1)
      .click({ force: true });

    // category-node__input 中的 el-input 是 prop 驱动（editingName 从父传入）
    // 用 invoke("val").trigger("input") 设值，避免 .type() 多次 re-render 导致 detach
    cy.get(".category-node__input input").should("exist");
    cy.get(".category-node__input input").invoke("val", "新分类名").trigger("input");

    // 点击确认（通过 checkmark 图标定位）
    cy.get(".category-node__row .i-carbon-checkmark").click({ force: true });

    // 验证名称已更新
    cy.contains(".category-node__name", "新分类名").should("exist");
  });

  it("应该能够删除叶节点分类", () => {
    // 建维度、根分类
    cy.contains("button", "新增维度").click();
    cy.get(".categories-view__group-input-row input").type("技术方向");
    cy.contains(".categories-view__group-input-row button", "确认").click();
    cy.contains(".categories-view__group-item", "技术方向").click();
    cy.contains("button", "新增根分类").click();
    cy.get(".categories-view__add-row input").type("待删除分类");
    cy.contains(".categories-view__add-row button", "确认").click();
    cy.contains(".category-node__name", "待删除分类").should("exist");

    // 点击删除按钮（index 2 = delete/danger，opacity-0 需 force）
    cy.contains(".category-node__row", "待删除分类")
      .find(".category-node__actions button")
      .eq(2)
      .click({ force: true });

    // 确认删除对话框
    cy.contains(".el-message-box", "删除确认").should("be.visible");
    cy.contains(".el-message-box button", "确认删除").click();

    // 验证节点已消失
    cy.contains(".category-node__name", "待删除分类").should("not.exist");

    // 验证成功提示
    cy.contains(".el-message", "分类已删除").should("be.visible");
  });

  // ── 权限隔离 ─────────────────────────────────────────────────────────────

  it("无 categories 权限的管理员访问分类管理应被重定向", () => {
    // 登出当前超级管理员（点击右上角用户头像下拉菜单）
    cy.get(".user-dropdown").click();
    cy.contains(".dropdown-item", "退出登录").click();

    // 确认登出 MessageBox
    cy.contains(".el-message-box", "确定退出登录").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    cy.url().should("include", "/login");

    // 使用普通管理员登录（无 categories 权限）
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home");

    // 尝试直接访问分类管理页面
    cy.visit("/home/categories");

    // 应被路由守卫重定向（categories 路由未注册给该用户）
    cy.url().should("not.include", "/home/categories");
    cy.url().should("include", "/home");
  });
});
