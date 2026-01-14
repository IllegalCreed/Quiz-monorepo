import { QuestionsService } from "../questions.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("QuestionsService (unit)", () => {
  it("checkAnswer should return correct boolean for mocked option", async () => {
    // Mock PrismaService
    const mockPrisma: any = {
      option: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, isCorrect: true }),
        findFirst: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    const svc = new QuestionsService(mockPrisma as any);
    const res = await svc.checkAnswer(1, 1);
    expect(res.correct).toBe(true);
    expect(res.correctOptionId).toBe(1);
  });
});
