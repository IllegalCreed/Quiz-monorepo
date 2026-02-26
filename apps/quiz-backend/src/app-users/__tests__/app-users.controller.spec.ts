import { Test, TestingModule } from "@nestjs/testing";
import { AppUsersController } from "../app-users.controller";
import { AppUsersService } from "../app-users.service";
import { UserStatus } from "@prisma/client";

/**
 * AppUsersController 单元测试
 */
describe("AppUsersController", () => {
  let controller: AppUsersController;
  let service: jest.Mocked<AppUsersService>;

  const mockUser = {
    id: 1,
    username: "testuser",
    nickname: "测试用户",
    email: "test@example.com",
    status: "ACTIVE" as UserStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { answerAttempts: 5, preferences: 2 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUsersController],
      providers: [
        {
          provide: AppUsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            getHistory: jest.fn(),
            getPreferences: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppUsersController>(AppUsersController);
    service = module.get(AppUsersService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("应该调用 service.findAll 并返回分页结果", async () => {
      // Arrange
      const mockResult = { total: 1, items: [mockUser] };
      service.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll({ page: 1, pageSize: 20 });

      // Assert
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result).toEqual(mockResult);
    });
  });

  describe("findOne", () => {
    it("应该调用 service.findOne 并返回用户详情", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe("getHistory", () => {
    it("应该调用 service.getHistory 并返回做题历史", async () => {
      // Arrange
      const mockHistory = { total: 0, items: [] };
      service.getHistory.mockResolvedValue(mockHistory);

      // Act
      const result = await controller.getHistory(1, 1, 20);

      // Assert
      expect(service.getHistory).toHaveBeenCalledWith(1, 1, 20);
      expect(result).toEqual(mockHistory);
    });
  });

  describe("getPreferences", () => {
    it("应该调用 service.getPreferences 并返回偏好分类", async () => {
      // Arrange
      service.getPreferences.mockResolvedValue([]);

      // Act
      const result = await controller.getPreferences(1);

      // Assert
      expect(service.getPreferences).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe("updateStatus", () => {
    it("应该调用 service.updateStatus 并返回更新后的用户", async () => {
      // Arrange
      const updatedUser = { ...mockUser, status: "DISABLED" as UserStatus };
      service.updateStatus.mockResolvedValue(updatedUser as any);

      // Act
      const result = await controller.updateStatus(1, { status: "DISABLED" });

      // Assert
      expect(service.updateStatus).toHaveBeenCalledWith(1, "DISABLED");
      expect(result.status).toBe("DISABLED");
    });
  });

  describe("remove", () => {
    it("应该调用 service.remove 并返回成功消息", async () => {
      // Arrange
      service.remove.mockResolvedValue({ message: "用户删除成功" });

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "用户删除成功" });
    });
  });
});
