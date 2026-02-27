/**
 * Quiz Admin E2E 测试 - 题目管理
 * 测试题目的列表加载、搜索、新建、编辑、删除功能及权限隔离
 */

describe("题目管理", () => {
  const BACKEND_URL = Cypress.env("apiBaseUrl") || "http://localhost:10020";
  const RESET_SECRET = Cypress.env("TEST_RESET_SECRET");

  beforeEach(() => {
    // 重置测试数据库（恢复 10 条种子题目）
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
    cy.url().should("include", "/home");

    // 导航到题目管理页面
    cy.visit("/home/questions");
    cy.url().should("include", "/home/questions");

    // 等待列表加载完成
    cy.get(".el-loading-mask").should("not.exist");
  });

  it("题目列表应正常加载", () => {
    // 验证页面标题
    cy.contains("h2", "题目管理").should("be.visible");

    // 验证表格存在
    cy.get(".el-table").should("be.visible");

    // 重置后有 10 条种子题目，表格应有数据行
    cy.get(".el-table__body tr").should("have.length.greaterThan", 0);

    // 验证操作按钮存在
    cy.contains("button", "新增题目").should("be.visible");

    // 验证第一行有编辑和删除按钮
    cy.get(".el-table__body tr")
      .first()
      .within(() => {
        cy.contains("button", "编辑").should("be.visible");
        cy.contains("button", "删除").should("be.visible");
      });
  });

  it("关键词搜索应过滤题目", () => {
    // 输入不匹配任何题目的关键词
    cy.get('input[placeholder="搜索题干关键词"]').type("这是绝对不存在的关键词XYZABC");
    cy.contains("button", "搜索").click();

    // 等待加载完成
    cy.get(".el-loading-mask").should("not.exist");

    // 表格应显示无数据
    cy.get(".el-table__empty-block").should("be.visible");

    // 点击重置恢复完整列表
    cy.contains("button", "重置").click();
    cy.get(".el-loading-mask").should("not.exist");
    cy.get(".el-table__body tr").should("have.length.greaterThan", 0);
  });

  it("应该能够新建题目", () => {
    // 点击新增题目按钮，跳转到新建页
    cy.contains("button", "新增题目").click();
    cy.url().should("include", "/home/questions/new");

    // 页面标题应为新建模式
    cy.get(".question-detail-view__card-title").should("contain", "新增题目").and("be.visible");

    // 填写题干
    cy.get('textarea[placeholder="请输入题目题干"]').type("E2E新建：什么是闭包？");

    // 填写选项 A（第一个选项）
    cy.get(".question-detail-view__option")
      .eq(0)
      .find(".question-detail-view__option-text input")
      .type("函数及其词法作用域的组合");

    // 填写选项 B（第二个选项）
    cy.get(".question-detail-view__option")
      .eq(1)
      .find(".question-detail-view__option-text input")
      .type("一种循环结构");

    // 设置选项 A 为正确答案（点击第一个 radio）
    cy.get(".question-detail-view__option").eq(0).find(".el-radio").click();

    // 验证正确答案标签出现在选项 A
    cy.get(".question-detail-view__option")
      .eq(0)
      .contains(".el-tag", "正确答案")
      .should("be.visible");

    // 提交表单
    cy.contains("button", "创建题目").click();

    // 验证成功提示
    cy.contains(".el-message", "题目创建成功").should("be.visible");

    // 验证跳回列表页
    cy.url().should("include", "/home/questions");
    cy.url().should("not.include", "/new");

    // 验证新题目出现在列表中（按 createdAt desc 排序，新题在首行）
    cy.get(".el-loading-mask").should("not.exist");
    cy.contains("td", "E2E新建：什么是闭包？").should("exist");
  });

  it("应该能够编辑题目", () => {
    // 点击第一行的编辑按钮，跳转到编辑页
    cy.get(".el-table__body tr")
      .first()
      .within(() => {
        cy.contains("button", "编辑").click();
      });

    // 验证跳转到编辑页（URL 含数字 ID）
    cy.url().should("match", /\/home\/questions\/\d+$/);

    // 验证页面标题为编辑模式
    cy.get(".question-detail-view__card-title").should("contain", "编辑题目").and("exist");

    // 等待题目数据加载
    cy.get(".el-loading-mask").should("not.exist");

    // 清空题干并输入新内容
    cy.get('textarea[placeholder="请输入题目题干"]').clear();
    cy.get('textarea[placeholder="请输入题目题干"]').type("E2E已修改的题干内容");

    // 提交保存
    cy.contains("button", "保存修改").click();

    // 验证成功提示
    cy.contains(".el-message", "题目保存成功").should("be.visible");

    // 验证跳回列表页
    cy.url().should("include", "/home/questions");
    cy.url().should("not.match", /\/home\/questions\/\d+$/);

    // 验证修改后的题干出现在列表中
    cy.get(".el-loading-mask").should("not.exist");
    cy.contains("td", "E2E已修改的题干内容").should("exist");
  });

  it("应该能够软删除题目", () => {
    // 先记录当前总行数
    cy.get(".el-table__body tr").then((rows) => {
      const initialCount = rows.length;

      // 点击第一行的删除按钮
      cy.get(".el-table__body tr")
        .first()
        .within(() => {
          cy.contains("button", "删除").click();
        });

      // 验证确认弹窗
      cy.contains(".el-message-box", "确认删除题目").should("be.visible");

      // 点击确认删除
      cy.contains(".el-message-box button", "确认删除").click();

      // 验证成功提示
      cy.contains(".el-message", "题目已删除").should("be.visible");

      // 等待列表重新加载
      cy.get(".el-loading-mask").should("not.exist");

      // 验证行数减少 1
      cy.get(".el-table__body tr").should("have.length", initialCount - 1);
    });
  });

  // ── 题目分类选择（使用种子数据：技术方向 → 前端 → JavaScript / TypeScript）────

  /**
   * Element Plus 2.13 的 el-tree-select DOM 结构说明：
   * - 文字节点：`.el-select-dropdown__item span`（非 `.el-tree-node__label`）
   * - disabled 状态：`.el-select-dropdown__item.is-disabled`（非 `.el-checkbox.is-disabled`）
   * - 展开箭头：`.el-tree-node__expand-icon`
   * - 选中标签：`.el-tag`（在 `.el-select__wrapper` 内）
   */

  it("新建题目时应显示分类选择器", () => {
    // 进入新建题目页
    cy.contains("button", "新增题目").click();
    cy.url().should("include", "/home/questions/new");

    // 等待分类数据加载（种子数据含"技术方向"维度）
    cy.get(".question-detail-view__category-row").should("exist");

    // 维度名称应显示
    cy.contains(".question-detail-view__category-group-name", "技术方向").should("exist");

    // 点击第一个 tree-select 展开下拉
    cy.get(".question-detail-view__category-row").first().find(".el-select__wrapper").click();

    // 等待下拉面板及 tree 节点渲染
    cy.get(".el-tree-select__popper .el-select-dropdown__item", { timeout: 10000 }).should("exist");

    // 下拉面板中应显示"前端"分类节点
    cy.contains(".el-select-dropdown__item", "前端").should("be.visible");
  });

  it("分类选择器中非叶子节点不可选（disabled）", () => {
    // 进入新建题目页
    cy.contains("button", "新增题目").click();
    cy.url().should("include", "/home/questions/new");

    // 等待分类数据加载
    cy.get(".question-detail-view__category-row").should("exist");

    // 展开第一个 tree-select（技术方向维度）
    cy.get(".question-detail-view__category-row").first().find(".el-select__wrapper").click();
    cy.get(".el-tree-select__popper .el-select-dropdown__item", { timeout: 10000 }).should("exist");

    // 展开"前端"节点（点击展开箭头，非文字区域）
    cy.contains(".el-select-dropdown__item", "前端")
      .closest(".el-tree-node")
      .find(".el-tree-node__expand-icon")
      .first()
      .click();

    // "前端"是非叶子节点，应该为 disabled（.el-select-dropdown__item.is-disabled）
    cy.contains(".el-select-dropdown__item", "前端").should("have.class", "is-disabled");

    // "JavaScript / TypeScript"是叶子节点，应该可选（无 is-disabled）
    cy.contains(".el-select-dropdown__item", "JavaScript / TypeScript").should(
      "not.have.class",
      "is-disabled",
    );

    // 选中叶子节点
    cy.contains(".el-select-dropdown__item", "JavaScript / TypeScript").click();

    // 验证已选中（tree-select 显示已选标签）
    cy.get(".question-detail-view__category-select .el-tag").should(
      "contain",
      "JavaScript / TypeScript",
    );
  });

  it("新建题目时选择分类应提交到后端", () => {
    // 进入新建题目页
    cy.contains("button", "新增题目").click();
    cy.url().should("include", "/home/questions/new");

    // 填写必填字段
    cy.get('textarea[placeholder="请输入题目题干"]').type("E2E分类测试：什么是闭包？");
    cy.get(".question-detail-view__option")
      .eq(0)
      .find(".question-detail-view__option-text input")
      .type("函数及其词法作用域的组合");
    cy.get(".question-detail-view__option")
      .eq(1)
      .find(".question-detail-view__option-text input")
      .type("一种数据结构");
    cy.get(".question-detail-view__option").eq(0).find(".el-radio").click();

    // 等待分类选择器加载
    cy.get(".question-detail-view__category-row").should("exist");

    // 展开 tree-select 并选择叶子节点
    cy.get(".question-detail-view__category-row").first().find(".el-select__wrapper").click();
    cy.get(".el-tree-select__popper .el-select-dropdown__item", { timeout: 10000 }).should("exist");

    // 展开"前端"
    cy.contains(".el-select-dropdown__item", "前端")
      .closest(".el-tree-node")
      .find(".el-tree-node__expand-icon")
      .first()
      .click();

    // 选中叶子节点
    cy.contains(".el-select-dropdown__item", "JavaScript / TypeScript").click();

    // 关闭下拉（点击标题区域）
    cy.get(".question-detail-view__card-title").click();

    // 提交
    cy.contains("button", "创建题目").click();

    // 验证成功
    cy.contains(".el-message", "题目创建成功").should("be.visible");
    cy.url().should("include", "/home/questions");
    cy.url().should("not.include", "/new");

    // 验证新题目出现在列表中
    cy.get(".el-loading-mask").should("not.exist");
    cy.contains("td", "E2E分类测试：什么是闭包？").should("exist");
  });

  // ── 权限隔离 ─────────────────────────────────────────────────────────────

  it("无 questions 权限的管理员访问题目管理应被重定向", () => {
    // 登出当前超级管理员
    cy.get(".user-dropdown").click();
    cy.contains(".dropdown-item", "退出登录").click();

    // 确认登出 MessageBox
    cy.contains(".el-message-box", "确定退出登录").should("be.visible");
    cy.contains(".el-message-box button", "确定").click();

    // 等待跳转到登录页
    cy.url().should("include", "/login");

    // 使用普通管理员登录（仅有 users 权限，无 questions 权限）
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home");

    // 尝试直接访问题目管理页面
    cy.visit("/home/questions");

    // 应该被路由守卫重定向到 /home（因为 questions 路由未注册）
    cy.url().should("not.include", "/home/questions");
    cy.url().should("include", "/home");
  });
});
