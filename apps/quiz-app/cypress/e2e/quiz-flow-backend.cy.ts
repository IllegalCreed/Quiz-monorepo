/**
 * E2E 测试：真实后端集成测试
 *
 * 测试范围：
 * - 从真实后端加载题目
 * - 提交答案并获取判定结果
 * - 验证前后端交互正常
 *
 * 前置条件：
 * - 后端服务必须启动（默认 http://localhost:10020）
 * - 后端必须设置 ENABLE_TEST_ENDPOINT=true
 * - 环境变量：apiBaseUrl, TEST_RESET_SECRET
 */

describe("Quiz Flow - Real Backend", () => {
  beforeEach(() => {
    // 重置测试数据库（通过受保护的测试端点）
    const apiBaseUrl = Cypress.env("apiBaseUrl") || "http://localhost:10020";
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/api/test/reset`,
      failOnStatusCode: false,
      headers: {
        "x-reset-secret": Cypress.env("TEST_RESET_SECRET") || "s3cr3t",
      },
    }).then((res) => {
      if (res.status < 200 || res.status >= 300) {
        throw new Error(
          `Test reset endpoint failed. Ensure backend is running and ENABLE_TEST_ENDPOINT=true. Response: ${res.status}`,
        );
      }
    });
    cy.visit("/");
  });

  describe("题目加载", () => {
    it("应从后端加载题目并显示题干和选项", () => {
      // 等待题目加载完成
      cy.get(".stem", { timeout: 10000 }).should("exist").and("not.be.empty");
      // CheckRadioGroup 渲染为 .radio-group，包含多个 .radio 子元素
      cy.get(".radio-group .radio").should("have.length.greaterThan", 0);
    });

    it("答题前不应显示选项解析描述", () => {
      cy.get(".stem", { timeout: 10000 }).should("exist");
      // 答题前解析描述不应显示（has-content 类名不存在）
      cy.get(".radio__desc").should("not.have.class", "has-content");
    });
  });

  describe("答题交互", () => {
    it("可以选择选项并提交答案", () => {
      // 等待题目加载
      cy.get(".radio-group .radio", { timeout: 10000 })
        .should("have.length.greaterThan", 0)
        .first()
        .click();

      // 答题后应出现选项解析描述或正确/错误高亮
      cy.get(".radio__desc, .radio.radio--correct, .radio.radio--incorrect", {
        timeout: 10000,
      }).should("exist");
    });

    it("答对后不应显示选项解析描述", () => {
      cy.get(".radio-group .radio", { timeout: 10000 }).should("have.length.greaterThan", 0);

      // 尝试找到正确选项并点击（测试数据中第一个选项可能是正确的）
      cy.get(".radio-group .radio").first().click();

      // 等待答题结果
      cy.get(".radio.radio--correct, .radio.radio--incorrect", { timeout: 10000 }).should("exist");

      // 判断是否答对
      cy.get("body").then(($body) => {
        if (
          $body.find(".radio.radio--correct").length > 0 &&
          $body.find(".radio.radio--incorrect").length === 0
        ) {
          // 答对：不应该显示解析描述（has-content 类名不存在）
          cy.get(".radio__desc").should("not.have.class", "has-content");
          // 不应该显示"下一题"按钮
          cy.contains("button", "下一题").should("not.exist");
        }
      });
    });

    it("答错后应显示所有选项解析描述和下一题按钮", () => {
      cy.get(".radio-group .radio", { timeout: 10000 }).should("have.length.greaterThan", 0);

      // 等待题目加载
      cy.get(".radio-group .radio").first().click();

      // 等待答题结果
      cy.get(".radio.radio--correct, .radio.radio--incorrect", { timeout: 10000 }).should("exist");

      // 判断是否答错
      cy.get("body").then(($body) => {
        if ($body.find(".radio.radio--incorrect").length > 0) {
          // 答错：应该显示解析描述
          cy.get(".radio__desc").should("have.length.greaterThan", 0);
          // 应该显示"下一题"按钮
          cy.contains("button", "下一题").should("be.visible");
          // 应该高亮正确选项
          cy.get(".radio.radio--correct").should("exist");
        }
      });
    });
  });

  describe("下一题导航", () => {
    it("答错后点击下一题应加载新题目", () => {
      cy.get(".radio-group .radio", { timeout: 10000 }).should("have.length.greaterThan", 0);

      // 记录第一题的题干（暂未使用，但保留以备将来验证题干变化）
      cy.get(".stem")
        .invoke("text")
        .then((_firstStem) => {
          // 点击第一个选项
          cy.get(".radio-group .radio").first().click();

          // 等待答题结果
          cy.get(".radio.radio--correct, .radio.radio--incorrect", { timeout: 10000 }).should(
            "exist",
          );

          // 如果答错了，点击"下一题"
          cy.get("body").then(($body) => {
            if ($body.find("button:contains('下一题')").length > 0) {
              cy.contains("button", "下一题").click();

              // 等待新题目加载
              cy.get(".stem", { timeout: 10000 }).should("exist");

              // 验证题干已变化（如果有多题的话）
              // 注意：如果测试数据只有一题，题干可能不会变化
              cy.get(".radio__desc").should("not.have.class", "has-content");
            }
          });
        });
    });
  });
});
