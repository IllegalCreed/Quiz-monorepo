/**
 * E2E 测试：认证流程（Mock API）
 *
 * 测试范围：
 * - 登录对话框（打开、表单校验、成功登录）
 * - 注册流程（Tab 切换、成功注册、注册失败）
 * - 用户菜单 + 退出登录
 *
 * 所有 API 均通过 cy.intercept() mock，无需真实后端。
 */

/** mock 题目数据（答题页依赖） */
const mockQuestion = {
  id: 1,
  stem: "（E2E-Auth）什么是 TypeScript？",
  options: [
    { id: 11, text: "JavaScript 的超集", description: "TypeScript 在 JS 基础上添加了类型系统。" },
    { id: 12, text: "一种数据库", description: "TypeScript 是编程语言，不是数据库。" },
  ],
  explanation: "TypeScript 是 JavaScript 的超集",
};

/** mock 用户信息 */
const mockUser = { id: 1, username: "e2euser", nickname: "E2E测试用户" };

/** mock 登录响应 */
const mockLoginResponse = { token: "fake-jwt-token-for-e2e", user: mockUser };

/**
 * 模拟已登录状态的公共拦截器
 *
 * 注意：quiz-app 的 request.ts 自动解包 { code, data, message } 格式，
 * 但 cy.intercept 拦截的是原始 HTTP 响应，需包装为 { code:0, data:..., message:"ok" }
 */
function mockLoggedInState() {
  // 设置 localStorage token（useUserStore 通过 VueUse useLocalStorage 读取）
  localStorage.setItem("quiz-user-token", "fake-jwt-token-for-e2e");

  // mock 恢复登录状态时的 GET /user/auth/info
  cy.intercept("GET", "**/user/auth/info", {
    statusCode: 200,
    body: { code: 0, data: mockUser, message: "ok" },
  }).as("getUserInfo");

  // mock 加载偏好
  cy.intercept("GET", "**/user/preferences", {
    statusCode: 200,
    body: { code: 0, data: [], message: "ok" },
  }).as("getPreferences");
}

describe("认证流程 - Mock API", () => {
  beforeEach(() => {
    // 清除登录状态
    cy.clearLocalStorage();

    // mock 题目 API
    cy.intercept("GET", "**/questions*", {
      statusCode: 200,
      body: { code: 0, data: [mockQuestion], message: "ok" },
    }).as("getQuestions");

    // mock 分类 API（返回空分类树）
    cy.intercept("GET", "**/categories/groups", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("getCategories");

    // mock 偏好 API（默认未登录时不会调用，但以防万一）
    cy.intercept("GET", "**/user/preferences", {
      statusCode: 200,
      body: { code: 0, data: [], message: "ok" },
    }).as("getPreferences");
  });

  // ── 登录对话框 ───────────────────────────────────────────

  describe("登录对话框", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.wait("@getQuestions");
    });

    it("未登录时工具栏显示「登录」按钮", () => {
      cy.get(".toolbar__login-btn").should("be.visible").and("contain", "登录");
      // 不应显示用户头像
      cy.get(".user-trigger").should("not.exist");
    });

    it("点击「登录」按钮打开登录对话框", () => {
      cy.get(".toolbar__login-btn").click();
      // 对话框应出现
      cy.get(".dialog").should("be.visible");
      // 默认选中"登录" Tab
      cy.get(".auth-tabs__item--active").should("contain", "登录");
    });

    it("对话框有「登录」和「注册」两个 Tab", () => {
      cy.get(".toolbar__login-btn").click();
      cy.get(".auth-tabs__item").should("have.length", 2);
      cy.get(".auth-tabs__item").eq(0).should("contain", "登录");
      cy.get(".auth-tabs__item").eq(1).should("contain", "注册");
    });

    it("表单校验：用户名为空时显示错误", () => {
      cy.get(".toolbar__login-btn").click();
      // 不填用户名，只填密码
      cy.get(".input__field").eq(1).type("123456");
      // 点击提交按钮
      cy.get(".auth-form__submit").click();
      // 应显示用户名错误
      cy.get(".input__error").should("be.visible").and("contain", "用户名");
    });

    it("表单校验：密码少于6位时显示错误", () => {
      cy.get(".toolbar__login-btn").click();
      // 填写用户名
      cy.get(".input__field").eq(0).type("testuser");
      // 填写不足6位的密码
      cy.get(".input__field").eq(1).type("123");
      // 点击提交
      cy.get(".auth-form__submit").click();
      // 应显示密码错误
      cy.get(".input__error").should("be.visible").and("contain", "6");
    });

    it("登录成功后对话框关闭，工具栏显示用户头像", () => {
      // mock 登录 API
      cy.intercept("POST", "**/user/auth/login", {
        statusCode: 200,
        body: { code: 0, data: mockLoginResponse, message: "ok" },
      }).as("loginRequest");

      // mock 登录后加载偏好
      cy.intercept("GET", "**/user/preferences", {
        statusCode: 200,
        body: { code: 0, data: [], message: "ok" },
      }).as("loadPrefs");

      cy.get(".toolbar__login-btn").click();
      cy.get(".input__field").eq(0).type("e2euser");
      cy.get(".input__field").eq(1).type("password123");
      cy.get(".auth-form__submit").click();

      cy.wait("@loginRequest");

      // 对话框应关闭
      cy.get(".dialog").should("not.exist");
      // 工具栏应显示用户头像按钮
      cy.get(".user-trigger").should("be.visible");
      // "登录"按钮应消失
      cy.get(".toolbar__login-btn").should("not.exist");
    });
  });

  // ── 注册流程 ───────────────────────────────────────────

  describe("注册流程", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.wait("@getQuestions");
      cy.get(".toolbar__login-btn").click();
    });

    it("切换到「注册」Tab 后显示昵称和邮箱字段", () => {
      // 初始登录模式只有 2 个输入框（用户名 + 密码）
      cy.get(".input__field").should("have.length", 2);

      // 切换到注册
      cy.get(".auth-tabs__item").eq(1).click();
      cy.get(".auth-tabs__item--active").should("contain", "注册");

      // 注册模式应有 4 个输入框（用户名 + 密码 + 昵称 + 邮箱）
      cy.get(".input__field").should("have.length", 4);
    });

    it("注册成功后对话框关闭，工具栏显示用户头像", () => {
      // mock 注册 API
      cy.intercept("POST", "**/user/auth/register", {
        statusCode: 201,
        body: { code: 0, data: mockLoginResponse, message: "ok" },
      }).as("registerRequest");

      // 切换到注册 Tab
      cy.get(".auth-tabs__item").eq(1).click();

      // 填写注册表单
      cy.get(".input__field").eq(0).type("newuser123");
      cy.get(".input__field").eq(1).type("password123");

      // 提交
      cy.get(".auth-form__submit").click();
      cy.wait("@registerRequest");

      // 对话框应关闭
      cy.get(".dialog").should("not.exist");
      // 用户头像出现
      cy.get(".user-trigger").should("be.visible");
    });

    it("注册失败（用户名已存在）显示错误信息", () => {
      // mock 注册失败
      cy.intercept("POST", "**/user/auth/register", {
        statusCode: 409,
        body: { statusCode: 409, message: "用户名已存在" },
      }).as("registerFail");

      // 切换到注册
      cy.get(".auth-tabs__item").eq(1).click();
      cy.get(".input__field").eq(0).type("existinguser");
      cy.get(".input__field").eq(1).type("password123");
      cy.get(".auth-form__submit").click();

      cy.wait("@registerFail");

      // 应显示错误信息
      cy.get(".auth-form__error").should("be.visible").and("contain", "已存在");
      // 对话框应保持打开
      cy.get(".dialog").should("be.visible");
    });
  });

  // ── 用户菜单 + 退出登录 ─────────────────────────────────

  describe("用户菜单 + 退出登录", () => {
    beforeEach(() => {
      // 模拟已登录
      mockLoggedInState();
      cy.visit("/");
      cy.wait("@getQuestions");
      // 等待恢复登录后用户头像出现
      cy.get(".user-trigger", { timeout: 5000 }).should("be.visible");
    });

    it("登录后点击头像显示下拉菜单", () => {
      cy.get(".user-trigger").click();
      // 下拉菜单可见
      cy.get(".user-menu").should("be.visible");
      // 验证菜单项
      cy.contains(".user-menu__item", "做题历史").should("be.visible");
      cy.contains(".user-menu__item", "分类偏好").should("be.visible");
      cy.contains(".user-menu__item--danger", "退出登录").should("be.visible");
    });

    it("点击「退出登录」后工具栏恢复显示「登录」按钮", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item--danger", "退出登录").click();

      // 用户头像应消失
      cy.get(".user-trigger").should("not.exist");
      // "登录"按钮应出现
      cy.get(".toolbar__login-btn").should("be.visible");
    });

    it("退出登录后 localStorage token 被清除", () => {
      cy.get(".user-trigger").click();
      cy.contains(".user-menu__item--danger", "退出登录").click();

      // token 应被清除
      cy.window().then((win) => {
        expect(win.localStorage.getItem("quiz-user-token")).to.be.oneOf([null, ""]);
      });
    });
  });
});
