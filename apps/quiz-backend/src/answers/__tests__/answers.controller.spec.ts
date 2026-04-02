import { Test, TestingModule } from "@nestjs/testing";
import { AnswersController } from "../answers.controller";
import { QuestionsService } from "../../questions/questions.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CheckAnswerDto } from "../../questions/dto/check-answer.dto";

describe("AnswersController", () => {
  let controller: AnswersController;
  let questionsService: jest.Mocked<QuestionsService>;
  let prisma: PrismaService;

  beforeEach(async () => {
    // 创建 QuestionsService 的 mock
    const mockQuestionsService = {
      evaluateAnswer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        {
          provide: PrismaService,
          useValue: {
            answerAttempt: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AnswersController>(AnswersController);
    questionsService = module.get(QuestionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("应该被定义", () => {
    expect(controller).toBeDefined();
  });

  /** 创建 mock Request 对象 */
  function createMockReq(user?: { id: number }) {
    return { user: user ?? null, headers: {} } as any;
  }

  describe("submit", () => {
    it("应该成功提交答案并返回完整结果", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      const mockResult = {
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
      };

      const evaluateAnswerSpy = jest
        .spyOn(questionsService, "evaluateAnswer")
        .mockResolvedValue(mockResult);

      // Act
      const result = await controller.submit(dto, createMockReq());

      // Assert
      expect(evaluateAnswerSpy).toHaveBeenCalledWith(1, 10);
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

      questionsService.evaluateAnswer.mockResolvedValue({
        correct: false,
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

      // Act
      const result = await controller.submit(dto, createMockReq());

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

      questionsService.evaluateAnswer.mockResolvedValue({
        correct: false,
        correctOptionId: null,
        explanation: null,
        options: [],
      });

      // Act
      const result = await controller.submit(dto, createMockReq());

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

      questionsService.evaluateAnswer.mockResolvedValue({
        correct: true,
        correctOptionId: 10,
        explanation: null,
        options: [
          {
            id: 10,
            text: "选项A",
            description: null, // null 的情况
            isCorrect: true,
          },
        ],
      });

      // Act
      const result = await controller.submit(dto, createMockReq());

      // Assert
      expect(result.options[0]).toHaveProperty("description");
      expect(result.options[0].description).toBeNull();
    });

    it("已登录用户提交答案应持久化 AnswerAttempt", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      questionsService.evaluateAnswer.mockResolvedValue({
        correct: true,
        correctOptionId: 10,
        explanation: null,
        options: [
          {
            id: 10,
            text: "A",
            description: null,
            isCorrect: true,
          },
        ],
      });

      const createSpy = jest
        .spyOn(prisma.answerAttempt, "create")
        .mockResolvedValue({} as any);

      // Act：传入已登录用户
      await controller.submit(dto, createMockReq({ id: 1 }));

      // Assert：应该写入数据库
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          questionId: 1,
          selectedOption: 10,
          correct: true,
          elapsedMs: null,
          userId: 1,
        },
      });
    });

    it("游客提交答案不应持久化 AnswerAttempt", async () => {
      // Arrange
      const dto: CheckAnswerDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      questionsService.evaluateAnswer.mockResolvedValue({
        correct: true,
        correctOptionId: 10,
        explanation: null,
        options: [
          {
            id: 10,
            text: "A",
            description: null,
            isCorrect: true,
          },
        ],
      });

      const createSpy = jest.spyOn(prisma.answerAttempt, "create");

      // Act：游客（无 user）
      await controller.submit(dto, createMockReq());

      // Assert：不应写入数据库
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
