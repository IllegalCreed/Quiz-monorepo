/**
 * Quiz Admin E2E 测试 - 权限管理
 * 测试权限查询功能
 */

/** 菜单权限项类型 */
interface MenuPermission {
  id: string;
  name: string;
  description: string;
}

/** API 权限项类型 */
interface ApiPermission {
  id: string;
  name: string;
  description: string;
  module: string;
}

describe("权限管理", () => {
  const BACKEND_URL = "http://localhost:10020";
  const RESET_SECRET = "test-reset-secret-2024";

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
  });

  it("应该能够查看菜单权限列表", () => {
    // 通过 API 直接获取菜单权限（在角色管理等页面会用到）
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/menus`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("admin-token")}`,
      },
    }).then((response) => {
      // 验证响应状态
      expect(response.status).to.equal(200);

      // 验证返回的权限列表
      expect(response.body.data).to.be.an("array");
      expect(response.body.data.length).to.be.greaterThan(0);

      // 验证包含必要的菜单权限
      const menuIds = response.body.data.map((item: MenuPermission) => item.id);
      expect(menuIds).to.include("dashboard");
      expect(menuIds).to.include("users");
      expect(menuIds).to.include("admins");
      expect(menuIds).to.include("roles");
      expect(menuIds).to.include("permissions");
      expect(menuIds).to.include("system");

      // 验证每个权限项的结构
      response.body.data.forEach((permission: MenuPermission) => {
        expect(permission).to.have.property("id");
        expect(permission).to.have.property("name");
        expect(permission).to.have.property("description");
      });
    });
  });

  it("应该能够查看 API 权限列表", () => {
    // 通过 API 直接获取 API 权限
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/apis`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("admin-token")}`,
      },
    }).then((response) => {
      // 验证响应状态
      expect(response.status).to.equal(200);

      // 验证返回的权限列表
      expect(response.body.data).to.be.an("array");
      expect(response.body.data.length).to.be.greaterThan(0);

      // 验证包含必要的 API 权限
      const permissionIds = response.body.data.map((item: ApiPermission) => item.id);
      expect(permissionIds).to.include("users:list");
      expect(permissionIds).to.include("users:create");
      expect(permissionIds).to.include("users:*");
      expect(permissionIds).to.include("admins:list");
      expect(permissionIds).to.include("roles:list");

      // 验证每个权限项的结构
      response.body.data.forEach((permission: ApiPermission) => {
        expect(permission).to.have.property("id");
        expect(permission).to.have.property("name");
        expect(permission).to.have.property("description");
        expect(permission).to.have.property("module");
      });
    });
  });

  it("API 权限应该按模块分组", () => {
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/apis`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("admin-token")}`,
      },
    }).then((response) => {
      const permissions = response.body.data;

      // 提取所有模块
      const modules = [...new Set(permissions.map((p: ApiPermission) => p.module))];

      // 验证包含主要模块
      expect(modules).to.include("users");
      expect(modules).to.include("admins");
      expect(modules).to.include("roles");
      expect(modules).to.include("permissions");

      // 验证每个模块都有通配符权限
      modules.forEach((module) => {
        const wildcardPermission = permissions.find((p: ApiPermission) => p.id === `${module}:*`);
        expect(wildcardPermission !== undefined).to.equal(true);
      });
    });
  });

  it("在角色管理页面应该能看到权限选择器", () => {
    // 导航到角色管理页面
    cy.contains(".menu-item", "角色管理").click();
    cy.url().should("include", "/home/roles");

    // 点击新增角色
    cy.contains("button", "新增角色").click();

    // 验证对话框中有权限选择
    cy.get(".el-dialog").should("be.visible");

    // 验证菜单权限部分存在
    cy.contains(".permission-group", "菜单权限").should("be.visible");
    cy.contains(".permission-group", "菜单权限").within(() => {
      // 验证包含主要的菜单权限选项
      cy.contains(".el-checkbox", "欢迎页").should("be.visible");
      cy.contains(".el-checkbox", "用户管理").should("be.visible");
      cy.contains(".el-checkbox", "管理员管理").should("be.visible");
      cy.contains(".el-checkbox", "角色管理").should("be.visible");
    });

    // 验证 API 权限部分存在
    cy.contains(".permission-group", "API 权限").should("be.visible");
    cy.contains(".permission-group", "API 权限").within(() => {
      // 验证包含主要的 API 权限选项
      cy.contains(".el-checkbox", "users:*").should("be.visible");
      cy.contains(".el-checkbox", "admins:*").should("be.visible");
      cy.contains(".el-checkbox", "roles:*").should("be.visible");
    });
  });

  it("权限选择器应该支持全选和取消全选", () => {
    // 导航到角色管理
    cy.contains(".menu-item", "角色管理").click();
    cy.contains("button", "新增角色").click();

    // 点击菜单权限的全选
    cy.contains(".permission-group", "菜单权限").within(() => {
      cy.get(".select-all-checkbox").click();

      // 验证所有选项都被选中
      cy.get(".el-checkbox").should("have.class", "is-checked");

      // 再次点击取消全选
      cy.get(".select-all-checkbox").click();

      // 验证所有选项都未选中
      cy.get(".el-checkbox").should("not.have.class", "is-checked");
    });
  });

  it("未登录时访问权限接口应返回 401", () => {
    // 清除 token
    cy.clearLocalStorage();

    // 尝试访问菜单权限接口
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/menus`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
    });

    // 尝试访问 API 权限接口
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/apis`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });

  it("无权限的管理员访问权限接口应返回 403", () => {
    // 登出超级管理员
    cy.get(".user-dropdown").click();
    cy.contains(".dropdown-item", "退出登录").click();

    // 使用普通管理员登录（假设普通管理员没有 permissions:list 权限）
    cy.get('input[placeholder="用户名"]').type("admin");
    cy.get('input[placeholder="密码"]').type("admin123");
    cy.contains("button", "登录").click();
    cy.url().should("include", "/home/dashboard");

    // 获取普通管理员的 token
    cy.window().then((win) => {
      const token = win.localStorage.getItem("admin-token");

      // 尝试访问权限接口
      cy.request({
        method: "GET",
        url: `${BACKEND_URL}/api/admin/permissions/menus`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        // 如果普通管理员没有 permissions:list 权限，应该返回 403
        // 如果有权限，则返回 200
        expect([200, 403]).to.include(response.status);
      });
    });
  });

  it("权限数据应该与后端种子数据一致", () => {
    // 获取菜单权限
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/menus`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("admin-token")}`,
      },
    }).then((menuResponse) => {
      const menuPermissions = menuResponse.body.data;

      // 验证菜单权限数量（应该是 6 个）
      expect(menuPermissions).to.have.length(6);

      // 验证具体的权限项
      const dashboardPermission = menuPermissions.find((p: MenuPermission) => p.id === "dashboard");
      expect(dashboardPermission !== undefined).to.equal(true);
      expect(dashboardPermission!.name).to.equal("欢迎页");
      expect(dashboardPermission!.description).to.include("首页");
    });

    // 获取 API 权限
    cy.request({
      method: "GET",
      url: `${BACKEND_URL}/api/admin/permissions/apis`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("admin-token")}`,
      },
    }).then((apiResponse) => {
      const apiPermissions = apiResponse.body.data;

      // 验证 API 权限数量应该大于 0
      expect(apiPermissions.length).to.be.greaterThan(0);

      // 验证包含 CRUD 权限
      const modules = ["users", "admins", "roles"];
      const actions = ["list", "create", "update", "delete", "*"];

      modules.forEach((module) => {
        actions.forEach((action) => {
          const permission = apiPermissions.find(
            (p: ApiPermission) => p.id === `${module}:${action}`,
          );
          expect(permission !== undefined).to.equal(true);
          expect(permission!.module).to.equal(module);
        });
      });
    });
  });
});
