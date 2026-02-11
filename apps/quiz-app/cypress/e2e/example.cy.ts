// Business E2E: quiz flow with mocked API

describe("Quiz flow (mocked)", () => {
  const question = {
    id: 1,
    stem: "（E2E）下面哪个是 HTTP 状态码 200 的含义？",
    options: [
      { id: 11, text: "未找到", description: "「未找到」对应 404 状态码，不是 200。" },
      { id: 12, text: "成功", description: "200 表示请求成功，服务器正常返回了数据。" },
    ],
    explanation: "200 表示请求成功",
  };

  /** 构建 answers 接口的 mock 响应（包含选项解析） */
  function buildAnswerResponse(selectedOptionId: number) {
    const correct = selectedOptionId === 12;
    return {
      correct,
      correctOptionId: 12,
      explanation: question.explanation,
      options: question.options.map((o) => ({
        ...o,
        isCorrect: o.id === 12,
      })),
    };
  }

  beforeEach(() => {
    // stub questions endpoint
    cy.intercept("GET", "**/questions*", {
      statusCode: 200,
      body: [question],
    }).as("getQuestions");

    // stub answers endpoint (accept any POST)
    cy.intercept("POST", "**/answers", (req) => {
      const selected = req.body?.selectedOptionId;
      req.reply({
        statusCode: 200,
        body: buildAnswerResponse(selected),
      });
    }).as("postAnswer");

    cy.visit("/");
    cy.wait("@getQuestions");
  });

  it("shows question and allows selecting correct option", () => {
    cy.contains(".stem", "HTTP 状态码 200");
    // CheckRadioGroup renders .radio-group with .radio children
    cy.get(".radio-group .radio").should("have.length", 2);

    // select correct option (id 12 -> text '成功')
    cy.contains(".radio", "成功").click();

    // correct selection should get .radio--correct class
    cy.contains(".radio", "成功").should("have.class", "radio--correct");
  });

  it("答对后不显示选项解析描述（快速跳题）", () => {
    cy.contains(".radio", "成功").click();
    cy.wait("@postAnswer");

    // 验证答对时 description 不显示（用户可快速跳到下一题）
    cy.get(".radio__desc").should("not.exist");
  });

  it("答错后应展示所有选项解析描述和下一题按钮", () => {
    cy.contains(".radio", "未找到").click();
    cy.wait("@postAnswer");

    // wrong selection should show radio--incorrect class
    cy.contains(".radio", "未找到").should("have.class", "radio--incorrect");
    // correct option should be highlighted
    cy.contains(".radio", "成功").should("have.class", "radio--correct");

    // 验证选项解析描述出现
    cy.get(".radio__desc").should("have.length", 2);
    cy.contains(".radio__desc", "404 状态码");
    cy.contains(".radio__desc", "200 表示请求成功");

    // 验证"下一题"按钮可见
    cy.contains("button", "下一题").should("be.visible");
  });

  it("答对后不显示下一题按钮（自动跳转）", () => {
    cy.contains(".radio", "成功").click();
    cy.wait("@postAnswer");

    // 答对时"下一题"按钮不应出现
    cy.contains("button", "下一题").should("not.exist");
  });
});
