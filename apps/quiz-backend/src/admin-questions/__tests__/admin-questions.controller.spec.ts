import { Test, TestingModule } from "@nestjs/testing";
import { AdminQuestionsController } from "../admin-questions.controller";
import { AdminQuestionsService } from "../admin-questions.service";

/**
 * AdminQuestionsController 单元测试
 * 验证路由委托和参数透传，业务逻辑由 Service 测试覆盖
 */
describe("AdminQuestionsController", () => {
  let controller: AdminQuestionsController;
  let service: AdminQuestionsService;

  /** Mock 选项 */
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

  /** Mock 题目 */
  const mockQuestion = {
    id: 1,
    stem: "Vue 3 的响应式系统使用了哪种代理机制？",
    type: "single_choice",
    explanation: "Vue 3 使用 Proxy 实现响应式",
    tags: ["vue", "frontend"],
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: mockOptions,
    _count: { options: 4 },
  };

  /** Mock 列表响应 */
  const mockListResponse = { total: 1, items: [mockQuestion] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminQuestionsController],
      providers: [
        {
          provide: AdminQuestionsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminQuestionsController>(AdminQuestionsController);
    service = module.get<AdminQuestionsService>(AdminQuestionsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findAll", () => {
    it("应该将查询参数透传给 service.findAll 并返回结果", async () => {
      // Arrange
      const query = { keyword: "Vue", tag: "frontend", page: 1, pageSize: 10 };
      const findAllSpy = jest
        .spyOn(service, "findAll")
        .mockResolvedValue(mockListResponse as never);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result).toEqual(mockListResponse);
      expect(findAllSpy).toHaveBeenCalledWith(query);
    });

    it("无查询参数时，透传空对象给 service.findAll", async () => {
      // Arrange
      const findAllSpy = jest
        .spyOn(service, "findAll")
        .mockResolvedValue(mockListResponse as never);

      // Act
      await controller.findAll({});

      // Assert
      expect(findAllSpy).toHaveBeenCalledWith({});
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("findOne", () => {
    it("应该将 id 透传给 service.findOne 并返回题目详情", async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(service, "findOne")
        .mockResolvedValue(mockQuestion as never);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockQuestion);
      expect(findOneSpy).toHaveBeenCalledWith(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("create", () => {
    it("应该将 dto 透传给 service.create 并返回新题目", async () => {
      // Arrange
      const createDto = {
        stem: "新题目",
        options: [
          { text: "选项A", isCorrect: true },
          { text: "选项B", isCorrect: false },
        ],
      };
      const createSpy = jest
        .spyOn(service, "create")
        .mockResolvedValue(mockQuestion as never);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockQuestion);
      expect(result.options).toBeDefined();
      expect(createSpy).toHaveBeenCalledWith(createDto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("update", () => {
    it("应该将 id + dto 透传给 service.update 并返回更新后的题目", async () => {
      // Arrange
      const updateDto = { stem: "修改后的题干" };
      const updatedQuestion = { ...mockQuestion, stem: "修改后的题干" };
      const updateSpy = jest
        .spyOn(service, "update")
        .mockResolvedValue(updatedQuestion as never);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result.stem).toBe("修改后的题干");
      expect(updateSpy).toHaveBeenCalledWith(1, updateDto);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("remove", () => {
    it("应该将 id 透传给 service.remove 并返回成功消息", async () => {
      // Arrange
      const mockResult = { message: "题目删除成功" };
      const removeSpy = jest
        .spyOn(service, "remove")
        .mockResolvedValue(mockResult);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(result).toEqual(mockResult);
      expect(removeSpy).toHaveBeenCalledWith(1);
    });
  });
});
