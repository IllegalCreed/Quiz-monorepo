import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { AdminQuestionsService } from "../admin-questions.service";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * AdminQuestionsService 单元测试
 * 覆盖 CRUD、软删除、正确答案校验和应用层标签过滤
 */
describe("AdminQuestionsService", () => {
  let service: AdminQuestionsService;
  let prisma: PrismaService;

  /** Mock 选项数据 */
  const mockOptions = [
    {
      id: 1,
      text: "Proxy",
      isCorrect: true,
      description: "正确答案",
      questionId: 1,
    },
    {
      id: 2,
      text: "Object.defineProperty",
      isCorrect: false,
      description: "Vue 2 方式",
      questionId: 1,
    },
    {
      id: 3,
      text: "WeakMap",
      isCorrect: false,
      description: null,
      questionId: 1,
    },
    {
      id: 4,
      text: "MutationObserver",
      isCorrect: false,
      description: null,
      questionId: 1,
    },
  ];

  /** Mock 题目数据 */
  const mockQuestion = {
    id: 1,
    stem: "Vue 3 的响应式系统使用了哪种代理机制？",
    type: "single_choice",
    explanation: "Vue 3 使用 Proxy 实现响应式",
    tags: ["vue", "frontend"] as unknown,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    options: mockOptions,
    _count: { options: 4 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminQuestionsService,
        {
          provide: PrismaService,
          useValue: {
            question: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            option: {
              deleteMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminQuestionsService>(AdminQuestionsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAll", () => {
    it("无过滤条件时，返回分页列表", async () => {
      // Arrange：$transaction 返回 [items, total] 元组
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[mockQuestion], 1]);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 20 });

      // Assert
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].stem).toBe(mockQuestion.stem);
    });

    it("传入 keyword 时，where 条件包含 stem.contains", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[mockQuestion], 1]);
      const findManySpy = jest.spyOn(prisma.question, "findMany");

      // Act
      await service.findAll({ keyword: "Vue", page: 1, pageSize: 20 });

      // Assert：验证 findMany 被以正确的 where 条件调用
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stem: { contains: "Vue" },
          }),
        }),
      );
    });

    it("tag 有匹配时，应用层过滤后返回正确题目", async () => {
      // Arrange：mock 题目含 tags: ["vue", "frontend"]
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[mockQuestion], 1]);

      // Act
      const result = await service.findAll({
        tag: "vue",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("tag 无匹配时，应用层过滤后返回空列表", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[mockQuestion], 1]);

      // Act
      const result = await service.findAll({
        tag: "不存在的标签",
        page: 1,
        pageSize: 20,
      });

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("分页参数正确传递（page=2, pageSize=10 → skip=10）", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);
      const findManySpy = jest.spyOn(prisma.question, "findMany");

      // Act
      await service.findAll({ page: 2, pageSize: 10 });

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findOne", () => {
    it("正常返回含选项的题目", async () => {
      // Arrange
      const findFirstSpy = jest
        .spyOn(prisma.question, "findFirst")
        .mockResolvedValue(mockQuestion as never);

      // Act
      const result = await service.findOne(1);

      // Assert：必须以软删除过滤条件查询
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        include: { options: true },
      });
      expect(result.options).toHaveLength(4);
    });

    it("题目不存在时，抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.question, "findFirst").mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow("题目 #999 不存在");
    });

    it("已软删除的题目（findFirst 返回 null），抛出 NotFoundException", async () => {
      // Arrange：软删除后 findFirst 带 deletedAt:null 条件，返回 null
      jest.spyOn(prisma.question, "findFirst").mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("create", () => {
    /** 合法的创建 DTO（恰好 1 个正确答案） */
    const validCreateDto = {
      stem: "新题目",
      options: [
        { text: "选项A", isCorrect: true, description: "正确" },
        { text: "选项B", isCorrect: false },
        { text: "选项C", isCorrect: false },
        { text: "选项D", isCorrect: false },
      ],
    };

    it("恰好 1 个正确答案，创建成功并返回含选项的题目", async () => {
      // Arrange
      const createSpy = jest
        .spyOn(prisma.question, "create")
        .mockResolvedValue(mockQuestion as never);

      // Act
      const result = await service.create(validCreateDto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { options: true },
        }),
      );
      expect(result.options).toBeDefined();
    });

    it("0 个正确答案，抛出 BadRequestException", async () => {
      // Arrange
      const dto = {
        stem: "题目",
        options: [
          { text: "A", isCorrect: false },
          { text: "B", isCorrect: false },
        ],
      };

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        "单选题必须恰好有 1 个正确答案",
      );
      const createMock = jest.spyOn(prisma.question, "create");
      expect(createMock).not.toHaveBeenCalled();
    });

    it("2 个正确答案，抛出 BadRequestException", async () => {
      // Arrange
      const dto = {
        stem: "题目",
        options: [
          { text: "A", isCorrect: true },
          { text: "B", isCorrect: true },
        ],
      };

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      const createMock = jest.spyOn(prisma.question, "create");
      expect(createMock).not.toHaveBeenCalled();
    });

    it("默认 type 为 single_choice", async () => {
      // Arrange
      const createSpy = jest
        .spyOn(prisma.question, "create")
        .mockResolvedValue(mockQuestion as never);

      // Act
      await service.create(validCreateDto);

      // Assert：create 数据中 type 应为 'single_choice'
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: "single_choice" }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("update", () => {
    it("不带 options，直接调用 question.update（不走 $transaction）", async () => {
      // Arrange：findOne 两次调用都返回 mockQuestion
      jest
        .spyOn(prisma.question, "findFirst")
        .mockResolvedValue(mockQuestion as never);
      const updateSpy = jest
        .spyOn(prisma.question, "update")
        .mockResolvedValue(mockQuestion as never);
      const transactionSpy = jest.spyOn(prisma, "$transaction");

      // Act
      await service.update(1, { stem: "修改后的题干" });

      // Assert
      expect(transactionSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ stem: "修改后的题干" }),
        }),
      );
    });

    it("带 options，走 $transaction replace-all（先删旧选项，再创建新选项）", async () => {
      // Arrange
      jest
        .spyOn(prisma.question, "findFirst")
        .mockResolvedValue(mockQuestion as never);
      const transactionSpy = jest
        .spyOn(prisma, "$transaction")
        .mockResolvedValue([{ count: 4 }, mockQuestion]);
      const deleteManyMock = jest.spyOn(prisma.option, "deleteMany");

      const updateDto = {
        options: [
          { text: "新选项A", isCorrect: true },
          { text: "新选项B", isCorrect: false },
        ],
      };

      // Act
      await service.update(1, updateDto);

      // Assert：使用事务，不直接调用 question.update
      expect(transactionSpy).toHaveBeenCalled();
      expect(deleteManyMock).toHaveBeenCalledWith({
        where: { questionId: 1 },
      });
    });

    it("带 options 但 0 个正确答案，抛出 BadRequestException", async () => {
      // Arrange
      jest
        .spyOn(prisma.question, "findFirst")
        .mockResolvedValue(mockQuestion as never);
      const transactionSpy = jest.spyOn(prisma, "$transaction");

      const updateDto = {
        options: [
          { text: "A", isCorrect: false },
          { text: "B", isCorrect: false },
        ],
      };

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(transactionSpy).not.toHaveBeenCalled();
    });

    it("题目不存在，抛出 NotFoundException", async () => {
      // Arrange：findFirst 返回 null
      jest.spyOn(prisma.question, "findFirst").mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { stem: "新题干" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("remove", () => {
    it("软删除：调用 question.update 设置 deletedAt，而非 delete", async () => {
      // Arrange
      jest
        .spyOn(prisma.question, "findFirst")
        .mockResolvedValue(mockQuestion as never);
      const updateSpy = jest
        .spyOn(prisma.question, "update")
        .mockResolvedValue({
          ...mockQuestion,
          deletedAt: new Date(),
        } as never);

      // Act
      const result = await service.remove(1);

      // Assert：使用 update + deletedAt，不调用 question.delete
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual({ message: "题目删除成功" });
    });

    it("题目不存在，抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.question, "findFirst").mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow("题目 #999 不存在");
    });
  });
});
