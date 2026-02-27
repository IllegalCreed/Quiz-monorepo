/**
 * E2E 测试：答题历史抽屉（Mock API）
 *
 * 测试范围：
 * - 未登录状态（提示登录）
 * - 已登录状态（加载历史数据、筛选、空状态）
 * - 抽屉交互（遮罩关闭）
 *
 * 所有 API 均通过 cy.intercept() mock，无需真实后端。
 */

/** mock 题目 */
const mockQuestion = {
  id: 1,
  stem: "（E2E-History）什么是 REST API？",
  options: [
    { id: 11, text: "一种 API 设计风格" },
    { id: 12, text: "一种编程语言" },
  ],
};

/** mock 用户信息 */
const mockUser = { id: 1, username: "histuser", nickname: "历史测试用户" };

/** mock 历史数据 */
const mockHistory = {
  items: [
    {
      id: 1,
      correct: true,
      createdAt: "2026-02-27T10:00:00Z",
      elapsedMs: 5000,
      question: { id: 100, stem: "什么是闭包？" },
      selectedOption: { id: 101, text: "函数及其词法作用域的组合" },
    },
    {
      id: 2,
      correct: false,
      createdAt: "2026-02-26T09:00:00Z",
      elapsedMs: 3000,
      question: { id: 200, stem: "CSS Flexbox 主轴属性？" },
      selectedOption: { id: 201, text: "align-items" },
    },
    {
      id: 3,
      correct: true,
      createdAt: "2026-02-25T08:00:00Z",
      elapsedMs: 4000,
      question: { id: 300, stem: "HTTP 状态码 404 表示？" },
      selectedOption: { id: 301, text: "未找到" },
    },
  ],
  total: 3,
  page: 1,
  pageSize: 20,
};

/**
 * 模拟已登录状态
 */
function setupLoggedIn() {
  localStorage.setItem("quiz-user-token", "fake-jwt-token-hist");
  cy.intercept("GET", "**/user/auth/info", {
    statusCode: 200,
    body: { code: 0, data: mockUser, message: "ok" },
  }).as("getUserInfo");
}

describe("答题历史抽屉 - Mock API", () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    // mock 题目
    cy.intercept("GET", "**/questions*", {
      statusCode: 200,
      body: { code: 0, data: [mockQuestion], message: "ok" },
    }).as("getQuestions");

    // mock 分类
    cy.intercept("GET", "**/categories/groups", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("getCategories");

    // mock 偏好
    cy.intercept("GET", "**/user/preferences", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("getPreferences");
  });

  // ── 未登录状态 ─────────────────────────────────────────

  describe("未登录状态", () => {
    it("无法通过用户菜单打开历史抽屉（未登录无菜单）", () => {
      cy.visit("/");
      cy.wait("@getQuestions");

      // 未登录时没有用户头像按钮
      cy.get(".user-trigger").should("not.exist");
      // 只有登录按钮
      cy.get(".toolbar__login-btn").should("be.visible");
    });
  });

  // ── 已登录状态 ─────────────────────────────────────────

  describe("已登录状态", () => {
    beforeEach(() => {
      setupLoggedIn();

      // mock 历史 API
      cy.intercept("GET", "**/user/history*", {
        statusCode: 200,
        body: { code: 0, data: mockHistory, message: "ok" },
      }).as("getHistory");

      cy.visit("/");
      cy.wait("@getQuestions");
      cy.get(".user-trigger", { timeout: 5000 }).should("be.visible");
    });

    it("打开抽屉加载历史数据", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();

      // 抽屉应出现
      cy.get(".history-header__title").should("be.visible").and("contain", "做题历史");

      // 等待历史加载
      cy.wait("@getHistory");

      // 验证历史条目
      cy.get(".history-item").should("have.length", 3);
    });

    it("历史列表显示题干和正误徽标", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();
      cy.wait("@getHistory");

      // 验证题干文字
      cy.contains(".history-item__stem", "闭包").should("be.visible");
      cy.contains(".history-item__stem", "Flexbox").should("be.visible");

      // 验证正误徽标
      cy.get(".history-item__badge--correct").should("have.length", 2);
      cy.get(".history-item__badge--wrong").should("have.length", 1);
    });

    it("筛选 Tab：切换「答对」只显示正确记录", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();
      cy.wait("@getHistory");

      // 切换到"答对"
      cy.contains(".history-tabs__item", "答对").click();

      // 应只显示正确记录（2 条）
      cy.get(".history-item").should("have.length", 2);
      cy.get(".history-item__badge--wrong").should("not.exist");
    });

    it("筛选 Tab：切换「答错」只显示错误记录", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();
      cy.wait("@getHistory");

      // 切换到"答错"
      cy.contains(".history-tabs__item", "答错").click();

      // 应只显示错误记录（1 条）
      cy.get(".history-item").should("have.length", 1);
      cy.get(".history-item__badge--correct").should("not.exist");
    });

    it("无记录时显示空状态提示", () => {
      // 覆盖历史 mock 为空
      cy.intercept("GET", "**/user/history*", {
        statusCode: 200,
        body: { code: 0, data: { items: [], total: 0, page: 1, pageSize: 20 }, message: "ok" },
      }).as("getHistoryEmpty");

      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();
      cy.wait("@getHistoryEmpty");

      // 空状态提示
      cy.get(".history-empty").should("be.visible");
      cy.contains("还没有做题记录").should("be.visible");
    });
  });

  // ── 抽屉交互 ─────────────────────────────────────────

  describe("抽屉交互", () => {
    beforeEach(() => {
      setupLoggedIn();
      cy.intercept("GET", "**/user/history*", {
        statusCode: 200,
        body: { code: 0, data: mockHistory, message: "ok" },
      }).as("getHistory");

      cy.visit("/");
      cy.wait("@getQuestions");
      cy.get(".user-trigger", { timeout: 5000 }).should("be.visible");
    });

    it("点击遮罩层关闭抽屉", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "做题历史").click();
      cy.wait("@getHistory");

      // 抽屉应可见
      cy.get(".history-header__title").should("be.visible");

      // 点击遮罩层关闭（overlay 是 dialog 的外层容器，用 force 因为遮罩可能覆盖其他元素）
      cy.get(".dialog-overlay").click("left", { force: true });

      // 抽屉应关闭
      cy.get(".history-header__title").should("not.exist");
    });
  });
});
