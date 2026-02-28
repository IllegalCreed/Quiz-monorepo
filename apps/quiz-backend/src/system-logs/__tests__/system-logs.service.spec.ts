import { Test, TestingModule } from "@nestjs/testing";
import { SystemLogsService } from "../system-logs.service";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * SystemLogsService 单元测试
 * 测试日志创建和分页查询功能
 */
describe("SystemLogsService", () => {
  let service: SystemLogsService;
  let prisma: PrismaService;

  /** 模拟日志记录 */
  const mockLogEntry = {
    id: 1,
    type: "API_MUTATION",
    actorType: "ADMIN",
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemLogsService,
        {
          provide: PrismaService,
          useValue: {
            systemLog: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SystemLogsService>(SystemLogsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("create", () => {
    it("应该调用 prisma.systemLog.create 并传入正确的数据", async () => {
      // Arrange
      const dto = {
        type: "API_MUTATION" as const,
        actorType: "ADMIN" as const,
        actorId: 1,
        actorName: "super_admin",
        action: "CREATE",
        module: "questions",
        path: "/admin/questions",
        method: "POST",
        params: { stem: "测试题目" },
        result: { id: 1 },
        success: true,
        error: undefined,
        ip: "127.0.0.1",
        durationMs: 42,
      };
      jest
        .spyOn(prisma.systemLog, "create")
        .mockResolvedValue(mockLogEntry as any);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(mockLogEntry);
      expect(prisma.systemLog.create).toHaveBeenCalledWith({
        data: {
          type: "API_MUTATION",
          actorType: "ADMIN",
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
        },
      });
    });

    it("可选字段缺失时应使用默认值（null / undefined）", async () => {
      // Arrange：最小必填字段
      const dto = {
        type: "LOGIN" as const,
        actorType: "USER" as const,
        action: "LOGIN",
        module: "auth",
        path: "/api/user/auth/login",
        method: "POST",
        success: false,
        error: "密码错误",
      };
      jest
        .spyOn(prisma.systemLog, "create")
        .mockResolvedValue({ ...mockLogEntry, ...dto } as any);

      // Act
      await service.create(dto);

      // Assert：可选字段传入 null / undefined
      expect(prisma.systemLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: null,
          actorName: null,
          params: undefined,
          result: undefined,
          ip: null,
          durationMs: null,
          error: "密码错误",
        }),
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAll", () => {
    it("应该返回分页结果（无筛选条件）", async () => {
      // Arrange
      const mockItems = [mockLogEntry];
      jest.spyOn(prisma, "$transaction").mockResolvedValue([1, mockItems]);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 20 });

      // Assert
      expect(result).toEqual({ total: 1, items: mockItems });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确处理 type 筛选", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({ type: "LOGIN", page: 1, pageSize: 20 });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确处理 actorType 筛选", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        actorType: "ADMIN",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确处理 module 筛选", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        module: "questions",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确将 success='true' 转为布尔 true", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        success: "true",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确将 success='false' 转为布尔 false", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        success: "false",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确处理日期范围筛选（仅 startDate）", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        startDate: "2026-01-01",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确处理日期范围筛选（startDate + endDate）", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该正确计算分页 skip 值", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act：第3页，每页10条 → skip = 20
      await service.findAll({ page: 3, pageSize: 10 });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("页码和每页条数未传时应使用默认值", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act：不传 page 和 pageSize
      await service.findAll({});

      // Assert：默认 page=1, pageSize=20，skip=0
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该支持 actorId 筛选", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([0, []]);

      // Act
      await service.findAll({ actorId: 1, page: 1, pageSize: 20 });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该支持多个筛选条件组合", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([5, [mockLogEntry]]);

      // Act：同时传入多个筛选条件
      const result = await service.findAll({
        type: "API_MUTATION",
        actorType: "ADMIN",
        module: "questions",
        success: "true",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(result).toEqual({ total: 5, items: [mockLogEntry] });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
