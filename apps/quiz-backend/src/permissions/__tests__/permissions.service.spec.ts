import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsService } from "../permissions.service";

/**
 * Permissions Service 单元测试
 * 测试静态权限数据返回
 */
describe("PermissionsService", () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("getMenuPermissions", () => {
    it("应该返回所有菜单权限", () => {
      // Act
      const result = service.getMenuPermissions();

      // Assert
      expect(result).toHaveLength(6);
      expect(result).toEqual([
        { id: "dashboard", name: "欢迎页", description: "系统首页和统计数据" },
        { id: "users", name: "用户管理", description: "App 用户的增删改查" },
        {
          id: "admins",
          name: "管理员管理",
          description: "后台管理员的增删改查",
        },
        { id: "roles", name: "角色管理", description: "角色及权限配置" },
        {
          id: "permissions",
          name: "权限管理",
          description: "查看系统所有权限",
        },
        { id: "system", name: "系统管理", description: "系统配置和日志" },
      ]);
    });

    it("每个菜单权限应该包含 id、name、description", () => {
      // Act
      const result = service.getMenuPermissions();

      // Assert
      result.forEach((permission) => {
        expect(permission).toHaveProperty("id");
        expect(permission).toHaveProperty("name");
        expect(permission).toHaveProperty("description");
        expect(typeof permission.id).toBe("string");
        expect(typeof permission.name).toBe("string");
        expect(typeof permission.description).toBe("string");
      });
    });
  });

  describe("getApiPermissions", () => {
    it("应该返回所有 API 权限", () => {
      // Act
      const result = service.getApiPermissions();

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "users:list",
            name: "查看用户列表",
            description: "获取 App 用户列表",
            module: "users",
          }),
          expect.objectContaining({
            id: "admins:create",
            name: "创建管理员",
            description: "添加新的管理员",
            module: "admins",
          }),
          expect.objectContaining({
            id: "roles:delete",
            name: "删除角色",
            description: "删除角色",
            module: "roles",
          }),
        ]),
      );
    });

    it("每个 API 权限应该包含 id、name、description、module", () => {
      // Act
      const result = service.getApiPermissions();

      // Assert
      result.forEach((permission) => {
        expect(permission).toHaveProperty("id");
        expect(permission).toHaveProperty("name");
        expect(permission).toHaveProperty("description");
        expect(permission).toHaveProperty("module");
        expect(typeof permission.id).toBe("string");
        expect(typeof permission.name).toBe("string");
        expect(typeof permission.description).toBe("string");
        expect(typeof permission.module).toBe("string");
      });
    });

    it("应该包含通配符权限", () => {
      // Act
      const result = service.getApiPermissions();

      // Assert
      const wildcardPermissions = result.filter((p) => p.id.includes(":*"));
      expect(wildcardPermissions.length).toBeGreaterThan(0);
      expect(wildcardPermissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "users:*" }),
          expect.objectContaining({ id: "admins:*" }),
          expect.objectContaining({ id: "roles:*" }),
        ]),
      );
    });

    it("应该按模块分组", () => {
      // Act
      const result = service.getApiPermissions();

      // Assert
      const modules = [...new Set(result.map((p) => p.module))];
      expect(modules).toContain("users");
      expect(modules).toContain("admins");
      expect(modules).toContain("roles");
      expect(modules).toContain("permissions");
      expect(modules).toContain("questions");
    });
  });
});
