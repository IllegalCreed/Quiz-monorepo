/**
 * Quiz Admin E2E 测试 - 历史 Tab 右键菜单
 * 测试右键菜单的弹出、关闭当前、关闭其他、关闭全部功能
 * 不依赖后端数据，纯前端交互测试
 */

describe("历史 Tab 右键菜单", () => {
  /** 登录并打开多个 Tab 的公共前置操作 */
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 展开侧边栏（默认收起，menu-item 不可交互）
    cy.get(".header-icon-btn").first().click();

    // 登录后 dashboard 已自动加 "欢迎页" Tab，再点两个
    cy.contains(".menu-item", "用户管理").click();
    cy.contains(".menu-item", "题目管理").click();

    // 确认 3 个 Tab 已出现
    cy.get(".history-tab-item").should("have.length", 3);
  });

  // ── 菜单弹出 / 关闭 ──────────────────────────────────────────────────────

  it("右键点击 Tab 应弹出上下文菜单，包含三个操作项", () => {
    cy.contains(".history-tab-item", "欢迎页").rightclick();

    cy.get(".history-tab-context-menu").should("exist");
    cy.get(".history-tab-context-menu").contains("关闭当前页签").should("exist");
    cy.get(".history-tab-context-menu").contains("关闭其他页签").should("exist");
    cy.get(".history-tab-context-menu").contains("关闭全部页签").should("exist");
  });

  it("点击页面空白处应关闭上下文菜单", () => {
    cy.contains(".history-tab-item", "欢迎页").rightclick();
    cy.get(".history-tab-context-menu").should("exist");

    // 点击内容区域空白处
    cy.get("main").click({ force: true });
    cy.get(".history-tab-context-menu").should("not.exist");
  });

  // ── 关闭当前 ─────────────────────────────────────────────────────────────

  it("关闭当前页签：移除被右键的 Tab，其余 Tab 保留", () => {
    // 右键点击「用户管理」（非当前激活 Tab）
    cy.contains(".history-tab-item", "用户管理").rightclick();
    cy.get(".history-tab-context-menu").contains("关闭当前页签").click();

    // 用户管理消失
    cy.contains(".history-tab-item", "用户管理").should("not.exist");
    // 其余 Tab 保留
    cy.contains(".history-tab-item", "欢迎页").should("exist");
    cy.contains(".history-tab-item", "题目管理").should("exist");
  });

  it("关闭当前页签：关闭激活中的 Tab，应自动跳转到相邻 Tab", () => {
    // 当前激活「题目管理」，右键自身
    cy.contains(".history-tab-item", "题目管理").rightclick();
    cy.get(".history-tab-context-menu").contains("关闭当前页签").click();

    cy.contains(".history-tab-item", "题目管理").should("not.exist");
    // 自动跳转后 URL 不再包含 /questions
    cy.url().should("not.include", "/questions");
  });

  // ── 关闭其他 ─────────────────────────────────────────────────────────────

  it("关闭其他页签：只保留右键点击的 Tab，URL 跳转到该 Tab", () => {
    cy.contains(".history-tab-item", "欢迎页").rightclick();
    cy.get(".history-tab-context-menu").contains("关闭其他页签").click();

    cy.get(".history-tab-item").should("have.length", 1);
    cy.contains(".history-tab-item", "欢迎页").should("exist");
    cy.url().should("include", "/dashboard");
  });

  it("关闭其他页签：右键点击当前激活 Tab，不触发路由跳转", () => {
    // 题目管理是当前激活页
    cy.contains(".history-tab-item", "题目管理").rightclick();
    cy.get(".history-tab-context-menu").contains("关闭其他页签").click();

    cy.get(".history-tab-item").should("have.length", 1);
    // 当前路由不变
    cy.url().should("include", "/questions");
  });

  // ── 关闭全部 ─────────────────────────────────────────────────────────────

  it("关闭全部页签：清空所有 Tab 并跳转 /home", () => {
    cy.contains(".history-tab-item", "欢迎页").rightclick();
    cy.get(".history-tab-context-menu").contains("关闭全部页签").click();

    cy.get(".history-tab-item").should("have.length", 0);
    cy.url().should("match", /\/home\/?$/);
  });

  // ── 禁用状态 ─────────────────────────────────────────────────────────────

  it("只剩一个 Tab 时，关闭其他页签应置灰不可点击", () => {
    // 用 X 关闭两个 Tab，只留欢迎页
    cy.contains(".history-tab-item", "用户管理").find(".tab-close").click({ force: true });
    cy.contains(".history-tab-item", "题目管理").find(".tab-close").click({ force: true });
    cy.get(".history-tab-item").should("have.length", 1);

    cy.contains(".history-tab-item", "欢迎页").rightclick();
    cy.get(".history-tab-context-menu")
      .contains("关闭其他页签")
      .parent()
      .should("have.class", "is-disabled");
  });
});
