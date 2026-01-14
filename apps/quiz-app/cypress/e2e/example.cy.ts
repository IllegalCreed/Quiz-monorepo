// Business E2E: quiz flow with mocked API

describe('Quiz flow (mocked)', () => {
  const question = {
    id: 1,
    stem: '（E2E）下面哪个是 HTTP 状态码 200 的含义？',
    options: [
      { id: 11, text: '未找到' },
      { id: 12, text: '成功' },
    ],
    explanation: '200 表示请求成功',
  }

  beforeEach(() => {
    // stub questions endpoint
    cy.intercept('GET', '**/questions*', {
      statusCode: 200,
      body: [question],
    }).as('getQuestions')

    // stub answers endpoint (accept any POST)
    cy.intercept('POST', '**/answers', (req) => {
      const selected = req.body?.selectedOptionId
      const correct = selected === 12
      req.reply({
        statusCode: 200,
        body: { correct, correctOptionId: 12, explanation: question.explanation },
      })
    }).as('postAnswer')

    cy.visit('/')
    cy.wait('@getQuestions')
  })

  it('shows question and allows selecting correct option', () => {
    cy.contains('.stem', 'HTTP 状态码 200')
    cy.get('.options .option').should('have.length', 2)

    // select correct option (id 12 -> text '成功')
    cy.contains('.option', '成功').click()

    // correct selection should get .correct class
    cy.contains('.option', '成功').should('have.class', 'correct')
  })

  it('shows wrong selection and explanation', () => {
    cy.contains('.stem', 'HTTP 状态码 200')
    cy.contains('.option', '未找到').click()

    // wrong selection should show wrong class and explanation element should appear
    cy.contains('.option', '未找到').should('have.class', 'wrong')
    cy.get('.explanation').should('exist').and('contain', '正确答案')
  })
})
