import { Test, TestingModule } from "@nestjs/testing";
import { AnswersController } from "../answers.controller";
import { QuestionsService } from "../../questions/questions.service";
import { CheckAnswerDto } from "../../questions/dto/check-answer.dto";

describe("AnswersController", () => {
  let controller: AnswersController;
  let questionsService: jest.Mocked<QuestionsService>;

  beforeEach(async () => {
    // 创建 QuestionsService 的 mock
    const mockQuestionsService = {
      checkAnswer: jest.fn(),
      findQuestionById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    }).compile();

    controller = module.get<AnswersController>(AnswersController);
    questionsService = module.get(QuestionsService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  describe("submit", () => {
    it("应该成功提交答案并返回完整结果", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      const mockCheckResult = {
        correct: true,
        correctOptionId: 10,
      };

      const mockQuestion = {
        id: 1,
        stem: "测试题目",
        type: "single_choice",
        explanation: "这是解析",
        tags: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: 10,
            questionId: 1,
            text: "选项A",
            description: "A的解析",
            isCorrect: true,
          },
          {
            id: 11,
            questionId: 1,
            text: "选项B",
            description: "B的解析",
            isCorrect: false,
          },
        ],
      };

      const checkAnswerSpy = jest
        .spyOn(questionsService, "checkAnswer")
        .mockResolvedValue(mockCheckResult);
      const findQuestionByIdSpy = jest
        .spyOn(questionsService, "findQuestionById")
        .mockResolvedValue(mockQuestion);

      // Act
      const result = await controller.submit(dto);

      // Assert
      expect(checkAnswerSpy).toHaveBeenCalledWith(1, 10);
      expect(findQuestionByIdSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        correct: true,
        correctOptionId: 10,
        explanation: "这是解析",
        options: [
          {
            id: 10,
            text: "选项A",
            description: "A的解析",
            isCorrect: true,
          },
          {
            id: 11,
            text: "选项B",
            description: "B的解析",
            isCorrect: false,
          },
        ],
      });
    });

    it("应该处理答错的情况", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 11,
      };

      questionsService.checkAnswer.mockResolvedValue({
        correct: false,
        correctOptionId: 10,
      });

      questionsService.findQuestionById.mockResolvedValue({
        id: 1,
        stem: "测试题目",
        type: "single_choice",
        explanation: "这是解析",
        tags: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: 10,
            questionId: 1,
            text: "选项A",
            description: "A的解析",
            isCorrect: true,
          },
          {
            id: 11,
            questionId: 1,
            text: "选项B",
            description: "B的解析",
            isCorrect: false,
          },
        ],
      });

      // Act
      const result = await controller.submit(dto);

      // Assert
      expect(result.correct).toBe(false);
      expect(result.correctOptionId).toBe(10);
      expect(result.options).toHaveLength(2);
    });

    it("应该处理题目不存在的情况", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 999,
        selectedOptionId: 10,
      };

      questionsService.checkAnswer.mockResolvedValue({
        correct: false,
        correctOptionId: null,
      });

      questionsService.findQuestionById.mockResolvedValue(null);

      // Act
      const result = await controller.submit(dto);

      // Assert
      expect(result).toEqual({
        correct: false,
        correctOptionId: null,
        explanation: null,
        options: [],
      });
    });

    it("应该包含所有选项的 description 字段", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      questionsService.checkAnswer.mockResolvedValue({
        correct: true,
        correctOptionId: 10,
      });

      questionsService.findQuestionById.mockResolvedValue({
        id: 1,
        stem: "测试题目",
        type: "single_choice",
        explanation: null,
        tags: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: 10,
            questionId: 1,
            text: "选项A",
            description: null, // null 的情况
            isCorrect: true,
          },
        ],
      });

      // Act
      const result = await controller.submit(dto);

      // Assert
      expect(result.options[0]).toHaveProperty("description");
      expect(result.options[0].description).toBeNull();
    });
  });
});
