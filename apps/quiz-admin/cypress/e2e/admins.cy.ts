/**
 * Quiz Admin E2E 测试 - 管理员管理
 * 测试管理员的列表、创建、修改角色、删除功能
 */

describe("管理员管理", () => {
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

    // 使用超级管理员登录
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 展开菜单（点击侧边栏折叠按钮）
    cy.get(".header-icon-btn").first().click();

    // 导航到管理员管理页面
    cy.contains(".menu-item", "管理员管理").click();
    cy.url().should("include", "/home/admins");
  });

  it("管理员列表应正常加载", () => {
    // 验证页面标题
    cy.contains("h1", "管理员管理").should("be.visible");

    // 验证表格存在
    cy.get(".el-table").should("be.visible");

    // 验证默认的两个管理员存在
    cy.contains("td", "super_admin").should("be.visible");
    cy.contains("td", "admin").should("be.visible");

    // 验证创建按钮存在
    cy.contains("button", "新增管理员").should("be.visible");
  });

  it("应该能够创建新管理员", () => {
    // 点击新增按钮
    cy.contains("button", "新增管理员").click();

    // 验证对话框打开
    cy.get(".el-dialog").should("be.visible");
    cy.contains(".el-dialog__title", "新增管理员").should("be.visible");

    // 填写表单（注意：实际页面没有密码字段，用户名同时作为初始密码）
    cy.get('.el-dialog input[placeholder*="用户名"]').type("test_admin");
    cy.get('.el-dialog input[placeholder="请输入昵称"]').type("测试管理员");

    // 选择角色
    cy.get(".el-dialog .el-select").click();
    cy.contains(".el-select-dropdown__item", "内容管理员").click();

    // 提交表单（注意：按钮文本是"创建"不是"确定"）
    cy.contains(".el-dialog button", "创建").click();

    // 验证成功提示
    cy.contains(".el-message", "创建成功").should("be.visible");

    // 验证对话框关闭（Dialog 保留在 DOM 中，但不可见）
    cy.get(".el-dialog").should("not.be.visible");

    // 等待 table 重新加载完成
    cy.get(".el-table").should("be.visible");
    cy.get(".el-loading-mask").should("not.exist");

    // 验证新管理员出现在列表中
    cy.contains("td", "test_admin").should("be.visible");
    cy.contains("td", "测试管理员").should("be.visible");
    cy.contains("td", "内容管理员").should("be.visible");
  });

  it("重复的用户名应提示错误", () => {
    // 点击新增按钮
    cy.contains("button", "新增管理员").click();

    // 填写已存在的用户名
    cy.get('.el-dialog input[placeholder*="用户名"]').type("super_admin");
    cy.get('.el-dialog input[placeholder="请输入昵称"]').type("重复用户");

    // 选择角色
    cy.get(".el-dialog .el-select").click();
    cy.contains(".el-select-dropdown__item", "内容管理员").click();

    // 提交表单
    cy.contains(".el-dialog button", "创建").click();

    // 应该显示错误提示
    cy.contains(".el-message", "已存在").should("be.visible");

    // 对话框应该仍然打开
    cy.get(".el-dialog").should("be.visible");
  });

  it("应该能够修改管理员角色", () => {
    // 找到普通管理员行（通过昵称精确匹配）并点击"分配角色"按钮
    cy.contains("tr", "普通管理员").within(() => {
      cy.contains("button", "分配角色").click();
    });

    // 验证对话框打开
    cy.get(".el-dialog:visible").should("be.visible");
    cy.contains(".el-dialog__title", "分配角色").should("be.visible");

    // 修改角色 - 使用更精确的选择器
    cy.get(".el-dialog:visible").within(() => {
      cy.get(".el-select").should("be.visible").click();
    });

    // 等待下拉菜单出现并选择
    cy.get(".el-select-dropdown:visible").should("be.visible");
    cy.get(".el-select-dropdown:visible")
      .contains(".el-select-dropdown__item", "内容管理员")
      .click();

    // 等待下拉菜单关闭
    cy.get(".el-select-dropdown:visible").should("not.exist");

    // 等待并点击保存按钮
    cy.get(".el-dialog:visible").within(() => {
      cy.contains("button", "保存").should("be.enabled").click();
    });

    // 验证成功提示
    cy.contains(".el-message", "角色更新成功").should("be.visible");

    // 等待 Dialog 关闭和 table 加载完成
    cy.get(".el-dialog:visible").should("not.exist");
    cy.get(".el-loading-mask").should("not.exist");

    // 验证角色已更新（通过昵称找到行）
    cy.contains("tr", "普通管理员").within(() => {
      cy.contains("td", "内容管理员").should("be.visible");
    });
  });

  it("超级管理员账号的角色不可修改", () => {
    // 找到超级管理员行
    cy.contains("tr", "super_admin").within(() => {
      // "分配角色"按钮应该被禁用（Element Plus 使用 is-disabled 类）
      cy.contains("button", "分配角色").should("have.class", "is-disabled");
    });
  });

  it("应该能够删除普通管理员", () => {
    // 先创建一个管理员用于删除
    cy.contains("button", "新增管理员").click();
    cy.get('.el-dialog input[placeholder*="用户名"]').type("to_delete");
    cy.get('.el-dialog input[placeholder="请输入昵称"]').type("待删除");
    cy.get(".el-dialog .el-select").click();
    cy.contains(".el-select-dropdown__item", "内容管理员").click();
    cy.contains(".el-dialog button", "创建").click();
    cy.contains(".el-message", "创建成功").should("be.visible");

    // 等待 Dialog 关闭和 table 加载完成
    cy.get(".el-dialog").should("not.be.visible");
    cy.get(".el-loading-mask").should("not.exist");

    // 找到新创建的管理员并删除
    cy.contains("tr", "to_delete").within(() => {
      cy.contains("button", "删除").click();
    });

    // 确认删除（MessageBox 文本匹配）
    cy.contains(".el-message-box", "确定要删除").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证成功提示
    cy.contains(".el-message", "删除成功").should("be.visible");

    // 验证管理员已从列表中移除
    cy.contains("td", "to_delete").should("not.exist");
  });

  it("超级管理员账号不可删除", () => {
    // 找到超级管理员行
    cy.contains("tr", "super_admin").within(() => {
      // 删除按钮应该被禁用（Element Plus 使用 is-disabled 类）
      cy.contains("button", "删除").should("have.class", "is-disabled");
    });
  });

  it("普通管理员无权访问管理员管理页面", () => {
    // 登出
    cy.get(".user-dropdown").click();
    cy.contains(".dropdown-item", "退出登录").click();

    // 确认登出 MessageBox
    cy.contains(".el-message-box", "确定退出登录").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 等待跳转到登录页
    cy.url().should("include", "/login");

    // 使用普通管理员登录
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 尝试直接访问管理员管理页面
    cy.visit("/home/admins");

    // 应该被重定向到首页（路由守卫会将无权限路由重定向到 dashboard）
    cy.url().should("include", "/home/dashboard");
    cy.url().should("not.include", "/home/admins");
  });
});
