import { Test, TestingModule } from "@nestjs/testing";
import { QuestionsController } from "../questions.controller";
import { QuestionsService } from "../questions.service";

/**
 * QuestionsController 单元测试
 * 被测接口：GET /questions（quiz-app 随机取题）
 * 注：POST /questions/check 已废弃，答题请使用 POST /answers
 */
describe("QuestionsController", () => {
  let controller: QuestionsController;
  let service: QuestionsService;

  // 单道题目的 mock 数据
  const mockQuestion = {
    id: 1,
    stem: "以下哪个是 JavaScript 的数据类型？",
    explanation: "JavaScript 有 7 种原始类型",
    tags: null,
    categoryNames: [] as string[],
    options: [
      { id: 1, text: "string", description: "字符串类型" },
      { id: 2, text: "integer", description: "JS 中没有 integer 类型" },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: {
            getRandom: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get<QuestionsService>(QuestionsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("get", () => {
    it("不传 limit 时默认返回 1 道题", async () => {
      // Arrange
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue([mockQuestion]);

      // Act
      const result = await controller.get(undefined);

      // Assert
      expect(getRandomSpy).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual([mockQuestion]);
    });

    it("传入 limit 字符串时应解析为数字并返回对应数量的题目", async () => {
      // Arrange
      const mockQuestions = [mockQuestion, { ...mockQuestion, id: 2 }];
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue(mockQuestions);

      // Act
      const result = await controller.get("2");

      // Assert
      expect(getRandomSpy).toHaveBeenCalledWith(2, undefined);
      expect(result).toHaveLength(2);
    });

    it("应该返回题目列表（含选项）", async () => {
      // Arrange
      jest.spyOn(service, "getRandom").mockResolvedValue([mockQuestion]);

      // Act
      const result = await controller.get("1");

      // Assert
      expect(result[0]).toHaveProperty("stem");
      expect(result[0]).toHaveProperty("options");
      expect(result[0]?.options).toHaveLength(2);
    });

    it("题库为空时应返回空数组", async () => {
      // Arrange
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue([]);

      // Act
      const result = await controller.get("5");

      // Assert
      expect(getRandomSpy).toHaveBeenCalledWith(5, undefined);
      expect(result).toEqual([]);
    });

    it("传入 categoryIds 字符串时解析为数字数组", async () => {
      // Arrange
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue([mockQuestion]);

      // Act
      const result = await controller.get("1", "3,5,7");

      // Assert
      expect(getRandomSpy).toHaveBeenCalledWith(1, [3, 5, 7]);
      expect(result).toEqual([mockQuestion]);
    });

    it("categoryIds 含空白时正确 trim 并过滤非数字", async () => {
      // Arrange
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue([]);

      // Act
      await controller.get(undefined, " 1 , 2 , abc ");

      // Assert：abc 被过滤（NaN），只保留 [1, 2]
      expect(getRandomSpy).toHaveBeenCalledWith(1, [1, 2]);
    });

    it("categoryIds 未传时，传给 service 的是 undefined", async () => {
      // Arrange
      const getRandomSpy = jest
        .spyOn(service, "getRandom")
        .mockResolvedValue([]);

      // Act
      await controller.get("1", undefined);

      // Assert
      expect(getRandomSpy).toHaveBeenCalledWith(1, undefined);
    });
  });
});
