describe('Quiz flow (real backend)', () => {
  beforeEach(() => {
    // Reset test DB via protected test endpoint (backend must be running and ENABLE_TEST_ENDPOINT=true)
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/test/reset',
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(
          'Test reset endpoint failed. Ensure backend is running and ENABLE_TEST_ENDPOINT=true. Response: ' +
            res.status,
        )
      }
    })
    cy.visit('/')
  })

  it('loads question from backend and shows options', () => {
    cy.get('.stem').should('exist')
    cy.get('.options .option').should('have.length.greaterThan', 0)
  })

  it('can select correct option and show explanation', () => {
    cy.get('.options .option').first().click()
    cy.get('.explanation').should('exist')
  })
})
