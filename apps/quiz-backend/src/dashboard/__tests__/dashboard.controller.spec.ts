/**
 * DashboardController 单元测试
 * 验证控制器正确委托 Service 调用
 */
import { Test, TestingModule } from "@nestjs/testing";
import { DashboardController } from "../dashboard.controller";
import { DashboardService } from "../dashboard.service";

describe("DashboardController", () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardData = {
    overview: {
      questions: { total: 100, today: 5 },
      users: { total: 50, today: 2 },
      attempts: { total: 1000, today: 80 },
      accuracy: { total: 70, today: 75 },
    },
    dailyTrend: [],
    categoryDistribution: [],
    recentLogs: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboard: jest.fn().mockResolvedValue(mockDashboardData),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it("应该被正确实例化", () => {
    expect(controller).toBeDefined();
  });

  it("getDashboard 应委托给 DashboardService", async () => {
    const result = await controller.getDashboard();

    expect(service.getDashboard).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockDashboardData);
  });
});
