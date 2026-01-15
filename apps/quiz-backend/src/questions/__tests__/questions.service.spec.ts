import { QuestionsService } from "../questions.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("QuestionsService (unit)", () => {
  it("checkAnswer should return correct boolean for mocked option", async () => {
    // Mock PrismaService with a typed Partial and cast to PrismaService
    const mockPrisma = {
      option: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, isCorrect: true }),
        findFirst: jest.fn().mockResolvedValue({ id: 1 }),
      },
    } as unknown as PrismaService;
    const svc = new QuestionsService(mockPrisma);
    const res = await svc.checkAnswer(1, 1);
    expect(res.correct).toBe(true);
    expect(res.correctOptionId).toBe(1);
  });
});
