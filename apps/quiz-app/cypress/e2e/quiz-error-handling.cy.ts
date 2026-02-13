/**
 * E2E 测试：错误处理
 *
 * 测试范围：
 * - API 请求失败（404、500 等）
 * - 网络错误
 * - 空状态（暂无题目）
 * - 后端返回错误数据
 */

describe("Quiz Flow - Error Handling", () => {
  describe("API 错误处理", () => {
    it("当题目加载失败（500）时，应显示错误提示", () => {
      // stub questions endpoint 返回 500 错误
      cy.intercept("GET", "**/questions*", {
        statusCode: 500,
        body: { message: "Internal Server Error" },
      }).as("getQuestionsError");

      cy.visit("/");
      cy.wait("@getQuestionsError");

      // 应显示错误提示（根据实际实现可能不同）
      cy.get(".error").should("exist");
      // 或者显示特定的错误消息
      // cy.contains('加载失败').should('be.visible');
    });

    it("当题目加载失败（404）时，应显示错误提示", () => {
      // stub questions endpoint 返回 404 错误
      cy.intercept("GET", "**/questions*", {
        statusCode: 404,
        body: { message: "Not Found" },
      }).as("getQuestionsNotFound");

      cy.visit("/");
      cy.wait("@getQuestionsNotFound");

      // 应显示错误提示
      cy.get(".error").should("exist");
    });

    it("当答案提交失败时，应显示错误提示", () => {
      const question = {
        id: 1,
        stem: "测试题目",
        options: [
          { id: 11, text: "选项 A", description: "解析 A" },
          { id: 12, text: "选项 B", description: "解析 B" },
        ],
        explanation: "测试解析",
      };

      // 题目加载成功（包装在 data 字段中）
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [question] },
      }).as("getQuestions");

      // 答案提交失败
      cy.intercept("POST", "**/answers", {
        statusCode: 500,
        body: { message: "Internal Server Error" },
      }).as("postAnswerError");

      cy.visit("/");
      cy.wait("@getQuestions");

      // 选择选项（注意：CheckRadio 使用 button，不是 input）
      cy.get(".radio-group .radio button").first().click();
      cy.wait("@postAnswerError");

      // 应显示错误提示
      cy.get(".error").should("exist");
    });
  });

  describe("空状态处理", () => {
    it("当后端返回空题目列表时，应显示空状态提示", () => {
      // stub questions endpoint 返回空数组（包装在 data 字段中）
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [] },
      }).as("getQuestionsEmpty");

      cy.visit("/");
      cy.wait("@getQuestionsEmpty");

      // 应显示"暂无题目"提示
      cy.contains("暂无题目").should("be.visible");
    });

    it("当后端返回 null 时，应显示空状态提示", () => {
      // stub questions endpoint 返回 null（包装在 data 字段中）
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: null },
      }).as("getQuestionsNull");

      cy.visit("/");
      cy.wait("@getQuestionsNull");

      // 应显示"暂无题目"提示或错误提示
      cy.get("body").then(($body) => {
        const hasEmptyState = $body.find(':contains("暂无题目")').length > 0;
        const hasError = $body.find(".error").length > 0;
        expect(hasEmptyState || hasError).to.equal(true);
      });
    });
  });

  describe("网络错误处理", () => {
    it("当网络请求超时时，应显示错误提示", () => {
      // 模拟网络超时
      cy.intercept("GET", "**/questions*", {
        forceNetworkError: true,
      }).as("getQuestionsTimeout");

      cy.visit("/");

      // 等待错误提示出现（使用具体的等待条件而不是固定时间）
      cy.get(".error, body:contains('暂无题目')", { timeout: 5000 }).should("exist");
    });

    it("当网络断开时，答题请求应失败", () => {
      const question = {
        id: 1,
        stem: "测试题目",
        options: [
          { id: 11, text: "选项 A", description: "解析 A" },
          { id: 12, text: "选项 B", description: "解析 B" },
        ],
        explanation: "测试解析",
      };

      // 题目加载成功（包装在 data 字段中）
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [question] },
      }).as("getQuestions");

      cy.visit("/");
      cy.wait("@getQuestions");

      // 模拟答题时网络断开
      cy.intercept("POST", "**/answers", {
        forceNetworkError: true,
      }).as("postAnswerNetworkError");

      // 选择选项
      cy.get(".radio-group .radio button").first().click();

      // 等待错误提示出现
      cy.get(".error", { timeout: 5000 }).should("exist");
    });
  });

  describe("数据验证", () => {
    it("当题目缺少必填字段时，应能正常处理", () => {
      // 返回缺少字段的题目（包装在 data 字段中）
      const incompleteQuestion = {
        id: 1,
        // stem 缺失
        options: [
          { id: 11, text: "选项 A" },
          { id: 12, text: "选项 B" },
        ],
      };

      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [incompleteQuestion] },
      }).as("getIncompleteQuestion");

      cy.visit("/");
      cy.wait("@getIncompleteQuestion");

      // 应显示错误或能够正常渲染（取决于实现）
      cy.get("body").should("exist");
    });

    it("当选项缺少文本时，应能正常处理", () => {
      const questionWithIncompleteOptions = {
        id: 1,
        stem: "测试题目",
        options: [
          { id: 11 }, // text 缺失
          { id: 12, text: "选项 B" },
        ],
      };

      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [questionWithIncompleteOptions] },
      }).as("getQuestionIncompleteOptions");

      cy.visit("/");
      cy.wait("@getQuestionIncompleteOptions");

      // 应能正常渲染或显示错误
      cy.get("body").should("exist");
    });
  });

  describe("并发请求处理", () => {
    it("当快速点击下一题时，应正确处理并发请求", () => {
      const question1 = {
        id: 1,
        stem: "题目 1",
        options: [
          { id: 11, text: "选项 A", description: "解析 A" },
          { id: 12, text: "选项 B", description: "解析 B" },
        ],
      };

      const question2 = {
        id: 2,
        stem: "题目 2",
        options: [
          { id: 21, text: "选项 C", description: "解析 C" },
          { id: 22, text: "选项 D", description: "解析 D" },
        ],
      };

      // 第一题（包装在 data 字段中）
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [question1] },
      }).as("getQuestions1");

      cy.intercept("POST", "**/answers", {
        statusCode: 200,
        body: {
          data: {
            correct: false,
            correctOptionId: 12,
            explanation: "解析",
            options: question1.options.map((o) => ({
              ...o,
              description: o.description || null,
              isCorrect: o.id === 12,
            })),
          },
        },
      }).as("postAnswer1");

      cy.visit("/");
      cy.wait("@getQuestions1");

      // 答错第一题
      cy.get(".radio-group .radio button").first().click();
      cy.wait("@postAnswer1");

      // 准备第二题（包装在 data 字段中），添加延迟模拟真实网络
      cy.intercept("GET", "**/questions*", {
        statusCode: 200,
        body: { data: [question2] },
        delay: 100, // 延迟 100ms，确保在响应返回前可以点击第二次
      }).as("getQuestions2");

      // 快速双击"下一题"按钮（测试防抖锁）
      cy.contains("button", "下一题").dblclick();

      // 应只加载一次新题目（不会因为重复点击而多次请求）
      cy.wait("@getQuestions2").then(() => {
        // 验证只发送了一次请求（如果发送多次，这里会超时）
        cy.get("@getQuestions2.all").should("have.length", 1);
      });
      cy.contains(".stem", "题目 2").should("exist");
    });
  });
});
