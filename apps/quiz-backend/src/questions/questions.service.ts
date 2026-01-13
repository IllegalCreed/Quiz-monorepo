import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(public prisma: PrismaService) {}

  async getRandom(limit = 1) {
    // Simple implementation: fetch random questions using ORDER BY RAND()
    const q: any = await this.prisma.$queryRaw`
      SELECT q.id as id, q.stem as stem, q.explanation as explanation, q.tags as tags
      FROM Question q
      ORDER BY RAND()
      LIMIT ${limit}
    `;

    // For each question get options
    const results = [] as any[];
    for (const row of q) {
      const options = await this.prisma.option.findMany({ where: { questionId: row.id } });
      const publicOptions = options.map((o) => ({ id: o.id, text: o.text }));
      results.push({ id: row.id, stem: row.stem, explanation: row.explanation, tags: row.tags, options: publicOptions });
    }
    return results;
  }

  async checkAnswer(questionId: number, selectedOptionId: number) {
    const option = await this.prisma.option.findUnique({ where: { id: selectedOptionId } });
    if (!option) {
      throw new Error('Option not found');
    }
    const correctOption = await this.prisma.option.findFirst({ where: { questionId, isCorrect: true } });
    const correct = option.isCorrect;
    return { correct, correctOptionId: correctOption?.id ?? null };
  }

  async findQuestionById(id: number) {
    return this.prisma.question.findUnique({ where: { id }, include: { options: true } });
  }
}
