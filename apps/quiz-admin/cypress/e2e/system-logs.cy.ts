/**
 * Quiz Admin E2E 测试 - 系统日志
 * 测试日志列表加载、类型筛选、操作结果筛选、展开行详情、分页
 * 依赖种子数据中的 15 条系统日志
 */

describe("系统日志", () => {
  const BACKEND_URL = Cypress.env("apiBaseUrl") || "http://localhost:10020";
  const RESET_SECRET = Cypress.env("TEST_RESET_SECRET");

  beforeEach(() => {
    // 重置测试数据库
    cy.request({
      method: "POST",
      url: `${BACKEND_URL}/api/test/reset`,
      headers: { "x-reset-secret": RESET_SECRET },
    });

    // 清除 localStorage
    cy.clearLocalStorage();

    // 使用超级管理员登录
    cy.visit("/login");
    cy.get('input[placeholder="用户名"]').type("super_admin");
    cy.get('input[placeholder="密码"]').type("super_admin");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 展开菜单（点击侧边栏折叠按钮）
    cy.get(".header-icon-btn").first().click();

    // 导航到系统日志页面
    cy.contains(".menu-item", "系统日志").click();
    cy.url().should("include", "/home/system-logs");
  });

  it("日志列表应正常加载", () => {
    // 验证页面标题
    cy.contains("h1", "系统日志").should("be.visible");

    // 验证表格存在
    cy.get(".el-table").should("be.visible");

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 种子数据有 15 条日志，默认 pageSize=20，应全部显示
    cy.get(".el-table__body-wrapper tbody tr").should("have.length.at.least", 15);

    // 验证分页显示总数（至少 15 条，登录本身也会产生日志）
    cy.get(".el-pagination").should("contain.text", "共");
  });

  it("应显示日志的关键字段", () => {
    cy.get(".el-loading-mask").should("not.exist");

    // 验证表头列
    cy.contains("th", "ID").should("exist");
    cy.contains("th", "时间").should("exist");
    cy.contains("th", "操作者").should("exist");
    cy.contains("th", "动作").should("exist");
    cy.contains("th", "模块").should("exist");
    cy.contains("th", "路径").should("exist");
    cy.contains("th", "耗时").should("exist");
    cy.contains("th", "状态").should("exist");
    cy.contains("th", "IP").should("exist");

    // 验证种子数据中的操作者出现在表格中
    cy.get(".el-table__body-wrapper").within(() => {
      cy.contains("super_admin").should("exist");
    });
  });

  it("日志类型筛选应正常工作", () => {
    // 选择"登录日志"类型
    cy.get(".filter-bar__select").first().click();
    cy.contains(".el-select-dropdown__item", "登录日志").click();
    cy.contains("button", "查询").click();

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 登录日志应包含 LOGIN 动作
    cy.get(".el-table__body-wrapper").within(() => {
      cy.contains("登录").should("exist");
    });

    // 不应包含 CREATE / UPDATE / DELETE 动作的标签
    // （种子数据中只有 LOGIN 和 REGISTER 在 LOGIN 类型下）
  });

  it("操作结果筛选应正常工作", () => {
    // 选择"失败"筛选
    cy.get(".filter-bar__select").eq(2).click();
    cy.contains(".el-select-dropdown__item", "失败").click();
    cy.contains("button", "查询").click();

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 所有行都应显示"失败"标签
    cy.get(".el-table__body-wrapper tbody tr").each(($row) => {
      cy.wrap($row).find(".el-tag--danger").should("exist");
    });
  });

  it("重置按钮应清除筛选条件", () => {
    // 先设置筛选条件
    cy.get(".filter-bar__select").first().click();
    cy.contains(".el-select-dropdown__item", "登录日志").click();
    cy.contains("button", "查询").click();
    cy.get(".el-loading-mask").should("not.exist");

    // 记录筛选后的行数
    cy.get(".el-table__body-wrapper tbody tr").then(($rows) => {
      const filteredCount = $rows.length;

      // 点击重置
      cy.contains("button", "重置").click();
      cy.get(".el-loading-mask").should("not.exist");

      // 重置后应显示更多日志（全部）
      cy.get(".el-table__body-wrapper tbody tr").should("have.length.at.least", filteredCount);
    });
  });

  it("展开行应显示详情信息", () => {
    cy.get(".el-loading-mask").should("not.exist");

    // 找到有 params 的操作日志行（种子数据中 CREATE 类型有 params）
    // 点击展开箭头（el-table__expand-icon）
    cy.get(".el-table__expand-icon").first().click();

    // 展开行应出现
    cy.get(".el-table__expanded-cell").should("be.visible");
  });

  it("分页应正常工作（设置每页 10 条）", () => {
    cy.get(".el-loading-mask").should("not.exist");

    // 修改每页条数为 10
    cy.get(".el-pagination .el-select").click();
    cy.contains(".el-select-dropdown__item", "10").click();

    // 等待重新加载
    cy.get(".el-loading-mask").should("not.exist");

    // 第一页应显示 10 条
    cy.get(".el-table__body-wrapper tbody tr").should("have.length", 10);

    // 点击下一页
    cy.get(".el-pagination .btn-next").click();
    cy.get(".el-loading-mask").should("not.exist");

    // 第二页应显示剩余记录（至少 5 条种子数据 + 可能的登录日志）
    cy.get(".el-table__body-wrapper tbody tr").should("have.length.at.least", 1);
  });
});
