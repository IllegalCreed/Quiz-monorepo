import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { AdminInfo } from "../interfaces/admin-info.interface";

/**
 * Auth Controller 单元测试
 * 测试路由处理和响应格式
 */
describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAdminInfo: AdminInfo = {
    id: 1,
    username: "super_admin",
    nickname: "超级管理员",
    role: "super_admin",
    roleId: 1,
    roleName: "超级管理员",
    menuPermissions: [
      "dashboard",
      "users",
      "admins",
      "roles",
      "questions",
      "system",
    ],
    apiPermissions: ["*:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginResponse = {
    token: "mock_jwt_token",
    admin: mockAdminInfo,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("应该返回 token 和管理员信息", async () => {
      // Arrange
      const loginSpy = jest
        .spyOn(service, "login")
        .mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login({
        username: "super_admin",
        password: "super_admin",
      });

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(loginSpy).toHaveBeenCalledWith({
        username: "super_admin",
        password: "super_admin",
      });
    });
  });

  describe("getInfo", () => {
    it("应该返回当前管理员信息", () => {
      // Act
      const result = controller.getInfo(mockAdminInfo);

      // Assert
      expect(result).toEqual(mockAdminInfo);
    });
  });

  describe("logout", () => {
    it("应该返回成功消息", () => {
      // Act
      const result = controller.logout();

      // Assert
      expect(result).toEqual({ message: "登出成功" });
    });
  });
});
