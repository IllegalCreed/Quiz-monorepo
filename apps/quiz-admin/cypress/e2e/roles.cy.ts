/**
 * Quiz Admin E2E 测试 - 角色管理
 * 测试角色的列表、创建、更新、删除功能
 */

describe("角色管理", () => {
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

    // 导航到角色管理页面
    cy.contains(".menu-item", "角色管理").click();
    cy.url().should("include", "/home/roles");
  });

  it("角色列表应正常加载", () => {
    // 验证页面标题
    cy.contains("h1", "角色管理").should("be.visible");

    // 验证表格存在
    cy.get(".el-table").should("be.visible");

    // 验证默认的三个角色存在
    cy.contains("td", "超级管理员").should("be.visible");
    cy.contains("td", "内容管理员").should("be.visible");
    cy.contains("td", "用户管理员").should("be.visible");

    // 验证创建按钮存在
    cy.contains("button", "新增角色").should("be.visible");
  });

  it("应该能够创建新角色", () => {
    // 点击新增按钮
    cy.contains("button", "新增角色").click();

    // 验证对话框打开
    cy.get(".el-dialog").should("be.visible");
    cy.contains(".el-dialog__title", "新增角色").should("be.visible");

    // 填写表单（注意：新增对话框中没有权限选择，权限配置在独立的对话框中）
    cy.get('.el-dialog input[placeholder="请输入角色名称"]').type("测试角色");
    cy.get('.el-dialog textarea[placeholder="请输入角色描述"]').type("这是一个测试角色");

    // 提交表单（按钮文本是"创建"）
    cy.contains(".el-dialog button", "创建").click();

    // 验证成功提示
    cy.contains(".el-message", "创建成功").should("be.visible");

    // 验证新角色出现在列表中
    cy.contains("td", "测试角色").should("be.visible");
    cy.contains("td", "这是一个测试角色").should("be.visible");
  });

  it("应该能够更新角色信息", () => {
    // 找到内容管理员角色并点击编辑
    cy.contains("tr", "内容管理员").within(() => {
      cy.contains("button", "编辑").click();
    });

    // 验证对话框打开
    cy.get(".el-dialog").should("be.visible");
    cy.contains(".el-dialog__title", "编辑角色").should("be.visible");

    // 修改描述
    cy.get('.el-dialog textarea[placeholder="请输入角色描述"]').clear();
    cy.get('.el-dialog textarea[placeholder="请输入角色描述"]').type("负责题目和标签的管理工作");

    // 提交（按钮文本是"保存"）
    cy.contains(".el-dialog button", "保存").click();

    // 验证成功提示
    cy.contains(".el-message", "更新成功").should("be.visible");

    // 验证描述已更新
    cy.contains("tr", "内容管理员").within(() => {
      cy.contains("td", "负责题目和标签的管理工作").should("be.visible");
    });
  });

  it("超级管理员角色不可修改", () => {
    // 找到超级管理员行
    cy.contains("tr", "超级管理员").within(() => {
      // 编辑按钮应该被禁用（Element Plus 使用 is-disabled 类）
      cy.contains("button", "编辑").should("have.class", "is-disabled");
    });
  });

  it("系统内置角色不可修改", () => {
    // 所有默认角色的 isSystem 标记为 true，应该都不可编辑
    cy.contains("tr", "超级管理员").within(() => {
      cy.contains("button", "编辑").should("have.class", "is-disabled");
    });
  });

  it("应该能够删除未使用的角色", () => {
    // 先创建一个新角色
    cy.contains("button", "新增角色").click();
    cy.get('.el-dialog input[placeholder="请输入角色名称"]').type("待删除角色");
    cy.get('.el-dialog textarea[placeholder="请输入角色描述"]').type("这个角色将被删除");
    cy.contains(".el-dialog button", "创建").click();
    cy.contains(".el-message", "创建成功").should("be.visible");

    // 删除新创建的角色
    cy.contains("tr", "待删除角色").within(() => {
      cy.contains("button", "删除").click();
    });

    // 确认删除（MessageBox 文本匹配）
    cy.contains(".el-message-box", "确定要删除").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证成功提示
    cy.contains(".el-message", "删除成功").should("be.visible");

    // 验证角色已从列表中移除
    cy.contains("td", "待删除角色").should("not.exist");
  });

  it("超级管理员角色不可删除", () => {
    // 找到超级管理员行
    cy.contains("tr", "超级管理员").within(() => {
      // 删除按钮应该被禁用（Element Plus 使用 is-disabled 类）
      cy.contains("button", "删除").should("have.class", "is-disabled");
    });
  });

  it("系统内置角色不可删除", () => {
    // 只有超级管理员角色是系统角色（isSystem=true）
    cy.contains("tr", "超级管理员").within(() => {
      cy.contains("button", "删除").should("have.class", "is-disabled");
    });
  });

  it("正在使用的角色不可删除", () => {
    // 先创建一个新角色
    cy.contains("button", "新增角色").click();
    cy.get('.el-dialog input[placeholder="请输入角色名称"]').type("使用中角色");
    cy.get('.el-dialog textarea[placeholder="请输入角色描述"]').type("这个角色正在被使用");
    cy.contains(".el-dialog button", "创建").click();
    cy.contains(".el-message", "创建成功").should("be.visible");

    // 创建一个使用该角色的管理员
    // 展开菜单
    cy.get(".header-icon-btn").first().click();
    cy.contains(".menu-item", "管理员管理").click();
    cy.contains("button", "新增管理员").click();
    cy.get('.el-dialog input[placeholder*="用户名"]').type("role_user");
    cy.get('.el-dialog input[placeholder="请输入昵称"]').type("使用角色的用户");
    cy.get(".el-dialog .el-select").click();
    cy.contains(".el-select-dropdown__item", "使用中角色").click();
    cy.contains(".el-dialog button", "创建").click();

    // 返回角色管理页面
    // 展开菜单
    cy.get(".header-icon-btn").first().click();
    cy.contains(".menu-item", "角色管理").click();

    // 尝试删除正在使用的角色
    cy.contains("tr", "使用中角色").within(() => {
      cy.contains("button", "删除").click();
    });

    // 应该显示错误提示（MessageBox 文本匹配）
    cy.contains(".el-message-box", "确定要删除").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证错误提示（使用自定义 class 定位）
    cy.get(".role-delete-error").should("be.visible");
    cy.contains(".role-delete-error", "正被").should("be.visible");
    cy.contains(".role-delete-error", "无法删除").should("be.visible");
  });

  it("应该能够查看角色详情", () => {
    // 点击超级管理员的查看权限按钮（只有系统角色才有"查看权限"按钮）
    cy.contains("tr", "超级管理员").within(() => {
      cy.contains("button", "查看权限").click();
    });

    // 验证权限对话框打开（检查存在即可，对话框较大可能超出视口）
    cy.get(".permission-dialog").should("exist");
    cy.contains(".permission-dialog .el-dialog__title", "查看权限").should("exist");

    // 验证显示角色信息
    cy.get(".permission-dialog").within(() => {
      cy.contains("超级管理员").should("be.visible");

      // 验证显示权限列表
      cy.contains("菜单权限").should("be.visible");
      cy.contains("API 权限").should("be.visible");
    });
  });
});
