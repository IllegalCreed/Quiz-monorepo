/**
 * Quiz Admin E2E 测试 - 登录流程
 * 测试登录、权限加载、登出功能
 */

describe("登录流程", () => {
  const BACKEND_URL = Cypress.env("apiBaseUrl") || "http://localhost:10020";
  const RESET_SECRET = Cypress.env("TEST_RESET_SECRET");

  beforeEach(() => {
    // 重置测试数据库
    cy.request({
      method: "POST",
      url: `${BACKEND_URL}/api/test/reset`,
      headers: { "x-reset-secret": RESET_SECRET },
    });

    // 清除 localStorage
    cy.clearLocalStorage();
    cy.visit("/login");
  });

  it("未登录时访问根路径应重定向到登录页", () => {
    cy.visit("/");
    cy.url().should("include", "/login");
  });

  it("登录页面正常加载", () => {
    // 验证页面标题
    cy.contains(".login-title", "Quiz Admin").should("be.visible");
    cy.contains(".login-subtitle", "管理后台").should("be.visible");

    // 验证表单元素存在
    cy.get('input[placeholder="用户名"]').should("be.visible");
    cy.get('input[placeholder="密码"]').should("be.visible");
    cy.contains("button", "登录").should("be.visible");
  });

  it("正确的用户名和密码应登录成功（超级管理员）", () => {
    // 填写表单
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");

    // 点击登录
    cy.contains("button", "登录").click();

    // 等待跳转到首页
    cy.url().should("include", "/home/dashboard");

    // 验证 localStorage 中有 token
    cy.window().then((win) => {
      const token = win.localStorage.getItem("admin-token");
      expect(token !== null).to.equal(true);
      expect(token).to.be.a("string");
      expect(token!.length).to.be.greaterThan(0);
    });

    // 验证顶部栏显示用户信息
    cy.contains(".nickname", "超级管理员").should("be.visible");
  });

  it("正确的用户名和密码应登录成功（普通管理员）", () => {
    // 填写表单
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");

    // 点击登录
    cy.contains("button", "登录").click();

    // 等待跳转到首页
    cy.url().should("include", "/home/dashboard");

    // 验证用户信息
    cy.contains(".nickname", "普通管理员").should("be.visible");
  });

  it("错误的密码应提示错误", () => {
    // 填写错误密码
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("wrong_password");

    // 点击登录
    cy.contains("button", "登录").click();

    // 应该显示错误提示
    cy.contains("账号或密码错误").should("be.visible");

    // 不应该跳转
    cy.url().should("include", "/login");
  });

  it("不存在的用户名应提示错误", () => {
    // 填写不存在的用户名
    cy.get('input[placeholder="用户名"]').type("nonexistent");
    cy.get('input[placeholder="密码"]').type("password");

    // 点击登录
    cy.contains("button", "登录").click();

    // 应该显示错误提示
    cy.contains("账号或密码错误").should("be.visible");
  });

  it("超级管理员登录后应看到所有菜单", () => {
    // 登录
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();

    // 等待跳转
    cy.url().should("include", "/home/dashboard");

    // 展开菜单（点击侧边栏折叠按钮）
    cy.get(".header-icon-btn").first().click();

    // 验证所有菜单都可见
    cy.contains(".menu-item", "欢迎页").should("be.visible");
    cy.contains(".menu-item", "用户管理").should("be.visible");
    cy.contains(".menu-item", "管理员管理").should("be.visible");
    cy.contains(".menu-item", "角色管理").should("be.visible");
    cy.contains(".menu-item", "系统设置").should("be.visible");
  });

  it("普通管理员登录后应只看到有权限的菜单", () => {
    // 登录
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");
    cy.contains("button", "登录").click();

    // 等待跳转
    cy.url().should("include", "/home/dashboard");

    // 展开菜单（点击侧边栏折叠按钮）
    cy.get(".header-icon-btn").first().click();

    // 验证有权限的菜单可见
    cy.contains(".menu-item", "欢迎页").should("be.visible");
    cy.contains(".menu-item", "用户管理").should("be.visible");

    // 验证无权限的菜单不可见
    cy.contains(".menu-item", "管理员管理").should("not.exist");
    cy.contains(".menu-item", "角色管理").should("not.exist");
  });

  it("登出后应返回登录页", () => {
    // 先登录
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 点击登出按钮
    cy.get(".user-dropdown").click();
    cy.contains(".dropdown-item", "退出登录").click();

    // 确认登出 MessageBox（user-menu.vue 中会弹出确认框）
    cy.contains(".el-message-box", "确定退出登录").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 应该返回登录页
    cy.url().should("include", "/login");

    // localStorage 中的 token 应该被清除
    cy.window().then((win) => {
      const token = win.localStorage.getItem("admin-token");
      expect(token).to.equal(null);
    });
  });
});
