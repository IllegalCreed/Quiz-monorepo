import { Test, TestingModule } from "@nestjs/testing";
import { ClientsController } from "../clients.controller";
import { ClientsService } from "../clients.service";

/**
 * ClientsController 单元测试
 * 测试控制器是否正确委托给 Service 层
 */
describe("ClientsController", () => {
  let controller: ClientsController;
  let service: ClientsService;

  /** 模拟客户端摘要 */
  const mockClients = [
    {
      clientId: "abc-123",
      ip: "127.0.0.1",
      userId: 1,
      username: "testuser",
      currentPage: "/",
      connectedAt: "2026-01-15T10:00:00.000Z",
      lastHeartbeat: "2026-01-15T10:01:00.000Z",
    },
  ];

  /** 模拟统计 */
  const mockStats = { total: 1, loggedIn: 1, guest: 0 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: {
            register: jest.fn(),
            unregister: jest.fn(),
            updateHeartbeat: jest.fn(),
            getAll: jest.fn(),
            getStats: jest.fn(),
            broadcast: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("heartbeat", () => {
    it("应该调用 updateHeartbeat 并传入正确参数", () => {
      // Arrange
      const dto = { clientId: "abc-123", currentPage: "/quiz" };
      const mockReq = {
        user: { id: 1, username: "testuser", nickname: "Test" },
      } as any;

      // Act
      const result = controller.heartbeat(dto, mockReq);

      // Assert
      expect(result).toEqual({ ok: true });
      expect(service.updateHeartbeat).toHaveBeenCalledWith("abc-123", {
        currentPage: "/quiz",
        userId: 1,
        username: "testuser",
      });
    });

    it("游客心跳（无 JWT）应传入 null", () => {
      // Arrange
      const dto = { clientId: "abc-123" };
      const mockReq = { user: null } as any;

      // Act
      controller.heartbeat(dto, mockReq);

      // Assert
      expect(service.updateHeartbeat).toHaveBeenCalledWith("abc-123", {
        currentPage: undefined,
        userId: null,
        username: null,
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAll", () => {
    it("应该返回统计 + 客户端列表", () => {
      // Arrange
      jest.spyOn(service, "getStats").mockReturnValue(mockStats);
      jest.spyOn(service, "getAll").mockReturnValue(mockClients);

      // Act
      const result = controller.findAll();

      // Assert
      expect(result).toEqual({
        stats: mockStats,
        clients: mockClients,
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("broadcast", () => {
    it("应该委托给 service.broadcast 并返回发送数量", () => {
      // Arrange
      const dto = { type: "announcement" as const, message: "测试公告" };
      jest.spyOn(service, "broadcast").mockReturnValue({ sent: 3 });

      // Act
      const result = controller.broadcast(dto);

      // Assert
      expect(result).toEqual({ sent: 3 });
      expect(service.broadcast).toHaveBeenCalledWith("announcement", {
        message: "测试公告",
      });
    });

    it("refresh 类型广播不需要 message", () => {
      // Arrange
      const dto = { type: "refresh" as const };
      jest.spyOn(service, "broadcast").mockReturnValue({ sent: 5 });

      // Act
      const result = controller.broadcast(dto);

      // Assert
      expect(result).toEqual({ sent: 5 });
      expect(service.broadcast).toHaveBeenCalledWith("refresh", {
        message: undefined,
      });
    });
  });
});
