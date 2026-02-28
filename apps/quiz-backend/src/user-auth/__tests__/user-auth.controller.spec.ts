import { Test, TestingModule } from "@nestjs/testing";
import { UserAuthController } from "../user-auth.controller";
import { UserAuthService } from "../user-auth.service";
import { UserStatus } from "@prisma/client";

/**
 * UserAuthController 单元测试
 */
describe("UserAuthController", () => {
  let controller: UserAuthController;
  let service: jest.Mocked<UserAuthService>;

  const mockUserInfo = {
    id: 1,
    username: "testuser",
    nickname: "测试用户",
    email: "test@example.com",
    status: "ACTIVE" as UserStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResult = {
    token: "mock_token",
    user: mockUserInfo,
  };

  /** Mock Request 对象 */
  const mockReq = { ip: "127.0.0.1" } as never;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAuthController],
      providers: [
        {
          provide: UserAuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserAuthController>(UserAuthController);
    service = module.get(UserAuthService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("应该调用 service.register 并返回结果", async () => {
      // Arrange
      service.register.mockResolvedValue(mockAuthResult);

      // Act
      const result = await controller.register(
        {
          username: "testuser",
          password: "user123",
        },
        mockReq,
      );

      // Assert
      expect(service.register).toHaveBeenCalledWith(
        {
          username: "testuser",
          password: "user123",
        },
        "127.0.0.1",
      );
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe("login", () => {
    it("应该调用 service.login 并返回结果", async () => {
      // Arrange
      service.login.mockResolvedValue(mockAuthResult);

      // Act
      const result = await controller.login(
        {
          username: "testuser",
          password: "user123",
        },
        mockReq,
      );

      // Assert
      expect(service.login).toHaveBeenCalledWith(
        {
          username: "testuser",
          password: "user123",
        },
        "127.0.0.1",
      );
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe("getInfo", () => {
    it("应该返回当前用户信息", () => {
      // Act
      const result = controller.getInfo(mockUserInfo);

      // Assert
      expect(result).toEqual(mockUserInfo);
    });
  });
});
