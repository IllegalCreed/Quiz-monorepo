/**
 * Quiz Admin E2E 测试
 * 测试基础路由和登录页面功能
 */

describe('Quiz Admin - 基础功能', () => {
  it('访问根路径应重定向到登录页', () => {
    cy.visit('/')
    // 未登录时应该重定向到 /login
    cy.url().should('include', '/login')
  })

  it('登录页面正常加载', () => {
    cy.visit('/login')

    // 验证页面标题
    cy.contains('.login-title', 'Quiz Admin').should('be.visible')
    cy.contains('.login-subtitle', '管理后台').should('be.visible')

    // 验证表单元素存在
    cy.get('input[placeholder="用户名"]').should('be.visible')
    cy.get('input[placeholder="密码"]').should('be.visible')
    cy.contains('button', '登录').should('be.visible')
  })

  it('可以填写登录表单', () => {
    cy.visit('/login')

    // 填写表单
    cy.get('input[placeholder="用户名"]').type('admin')
    cy.get('input[placeholder="密码"]').type('123456')

    // 验证输入值
    cy.get('input[placeholder="用户名"]').should('have.value', 'admin')
    cy.get('input[placeholder="密码"]').should('have.value', '123456')
  })

  it('深色模式切换按钮存在且可点击', () => {
    cy.visit('/login')

    // 深色模式切换按钮应该可见
    cy.get('.dark-toggle').should('be.visible').click()
  })
})
