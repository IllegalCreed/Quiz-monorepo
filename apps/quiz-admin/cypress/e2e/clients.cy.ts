/**
 * Quiz Admin E2E 测试 - 客户端管理
 * 测试页面加载、统计卡片、表格显示、广播面板、刷新按钮
 * 所有 /admin/clients API 调用均通过 cy.intercept() mock，避免依赖真实客户端连接
 */

/** Mock 客户端数据（2 已登录 + 2 游客） */
const MOCK_CLIENTS = [
  {
    clientId: "aaa-111-bbb-222",
    ip: "192.168.1.10",
    userId: 1,
    username: "testuser1",
    currentPage: "/",
    connectedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    clientId: "ccc-333-ddd-444",
    ip: "10.0.0.5",
    userId: 2,
    username: "testuser2",
    currentPage: "/quiz",
    connectedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    clientId: "eee-555-fff-666",
    ip: "172.16.0.33",
    userId: null,
    username: null,
    currentPage: "/",
    connectedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    clientId: "ggg-777-hhh-888",
    ip: "192.168.1.22",
    userId: null,
    username: null,
    currentPage: "/login",
    connectedAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 30_000).toISOString(),
  },
];

/** Mock 客户端列表响应（统一包装格式） */
const MOCK_LIST_RESPONSE = {
  code: 0,
  message: "success",
  data: {
    stats: { total: 4, loggedIn: 2, guest: 2 },
    clients: MOCK_CLIENTS,
  },
};

/** Mock 广播成功响应 */
const MOCK_BROADCAST_RESPONSE = {
  code: 0,
  message: "success",
  data: { sent: 4 },
};

describe("客户端管理", () => {
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

    // 拦截客户端列表 API → 返回 mock 数据
    cy.intercept("GET", "**/api/admin/clients", MOCK_LIST_RESPONSE).as(
      "getClients",
    );

    // 拦截广播 API → 返回 mock 数据
    cy.intercept("POST", "**/api/admin/clients/broadcast", {
      statusCode: 200,
      body: MOCK_BROADCAST_RESPONSE,
    }).as("broadcast");

    // 使用超级管理员登录
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 展开菜单（点击侧边栏折叠按钮）
    cy.get(".header-icon-btn").first().click();

    // 导航到客户端管理页面
    cy.contains(".menu-item", "客户端管理").click();
    cy.url().should("include", "/home/clients");

    // 等待列表数据加载
    cy.wait("@getClients");
  });

  it("页面应正常加载", () => {
    // 验证页面标题
    cy.contains("h1", "客户端管理").should("be.visible");

    // 验证统计卡片存在（3 个）
    cy.get(".stats-row .el-card").should("have.length", 3);

    // 验证广播面板存在
    cy.contains("广播推送").should("be.visible");

    // 验证客户端表格存在
    cy.get(".el-table").should("be.visible");

    // 验证操作栏按钮
    cy.contains("button", "刷新").should("be.visible");
    cy.contains("自动刷新").should("be.visible");
  });

  it("统计卡片应显示 mock 数据", () => {
    // 验证标签
    cy.contains("在线总数").should("be.visible");
    cy.contains("已登录").should("be.visible");
    cy.contains("游客").should("be.visible");

    // 验证数值与 mock 数据一致（4 / 2 / 2）
    cy.get(".stats-card__value").eq(0).should("contain.text", "4");
    cy.get(".stats-card__value").eq(1).should("contain.text", "2");
    cy.get(".stats-card__value").eq(2).should("contain.text", "2");
  });

  it("表格应显示正确的列头", () => {
    cy.contains("th", "用户").should("exist");
    cy.contains("th", "IP 地址").should("exist");
    cy.contains("th", "当前页面").should("exist");
    cy.contains("th", "连接时间").should("exist");
    cy.contains("th", "最后心跳").should("exist");
    cy.contains("th", "Client ID").should("exist");
  });

  it("表格应显示 4 条 mock 客户端数据", () => {
    // 4 行数据
    cy.get(".el-table__body-wrapper tbody tr").should("have.length", 4);

    // 已登录用户显示用户名
    cy.contains("td", "testuser1").should("exist");
    cy.contains("td", "testuser2").should("exist");

    // 游客显示 el-tag "游客"
    cy.get(".el-table__body-wrapper .el-tag").should("have.length", 2);

    // IP 地址
    cy.contains("td", "192.168.1.10").should("exist");
    cy.contains("td", "10.0.0.5").should("exist");

    // 当前页面
    cy.contains("td", "/quiz").should("exist");
    cy.contains("td", "/login").should("exist");
  });

  it("刷新按钮应重新请求数据", () => {
    cy.contains("button", "刷新").click();

    // 验证再次发起了 API 请求
    cy.wait("@getClients");

    // 页面仍正常显示
    cy.contains("h1", "客户端管理").should("be.visible");
    cy.get(".el-table__body-wrapper tbody tr").should("have.length", 4);
  });

  it("自动刷新开关应可切换", () => {
    // 默认开启，点击关闭
    cy.get(".el-switch").click();
    cy.get(".el-switch").should("not.have.class", "is-checked");

    // 再次点击开启
    cy.get(".el-switch").click();
    cy.get(".el-switch").should("have.class", "is-checked");
  });

  describe("广播面板", () => {
    it("公告通知模式：空消息时发送按钮应禁用", () => {
      // 默认是公告通知模式，输入框为空
      cy.get(".broadcast-panel__select").should("contain.text", "公告通知");
      cy.get('input[placeholder="请输入公告内容"]').should("be.visible");

      // 发送按钮应禁用
      cy.get(".broadcast-panel").within(() => {
        cy.contains("button", "发送").should("be.disabled");
      });
    });

    it("公告通知模式：输入消息后可发送", () => {
      // 输入公告内容
      cy.get('input[placeholder="请输入公告内容"]').type("测试公告消息");

      // 发送按钮应启用并点击
      cy.get(".broadcast-panel").within(() => {
        cy.contains("button", "发送").should("not.be.disabled");
        cy.contains("button", "发送").click();
      });

      // 等待广播请求完成
      cy.wait("@broadcast");

      // 应显示成功消息（已推送至 4 个客户端）
      cy.get(".el-message").should("contain.text", "广播发送成功");
      cy.get(".el-message").should("contain.text", "4");

      // 发送后输入框应清空
      cy.get('input[placeholder="请输入公告内容"]').should("have.value", "");
    });

    it("强制刷新模式：不显示消息输入框", () => {
      // 切换到强制刷新模式
      cy.get(".broadcast-panel__select").click();
      cy.contains(".el-select-dropdown__item", "强制刷新").click();

      // 消息输入框应隐藏
      cy.get('input[placeholder="请输入公告内容"]').should("not.exist");

      // 发送按钮应启用（强制刷新不需要输入消息）
      cy.get(".broadcast-panel").within(() => {
        cy.contains("button", "发送").should("not.be.disabled");
      });
    });

    it("强制刷新模式：发送前应弹出确认框，确认后发送", () => {
      // 切换到强制刷新模式
      cy.get(".broadcast-panel__select").click();
      cy.contains(".el-select-dropdown__item", "强制刷新").click();

      // 点击发送
      cy.get(".broadcast-panel").within(() => {
        cy.contains("button", "发送").click();
      });

      // 应弹出确认框
      cy.get(".el-message-box").should("be.visible");
      cy.contains("确定要强制刷新所有在线客户端吗").should("be.visible");

      // 点击确定
      cy.get(".el-message-box").within(() => {
        cy.contains("button", "确定").click();
      });

      // 等待广播请求完成
      cy.wait("@broadcast");

      // 应显示成功消息
      cy.get(".el-message").should("contain.text", "广播发送成功");
    });

    it("强制刷新模式：取消确认框不发送", () => {
      // 切换到强制刷新模式
      cy.get(".broadcast-panel__select").click();
      cy.contains(".el-select-dropdown__item", "强制刷新").click();

      // 点击发送
      cy.get(".broadcast-panel").within(() => {
        cy.contains("button", "发送").click();
      });

      // 应弹出确认框
      cy.get(".el-message-box").should("be.visible");

      // 点击取消
      cy.get(".el-message-box").within(() => {
        cy.contains("button", "取消").click();
      });

      // 确认框应关闭，不应发送请求
      cy.get(".el-message-box").should("not.exist");
    });
  });

  describe("空列表状态", () => {
    it("无客户端时表格应显示空状态", () => {
      // 覆盖 intercept，返回空列表
      cy.intercept("GET", "**/api/admin/clients", {
        statusCode: 200,
        body: {
          code: 0,
          message: "success",
          data: {
            stats: { total: 0, loggedIn: 0, guest: 0 },
            clients: [],
          },
        },
      }).as("getClientsEmpty");

      // 手动刷新触发新请求
      cy.contains("button", "刷新").click();
      cy.wait("@getClientsEmpty");

      // Element Plus 空表格显示 "暂无数据"
      cy.get(".el-table__empty-text").should("be.visible");

      // 统计值应为 0
      cy.get(".stats-card__value").each(($el) => {
        cy.wrap($el).should("contain.text", "0");
      });
    });
  });
});
