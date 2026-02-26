/**
 * Quiz Admin E2E 测试 - 用户管理
 * 测试 App 用户的列表、搜索、状态切换、查看详情、删除功能
 */

describe("用户管理", () => {
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

    // 导航到用户管理页面
    cy.contains(".menu-item", "用户管理").click();
    cy.url().should("include", "/home/users");
  });

  it("用户列表应正常加载", () => {
    // 验证页面标题
    cy.contains("h1", "用户管理").should("be.visible");

    // 验证表格存在
    cy.get(".el-table").should("be.visible");

    // 验证种子用户存在（3 个测试用户）
    cy.contains("td", "testuser1").should("be.visible");
    cy.contains("td", "testuser2").should("be.visible");
    cy.contains("td", "disableduser").should("be.visible");

    // 验证操作按钮可见（超级管理员有 *:* 权限）
    cy.contains("button", "查看").should("be.visible");
    cy.contains("button", "禁用").should("be.visible");
    cy.contains("button", "删除").should("be.visible");
  });

  it("搜索功能应正常工作", () => {
    // 输入关键词搜索
    cy.get('input[placeholder="搜索用户名/昵称"]').type("testuser1");
    cy.contains("button", "搜索").click();

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 应该只显示匹配的用户
    cy.contains("td", "testuser1").should("be.visible");
    cy.contains("td", "disableduser").should("not.exist");

    // 重置搜索
    cy.contains("button", "重置").click();
    cy.get(".el-loading-mask").should("not.exist");

    // 应恢复显示所有用户
    cy.contains("td", "testuser1").should("be.visible");
    cy.contains("td", "disableduser").should("be.visible");
  });

  it("状态筛选应正常工作", () => {
    // 选择"禁用"状态筛选
    cy.get(".search-bar__select").click();
    cy.contains(".el-select-dropdown__item", "禁用").click();
    cy.contains("button", "搜索").click();

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 只显示禁用用户
    cy.contains("td", "disableduser").should("be.visible");
    cy.contains("td", "testuser1").should("not.exist");
  });

  it("应该能够禁用用户", () => {
    // 找到 testuser1 行并点击"禁用"
    cy.contains("tr", "testuser1").within(() => {
      cy.contains("button", "禁用").click();
    });

    // 确认操作
    cy.contains(".el-message-box", "确定要禁用").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证成功提示
    cy.contains(".el-message", "禁用成功").should("be.visible");

    // 等待表格重新加载
    cy.get(".el-loading-mask").should("not.exist");

    // 验证状态已更新 - 该行应显示"启用"按钮
    cy.contains("tr", "testuser1").within(() => {
      cy.contains("button", "启用").should("be.visible");
    });
  });

  it("应该能够启用已禁用的用户", () => {
    // 找到 disableduser 行并点击"启用"
    cy.contains("tr", "disableduser").within(() => {
      cy.contains("button", "启用").click();
    });

    // 确认操作
    cy.contains(".el-message-box", "确定要启用").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证成功提示
    cy.contains(".el-message", "启用成功").should("be.visible");

    // 等待表格重新加载
    cy.get(".el-loading-mask").should("not.exist");

    // 验证状态已更新
    cy.contains("tr", "disableduser").within(() => {
      cy.contains("button", "禁用").should("be.visible");
    });
  });

  it("应该能够删除用户", () => {
    // 找到 disableduser 并删除
    cy.contains("tr", "disableduser").within(() => {
      cy.contains("button", "删除").click();
    });

    // 确认删除
    cy.contains(".el-message-box", "确定要删除").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 验证成功提示
    cy.contains(".el-message", "删除成功").should("be.visible");

    // 验证用户已从列表移除
    cy.get(".el-loading-mask").should("not.exist");
    cy.contains("td", "disableduser").should("not.exist");
  });

  it("点击查看应跳转到用户详情页", () => {
    // 点击第一行的"查看"按钮
    cy.contains("tr", "testuser1").within(() => {
      cy.contains("button", "查看").click();
    });

    // 验证跳转到详情页
    cy.url().should("match", /\/home\/users\/\d+/);

    // 验证面包屑
    cy.contains(".el-breadcrumb", "用户管理").should("be.visible");
    cy.contains(".el-breadcrumb", "用户详情").should("be.visible");

    // 验证用户基本信息
    cy.contains("testuser1").should("be.visible");

    // 验证 Tab 存在
    cy.contains(".el-tabs__item", "做题历史").should("be.visible");
    cy.contains(".el-tabs__item", "偏好分类").should("be.visible");
  });
});

/**
 * 用户详情页测试
 * 测试做题历史、偏好分类展示（依赖种子数据中 testuser1 的 7 条做题记录和 3 个偏好分类）
 */
describe("用户详情页", () => {
  const BACKEND_URL = Cypress.env("apiBaseUrl") || "http://localhost:10020";
  const RESET_SECRET = Cypress.env("TEST_RESET_SECRET");

  beforeEach(() => {
    // 重置测试数据库
    cy.request({
      method: "POST",
      url: `${BACKEND_URL}/api/test/reset`,
      headers: { "x-reset-secret": RESET_SECRET },
    });

    cy.clearLocalStorage();

    // 登录
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 展开菜单 → 用户管理 → 点击 testuser1 的"查看"
    cy.get(".header-icon-btn").first().click();
    cy.contains(".menu-item", "用户管理").click();
    cy.url().should("include", "/home/users");
    cy.get(".el-loading-mask").should("not.exist");
    cy.contains("tr", "testuser1").within(() => {
      cy.contains("button", "查看").click();
    });
    cy.url().should("match", /\/home\/users\/\d+/);
  });

  it("应展示用户基本信息", () => {
    // 验证基本信息卡片
    cy.contains("基本信息").should("exist");
    cy.contains("testuser1").should("exist");
    cy.contains("测试用户一").should("exist");
    cy.contains("user1@example.com").should("exist");
    cy.contains("正常").should("exist");

    // 做题次数应为 7（种子数据）
    cy.contains("做题次数").parent().should("contain.text", "7");
  });

  it("做题历史应展示种子数据记录", () => {
    // 默认 Tab 应为"做题历史"
    cy.get(".el-tabs__item.is-active").should("contain.text", "做题历史");

    // 等待表格加载
    cy.get(".el-loading-mask").should("not.exist");

    // 应有 7 条记录（种子数据为 testuser1 创建了 7 条）
    cy.get(".el-table__body-wrapper tbody tr").should("have.length", 7);

    // 验证表格列头
    cy.contains("th", "题目").should("exist");
    cy.contains("th", "结果").should("exist");
    cy.contains("th", "耗时").should("exist");
    cy.contains("th", "答题时间").should("exist");

    // 应有正确和错误的记录
    cy.get(".el-table__body-wrapper").within(() => {
      cy.contains(".el-tag", "正确").should("exist");
      cy.contains(".el-tag", "错误").should("exist");
    });

    // 分页信息应显示"共 7 条"
    cy.contains("共 7 条").should("exist");
  });

  it("做题历史应展示题目题干", () => {
    cy.get(".el-loading-mask").should("not.exist");

    // 验证至少有一个以 (TEST) 开头的题干（来自种子数据）
    cy.get(".el-table__body-wrapper").should("contain.text", "(TEST)");
  });

  it("偏好分类应按维度分组展示", () => {
    // 切换到"偏好分类" Tab
    cy.contains(".el-tabs__item", "偏好分类").click();

    // 等待内容加载
    cy.get(".el-loading-mask").should("not.exist");

    // testuser1 的偏好：技术方向（JS/TS、框架与库）+ 难度（中级）
    cy.contains("技术方向").should("exist");
    cy.contains("难度").should("exist");

    // 验证分类标签存在
    cy.get(".user-detail__pref-tag").should("have.length.at.least", 3);
  });

  it("面包屑可返回用户列表", () => {
    // 点击面包屑中的"用户管理"
    cy.contains(".el-breadcrumb__item", "用户管理").find("a,.el-breadcrumb__inner").first().click();

    // 应回到用户列表
    cy.url().should("include", "/home/users");
    cy.url().should("not.match", /\/home\/users\/\d+/);
  });
});
