import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsController } from "../permissions.controller";
import { PermissionsService } from "../permissions.service";

/**
 * Permissions Controller 单元测试
 * 测试路由处理和响应格式
 */
describe("PermissionsController", () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  const mockMenuPermissions = [
    { id: "dashboard", name: "欢迎页", description: "系统首页和统计数据" },
    { id: "users", name: "用户管理", description: "App 用户的增删改查" },
  ];

  const mockApiPermissions = [
    {
      id: "users:list",
      name: "查看用户列表",
      description: "获取 App 用户列表",
      module: "users",
    },
    {
      id: "users:create",
      name: "创建用户",
      description: "添加新用户",
      module: "users",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            getMenuPermissions: jest.fn(),
            getApiPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("getMenuPermissions", () => {
    it("应该返回菜单权限列表", () => {
      // Arrange
      const getMenuSpy = jest
        .spyOn(service, "getMenuPermissions")
        .mockReturnValue(mockMenuPermissions);

      // Act
      const result = controller.getMenuPermissions();

      // Assert
      expect(result).toEqual(mockMenuPermissions);
      expect(getMenuSpy).toHaveBeenCalled();
    });
  });

  describe("getApiPermissions", () => {
    it("应该返回 API 权限列表", () => {
      // Arrange
      const getApiSpy = jest
        .spyOn(service, "getApiPermissions")
        .mockReturnValue(mockApiPermissions);

      // Act
      const result = controller.getApiPermissions();

      // Assert
      expect(result).toEqual(mockApiPermissions);
      expect(getApiSpy).toHaveBeenCalled();
    });
  });
});
