describe("Quiz flow (real backend)", () => {
  beforeEach(() => {
    // Reset test DB via protected test endpoint (backend must be running and ENABLE_TEST_ENDPOINT=true)
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
          "Test reset endpoint failed. Ensure backend is running and ENABLE_TEST_ENDPOINT=true. Response: " +
            res.status,
        );
      }
    });
    cy.visit("/");
  });

  it("loads question from backend and shows options", () => {
    cy.get(".stem").should("exist");
    // CheckRadioGroup renders .radio-group with .radio children
    cy.get(".radio-group .radio").should("have.length.greaterThan", 0);
  });

  it("can select option and show description after answering", () => {
    cy.get(".radio-group .radio").first().click();

    // 答题后应出现选项解析描述（.radio__desc）或正确高亮
    cy.get(".radio__desc, .radio.radio--correct", { timeout: 10000 }).should("exist");
  });

  it("答题后根据结果显示 UI（答对无描述，答错有描述）", () => {
    cy.get(".radio-group .radio").first().click();

    // 答题后应该出现正确/错误高亮
    cy.get(".radio.radio--correct, .radio.radio--incorrect", { timeout: 10000 }).should("exist");

    // 如果答错了（有红色高亮），则应该显示选项解析
    cy.get("body").then(($body) => {
      if ($body.find(".radio.radio--incorrect").length > 0) {
        // 答错：应该有 description
        cy.get(".radio__desc").should("have.length.greaterThan", 0);
      } else {
        // 答对：不应该有 description（快速跳题）
        cy.get(".radio__desc").should("not.exist");
      }
    });
  });
});
