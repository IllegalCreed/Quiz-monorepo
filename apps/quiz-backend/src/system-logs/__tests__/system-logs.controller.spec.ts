import { Test, TestingModule } from "@nestjs/testing";
import { SystemLogsController } from "../system-logs.controller";
import { SystemLogsService } from "../system-logs.service";
import type { LogType, ActorType } from "@prisma/client";

/**
 * SystemLogsController 单元测试
 * 测试控制器是否正确委托给 Service 层
 */
describe("SystemLogsController", () => {
  let controller: SystemLogsController;
  let service: SystemLogsService;

  /** 模拟分页返回值 */
  const mockPaginatedResult = {
    total: 1,
    items: [
      {
        id: 1,
        type: "API_MUTATION" as LogType,
        actorType: "ADMIN" as ActorType,
        actorId: 1,
        actorName: "super_admin",
        action: "CREATE",
        module: "questions",
        path: "/admin/questions",
        method: "POST",
        params: { stem: "测试题目" },
        result: { id: 1 },
        success: true,
        error: null,
        ip: "127.0.0.1",
        durationMs: 42,
        createdAt: new Date("2026-01-15T10:00:00Z"),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemLogsController],
      providers: [
        {
          provide: SystemLogsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemLogsController>(SystemLogsController);
    service = module.get<SystemLogsService>(SystemLogsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("应该委托给 service.findAll 并返回分页结果", async () => {
      // Arrange
      const query = { page: 1, pageSize: 20 };
      const findAllSpy = jest
        .spyOn(service, "findAll")
        .mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result).toEqual(mockPaginatedResult);
      expect(findAllSpy).toHaveBeenCalledWith(query);
    });

    it("应该将筛选条件透传给 service", async () => {
      // Arrange
      const query = {
        type: "LOGIN",
        actorType: "USER",
        module: "auth",
        success: "true",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        page: 2,
        pageSize: 10,
      };
      const findAllSpy = jest
        .spyOn(service, "findAll")
        .mockResolvedValue({ total: 0, items: [] });

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result).toEqual({ total: 0, items: [] });
      expect(findAllSpy).toHaveBeenCalledWith(query);
    });
  });
});
