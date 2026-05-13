/**
 * E2E 测试：Mock API 答题流程
 *
 * 测试范围：
 * - 题目加载和展示
 * - 答对流程（绿色高亮 + 不显示解析 + 自动跳转）
 * - 答错流程（红色高亮 + 显示解析 + 手动跳转）
 * - 答题后选项禁用状态
 * - 下一题导航
 */

describe("Quiz Flow - Mock API", () => {
  const question1 = {
    id: 1,
    stem: "（E2E）下面哪个是 HTTP 状态码 200 的含义？",
    options: [
      { id: 11, text: "未找到", description: "「未找到」对应 404 状态码，不是 200。" },
      { id: 12, text: "成功", description: "200 表示请求成功，服务器正常返回了数据。" },
    ],
    explanation: "200 表示请求成功",
  };

  const question2 = {
    id: 2,
    stem: "（E2E）下面哪个是 CSS Flexbox 的主轴对齐属性？",
    options: [
      { id: 21, text: "align-items", description: "这是交叉轴对齐属性" },
      { id: 22, text: "justify-content", description: "这是主轴对齐属性" },
    ],
    explanation: "justify-content 用于主轴对齐",
  };

  /**
   * 构建 answers 接口的 mock 响应（包含选项解析）
   */
  function buildAnswerResponse(question: typeof question1, selectedOptionId: number) {
    const actualCorrectId = question.options[1].id; // 测试数据中第二个选项为正确答案
    const correct = selectedOptionId === actualCorrectId;
    return {
      correct,
      correctOptionId: actualCorrectId,
      explanation: question.explanation,
      options: question.options.map((o) => ({
        ...o,
        isCorrect: o.id === actualCorrectId,
      })),
    };
  }

  beforeEach(() => {
    // 关闭游客答错登录提示弹窗，避免遮挡 "下一题" 按钮
    localStorage.setItem("quiz-hide-login-prompt", "true");

    // stub questions endpoint - 后端返回格式为 { data: [...] }
    cy.intercept("GET", "**/questions*", {
      statusCode: 200,
      body: { data: [question1] },
    }).as("getQuestions");

    // stub answers endpoint (accept any POST) - 后端返回格式为 { data: {...} }
    cy.intercept("POST", "**/answers", (req) => {
      const selected = req.body?.selectedOptionId;
      req.reply({
        statusCode: 200,
        body: { data: buildAnswerResponse(question1, selected) },
      });
    }).as("postAnswer");

    cy.visit("/");
    cy.wait("@getQuestions");
  });

  describe("题目加载和展示", () => {
    it("应正确加载并显示题目和选项", () => {
      cy.contains(".stem", "HTTP 状态码 200");
      // CheckRadioGroup 渲染为 .radio-group，包含多个 .radio 子元素
      cy.get(".radio-group .radio").should("have.length", 2);
      cy.contains(".radio", "未找到");
      cy.contains(".radio", "成功");
    });

    it("答题前不应显示选项解析描述", () => {
      // 答题前所有选项的解析描述都不应该显示（has-content 类名不存在）
      cy.get(".radio__desc").should("not.have.class", "has-content");
    });
  });

  describe("答对流程", () => {
    it("选择正确选项后应高亮为绿色", () => {
      cy.contains(".radio", "成功").click();
      cy.wait("@postAnswer");

      // 正确选项应该有 .radio--correct 类
      cy.contains(".radio", "成功").should("have.class", "radio--correct");
    });

    it("答对后不应显示选项解析描述（快速跳题）", () => {
      cy.contains(".radio", "成功").click();
      cy.wait("@postAnswer");

      // 验证答对时 description 不显示（用户可快速跳到下一题）
      cy.get(".radio__desc").should("not.have.class", "has-content");
    });

    it("答对后不应显示下一题按钮（自动跳转）", () => {
      cy.contains(".radio", "成功").click();
      cy.wait("@postAnswer");

      // 答对时"下一题"按钮不应出现（因为会自动跳转）
      cy.contains("button", "下一题").should("not.exist");
    });
  });

  describe("答错流程", () => {
    it("选择错误选项后应高亮为红色，正确选项应高亮为绿色", () => {
      cy.contains(".radio", "未找到").click();
      cy.wait("@postAnswer");

      // 错误选项应该有 .radio--incorrect 类
      cy.contains(".radio", "未找到").should("have.class", "radio--incorrect");
      // 正确选项应该有 .radio--correct 类
      cy.contains(".radio", "成功").should("have.class", "radio--correct");
    });

    it("答错后应展示所有选项解析描述", () => {
      cy.contains(".radio", "未找到").click();
      cy.wait("@postAnswer");

      // 验证所有选项解析描述出现
      cy.get(".radio__desc").should("have.length", 2);
      cy.contains(".radio__desc", "404 状态码");
      cy.contains(".radio__desc", "200 表示请求成功");
    });

    it("答错后应显示下一题按钮", () => {
      cy.contains(".radio", "未找到").click();
      cy.wait("@postAnswer");

      // 验证"下一题"按钮可见
      cy.contains("button", "下一题").should("be.visible");
    });
  });

  describe("下一题导航", () => {
    it("答错后点击下一题按钮应加载新题目", () => {
      // 第一次答题：答错
      cy.contains(".radio", "未找到").click();
      cy.wait("@postAnswer");

      // 更新 mock 为第二题
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [question2] },
      }).as("getQuestions2");

      cy.intercept("POST", "**/answers", (req) => {
        const selected = req.body?.selectedOptionId;
        req.reply({
          statusCode: 200,
          body: { data: buildAnswerResponse(question2, selected) },
        });
      }).as("postAnswer2");

      // 点击"下一题"
      cy.contains("button", "下一题").click();
      cy.wait("@getQuestions2");

      // 验证新题目已加载
      cy.contains(".stem", "CSS Flexbox");
      cy.get(".radio-group .radio").should("have.length", 2);
      // 新题目的解析描述不应显示
      cy.get(".radio__desc").should("not.have.class", "has-content");
    });
  });
});
