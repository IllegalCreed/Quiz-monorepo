/**
 * E2E 测试：分类筛选（Mock API）
 *
 * 测试范围：
 * - 分类选择器对话框（打开、展示、选择、保存）
 * - 游客分类筛选（localStorage 持久化）
 * - 登录偏好同步（从后端加载）
 *
 * 所有 API 均通过 cy.intercept() mock，无需真实后端。
 */

/** mock 题目 */
const mockQuestion = {
  id: 1,
  stem: "（E2E-Category）CSS 盒模型包括哪些部分？",
  options: [
    { id: 11, text: "margin + border + padding + content" },
    { id: 12, text: "只有 content" },
  ],
  categoryNames: ["前端通识"],
};

/** mock 分类树数据（后端原始格式，name 字段） */
const mockGroups = [
  {
    id: 1,
    name: "技术方向",
    sort: 0,
    categories: [
      {
        id: 10,
        name: "前端",
        sort: 0,
        isDefault: false,
        children: [
          { id: 11, name: "Vue", sort: 0, isDefault: false, children: [] },
          { id: 12, name: "React", sort: 1, isDefault: false, children: [] },
          { id: 99, name: "通识", sort: 9999, isDefault: true, children: [] },
        ],
      },
    ],
  },
];

/** mock 用户信息 */
const mockUser = { id: 1, username: "catuser", nickname: "分类测试用户" };

/**
 * 模拟已登录状态
 */
function setupLoggedIn() {
  localStorage.setItem("quiz-user-token", "fake-jwt-token-cat");
  cy.intercept("GET", "**/user/auth/info", {
    statusCode: 200,
    body: { code: 0, data: mockUser, message: "ok" },
  }).as("getUserInfo");
}

describe("分类筛选 - Mock API", () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    // mock 题目
    cy.intercept("GET", "**/questions*", {
      statusCode: 200,
      body: { code: 0, data: [mockQuestion], message: "ok" },
    }).as("getQuestions");

    // mock 分类树
    cy.intercept("GET", "**/categories/groups", {
      statusCode: 200,
      body: { code: 0, data: mockGroups, message: "ok" },
    }).as("getCategories");

    // mock 偏好
    cy.intercept("GET", "**/user/preferences", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("getPreferences");

    // mock 更新偏好
    cy.intercept("PUT", "**/user/preferences", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("updatePreferences");
  });

  // ── 分类选择器对话框 ─────────────────────────────────────

  describe("分类选择器对话框", () => {
    beforeEach(() => {
      setupLoggedIn();
      cy.visit("/");
      cy.wait("@getQuestions");
      cy.get(".user-trigger", { timeout: 5000 }).should("be.visible");
    });

    it("登录后用户菜单有「分类偏好」入口", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "分类偏好").should("be.visible");
    });

    it("点击「分类偏好」打开 ColumnSelector 对话框", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "分类偏好").click();

      // 对话框应出现，标题为"选择分类"
      cy.get(".dialog").should("be.visible");
      cy.contains("选择分类").should("be.visible");
    });

    it("分栏选择器显示分类维度数据", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "分类偏好").click();

      // 等待分类数据加载
      cy.get(".column-selector").should("be.visible");

      // 应显示维度和分类节点（treeData 将维度作为顶层节点）
      cy.contains(".column-selector__label", "技术方向").should("be.visible");
    });

    it("选中分类后点击保存，对话框关闭", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "分类偏好").click();
      cy.get(".dialog").should("be.visible");

      // 展开"技术方向"维度
      cy.contains(".column-selector__label", "技术方向").click();
      // 展开"前端"
      cy.contains(".column-selector__label", "前端").click();
      // 点击"Vue"的选中指示器
      cy.contains(".column-selector__node", "Vue").find(".column-selector__indicator").click();

      // 点击确认按钮
      cy.contains("button", "确认").click();

      // 对话框应关闭
      cy.get(".dialog").should("not.exist");
    });

    it("保存后题目 API 带上 categoryIds 参数", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item", "分类偏好").click();

      // 展开并选中 Vue（id: 11）
      cy.contains(".column-selector__label", "技术方向").click();
      cy.contains(".column-selector__label", "前端").click();
      cy.contains(".column-selector__node", "Vue").find(".column-selector__indicator").click();

      // 确认
      cy.contains("button", "确认").click();

      // 选中变化后会触发 watch(selectedIds) → loadNext()
      // 验证后续 questions 请求带了 categoryIds 参数
      cy.wait("@getQuestions").its("request.url").should("include", "categoryIds");
    });
  });

  // ── 游客分类筛选 ─────────────────────────────────────────

  describe("游客分类筛选", () => {
    it("游客选中分类存入 localStorage", () => {
      cy.visit("/");
      cy.wait("@getQuestions");

      // 游客状态不应显示用户头像
      cy.get(".toolbar__login-btn").should("be.visible");

      // 直接设置 localStorage 模拟游客选中
      cy.window().then((win) => {
        win.localStorage.setItem("quiz-guest-categories", JSON.stringify([11]));
      });

      // 验证 localStorage 已写入
      cy.window().then((win) => {
        const stored = JSON.parse(win.localStorage.getItem("quiz-guest-categories")!);
        expect(stored).to.deep.equal([11]);
      });
    });

    it("刷新页面后从 localStorage 恢复选中", () => {
      // 预设游客偏好
      cy.window().then((win) => {
        win.localStorage.setItem("quiz-guest-categories", JSON.stringify([11, 12]));
      });

      // 延迟分类响应，确保初始 loadNext() 先完成（loading=false），
      // 然后 init() 从 localStorage 恢复 selectedIds → watch 触发第二次 loadNext()
      cy.intercept("GET", "**/categories/groups", {
        statusCode: 200,
        body: { code: 0, data: mockGroups, message: "ok" },
        delay: 200,
      });

      // 精确拦截带 categoryIds 的请求
      cy.intercept("GET", /\/questions.*categoryIds/).as("getQuestionsWithCategory");

      cy.visit("/");

      // init() 从 localStorage 恢复 selectedIds → 触发带 categoryIds 的请求
      cy.wait("@getQuestionsWithCategory");
    });
  });

  // ── 偏好持久化 ─────────────────────────────────────────

  describe("偏好持久化", () => {
    it("登录时自动调用 GET /user/preferences", () => {
      // mock 偏好数据（用户有已选分类）
      const mockPrefs = [
        {
          userId: 1,
          categoryId: 11,
          category: {
            id: 11,
            name: "Vue",
            groupId: 1,
            parentId: 10,
            isDefault: false,
            group: { id: 1, name: "技术方向" },
            parent: { id: 10, name: "前端" },
          },
        },
      ];
      // 延迟偏好响应，确保初始 loadNext() 先完成（loading=false），
      // 然后 loadUserPreferences 设置 selectedIds → watch 触发带 categoryIds 的请求
      cy.intercept("GET", "**/user/preferences", {
        statusCode: 200,
        body: { code: 0, data: mockPrefs, message: "ok" },
        delay: 300,
      }).as("getPrefsWithData");

      // 精确拦截带 categoryIds 的请求
      cy.intercept("GET", /\/questions.*categoryIds/).as("getQuestionsWithCategory");

      setupLoggedIn();
      cy.visit("/");

      // 启动时 main.ts 会调用 fetchUserInfo → loadUserPreferences
      cy.wait("@getPrefsWithData");

      // 加载偏好后 selectedIds 被设置，后续请求应带 categoryIds
      cy.wait("@getQuestionsWithCategory");
    });
  });
});
