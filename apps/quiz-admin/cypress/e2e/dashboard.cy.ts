/**
 * Quiz Admin E2E 测试 - 仪表盘/欢迎页
 * 测试仪表盘页面的各模块渲染：欢迎卡片、统计卡片、图表区域、在线状态、操作日志
 * /admin/clients API 通过 cy.intercept() mock（避免依赖真实 SSE 连接）
 * /admin/dashboard API 使用真实后端（test DB 有种子数据）
 */

/** Mock 客户端统计响应 */
const MOCK_CLIENTS_RESPONSE = {
  code: 0,
  message: "success",
  data: {
    stats: { total: 5, loggedIn: 3, guest: 2 },
    clients: [
      {
        clientId: "aaa-111",
        ip: "192.168.1.10",
        userId: 1,
        username: "user1",
        currentPage: "/",
        connectedAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
      {
        clientId: "bbb-222",
        ip: "192.168.1.11",
        userId: 2,
        username: "user2",
        currentPage: "/quiz",
        connectedAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
      {
        clientId: "ccc-333",
        ip: "10.0.0.1",
        userId: 3,
        username: "user3",
        currentPage: "/",
        connectedAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
      {
        clientId: "ddd-444",
        ip: "10.0.0.2",
        userId: null,
        username: null,
        currentPage: "/",
        connectedAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
      {
        clientId: "eee-555",
        ip: "10.0.0.3",
        userId: null,
        username: null,
        currentPage: "/login",
        connectedAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString(),
      },
    ],
  },
};

describe("仪表盘", () => {
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

    // Mock 客户端列表 API（避免依赖真实 SSE 连接）
    cy.intercept("GET", "**/api/admin/clients", MOCK_CLIENTS_RESPONSE).as("getClients");

    // 使用超级管理员登录，默认落地在 dashboard 页
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");
  });

  it("页面整体结构应正常加载", () => {
    // 仪表盘根容器
    cy.get('[data-testid="dashboard-page"]').should("exist");

    // 欢迎卡片
    cy.get('[data-testid="welcome-card"]').should("be.visible");

    // 统计卡片行（4 张）
    cy.get('[data-testid="stats-row"]').find(".el-card").should("have.length", 4);

    // 图表卡片
    cy.get('[data-testid="line-chart-card"]').should("exist");
    cy.get('[data-testid="bar-chart-card"]').should("exist");

    // 在线状态 + 正确率
    cy.get('[data-testid="online-card"]').should("exist");
    cy.get('[data-testid="doughnut-chart-card"]').should("exist");

    // 最近操作日志
    cy.get('[data-testid="recent-logs-card"]').should("exist");
  });

  it("欢迎卡片应显示用户昵称和角色", () => {
    cy.get('[data-testid="welcome-card"]').within(() => {
      // 显示用户昵称（种子数据中超级管理员的昵称）
      cy.contains("超级管理员").should("exist");
      // 显示角色
      cy.contains("角色").should("exist");
    });
  });

  it("统计卡片应显示 4 个指标", () => {
    // 验证 4 个统计卡片的标题
    cy.get('[data-testid="stat-card-题目总数"]').should("exist");
    cy.get('[data-testid="stat-card-注册用户"]').should("exist");
    cy.get('[data-testid="stat-card-答题总数"]').should("exist");
    cy.get('[data-testid="stat-card-平均正确率"]').should("exist");
  });

  it("统计卡片应包含数值和今日标签", () => {
    // 每张卡片应有数值和今日标签
    cy.get('[data-testid="stat-card-题目总数"]').within(() => {
      cy.get(".stat-card__value").should("exist");
      cy.contains("今日新增").should("exist");
    });

    cy.get('[data-testid="stat-card-注册用户"]').within(() => {
      cy.get(".stat-card__value").should("exist");
      cy.contains("今日注册").should("exist");
    });

    cy.get('[data-testid="stat-card-答题总数"]').within(() => {
      cy.get(".stat-card__value").should("exist");
      cy.contains("今日答题").should("exist");
    });

    cy.get('[data-testid="stat-card-平均正确率"]').within(() => {
      // 正确率卡片数值带百分号
      cy.get(".stat-card__value").invoke("text").should("include", "%");
      cy.contains("今日正确率").should("exist");
    });
  });

  it("折线图卡片应显示标题并渲染 canvas", () => {
    cy.get('[data-testid="line-chart-card"]').within(() => {
      cy.contains("近 7 天答题趋势").should("exist");
      // Chart.js 渲染到 canvas
      cy.get("canvas").should("exist");
    });
  });

  it("柱状图卡片应显示标题并渲染 canvas", () => {
    cy.get('[data-testid="bar-chart-card"]').within(() => {
      cy.contains("分类题目分布 Top10").should("exist");
      cy.get("canvas").should("exist");
    });
  });

  it("在线状态卡片应显示 mock 数据", () => {
    cy.get('[data-testid="online-card"]').within(() => {
      cy.contains("实时在线").should("exist");

      // 验证 mock 数据的统计值（5 / 3 / 2）
      cy.contains("在线总数").should("exist");
      cy.get(".online-card__num--total").should("contain.text", "5");
      cy.contains("已登录").should("exist");
      cy.get(".online-card__num--logged").should("contain.text", "3");
      cy.contains("游客").should("exist");
      cy.get(".online-card__num--guest").should("contain.text", "2");
    });
  });

  it("正确率环形图应显示标题、canvas 和自定义标注", () => {
    cy.get('[data-testid="doughnut-chart-card"]').within(() => {
      cy.contains("正确率统计").should("exist");
      // Chart.js canvas
      cy.get("canvas").should("exist");
      // 中心百分比文字
      cy.get(".doughnut-card__center").invoke("text").should("include", "%");
      // 自定义标注
      cy.contains("总正确率").should("exist");
      cy.contains("今日正确率").should("exist");
    });
  });

  it("最近操作日志表格应显示列头和数据", () => {
    cy.get('[data-testid="recent-logs-card"]').within(() => {
      cy.contains("最近操作").should("exist");

      // 验证表头
      cy.contains("th", "时间").should("exist");
      cy.contains("th", "操作人").should("exist");
      cy.contains("th", "模块").should("exist");
      cy.contains("th", "操作").should("exist");
      cy.contains("th", "结果").should("exist");

      // 种子数据中有日志，表格应有数据行
      cy.get(".el-table__body-wrapper tbody tr").should("have.length.at.least", 1);
    });
  });

  it("日志表格结果列应显示成功/失败标签", () => {
    cy.get('[data-testid="recent-logs-card"]').within(() => {
      // 至少有一个 el-tag（成功或失败）
      cy.get(".el-tag").should("have.length.at.least", 1);
    });
  });
});
