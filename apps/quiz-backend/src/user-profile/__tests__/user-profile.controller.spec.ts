import { Test, TestingModule } from "@nestjs/testing";
import { UserProfileController } from "../user-profile.controller";
import { UserProfileService } from "../user-profile.service";
import { UserJwtAuthGuard } from "../../user-auth/guards/user-jwt-auth.guard";
import type { Request } from "express";

/**
 * UserProfileController 单元测试
 * 验证路由委托、参数解析和 req.user 提取
 */
describe("UserProfileController", () => {
  let controller: UserProfileController;
  let service: UserProfileService;

  /** 模拟已认证请求（含 user 信息） */
  const mockRequest = {
    user: { id: 10, username: "testuser", nickname: "测试用户" },
  } as unknown as Request;

  /** Mock 历史响应 */
  const mockHistoryResponse = {
    total: 1,
    items: [
      {
        id: 1,
        userId: 10,
        questionId: 1,
        isCorrect: true,
        question: { id: 1, stem: "题干", type: "single_choice" },
      },
    ],
  };

  /** Mock 偏好列表 */
  const mockPreferences = [
    {
      id: 1,
      userId: 10,
      categoryId: 3,
      category: { id: 3, name: "框架", group: { id: 1, name: "技术方向" } },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
      providers: [
        {
          provide: UserProfileService,
          useValue: {
            getHistory: jest.fn(),
            getPreferences: jest.fn(),
            updatePreferences: jest.fn(),
          },
        },
      ],
    })
      // 跳过 guard 真实执行
      .overrideGuard(UserJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserProfileController>(UserProfileController);
    service = module.get<UserProfileService>(UserProfileService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getHistory", () => {
    it("从 req.user 提取 userId，委托给 service.getHistory", async () => {
      // Arrange
      jest
        .spyOn(service, "getHistory")
        .mockResolvedValue(mockHistoryResponse as never);

      // Act
      const result = await controller.getHistory(mockRequest);

      // Assert
      expect(result).toEqual(mockHistoryResponse);
      expect(service.getHistory).toHaveBeenCalledWith(10, 1, 20);
    });

    it("解析 page / pageSize 字符串参数", async () => {
      // Arrange
      jest
        .spyOn(service, "getHistory")
        .mockResolvedValue(mockHistoryResponse as never);

      // Act
      await controller.getHistory(mockRequest, "3", "10");

      // Assert
      expect(service.getHistory).toHaveBeenCalledWith(10, 3, 10);
    });

    it("page / pageSize 未传时使用默认值", async () => {
      // Arrange
      jest
        .spyOn(service, "getHistory")
        .mockResolvedValue(mockHistoryResponse as never);

      // Act
      await controller.getHistory(mockRequest, undefined, undefined);

      // Assert
      expect(service.getHistory).toHaveBeenCalledWith(10, 1, 20);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getPreferences", () => {
    it("从 req.user 提取 userId，返回偏好列表", async () => {
      // Arrange
      jest
        .spyOn(service, "getPreferences")
        .mockResolvedValue(mockPreferences as never);

      // Act
      const result = await controller.getPreferences(mockRequest);

      // Assert
      expect(result).toEqual(mockPreferences);
      expect(service.getPreferences).toHaveBeenCalledWith(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updatePreferences", () => {
    it("将 req.user.id + dto.categoryIds 透传给 service", async () => {
      // Arrange
      jest
        .spyOn(service, "updatePreferences")
        .mockResolvedValue(mockPreferences as never);
      const dto = { categoryIds: [3, 5] };

      // Act
      const result = await controller.updatePreferences(mockRequest, dto);

      // Assert
      expect(result).toEqual(mockPreferences);
      expect(service.updatePreferences).toHaveBeenCalledWith(10, [3, 5]);
    });

    it("空 categoryIds 也能正确透传", async () => {
      // Arrange
      jest.spyOn(service, "updatePreferences").mockResolvedValue([] as never);
      const dto = { categoryIds: [] as number[] };

      // Act
      const result = await controller.updatePreferences(mockRequest, dto);

      // Assert
      expect(result).toEqual([]);
      expect(service.updatePreferences).toHaveBeenCalledWith(10, []);
    });
  });
});
