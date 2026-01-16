describe('Quiz flow (real backend)', () => {
  beforeEach(() => {
    // Reset test DB via protected test endpoint (backend must be running and ENABLE_TEST_ENDPOINT=true)
    const apiBaseUrl = Cypress.env('apiBaseUrl') || 'http://localhost:10020'
    cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/api/test/reset`,
      failOnStatusCode: false,
      headers: {
        'x-reset-secret': Cypress.env('TEST_RESET_SECRET') || 's3cr3t',
      },
    }).then((res) => {
      if (res.status < 200 || res.status >= 300) {
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

    // Either an explanation is shown for a wrong choice, or the correct option is highlighted.
    cy.get('body').then(() => {
      cy.get('.explanation', { timeout: 10000 }).then(($exp) => {
        if ($exp.length) {
          // explanation shown — pass
        } else {
          cy.get('.option.correct', { timeout: 10000 }).should('exist')
        }
      })
    })
  })
})
