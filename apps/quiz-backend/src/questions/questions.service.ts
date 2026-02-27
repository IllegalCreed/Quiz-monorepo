import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class QuestionsService {
  constructor(public prisma: PrismaService) {}

  /**
   * 随机获取题目（支持分类筛选）
   * @param limit 返回题目数量
   * @param categoryIds 可选，按分类 ID 筛选（取交集：题目需关联所有指定分类中至少一个）
   */
  async getRandom(limit = 1, categoryIds?: number[]) {
    // 构建分类筛选条件（JOIN QuestionCategory）
    let categoryFilter = Prisma.empty;
    if (categoryIds && categoryIds.length > 0) {
      categoryFilter = Prisma.sql`
        AND q.id IN (
          SELECT DISTINCT qc.questionId
          FROM QuestionCategory qc
          WHERE qc.categoryId IN (${Prisma.join(categoryIds)})
        )
      `;
    }

    type QuestionRow = {
      id: number;
      stem: string;
      explanation: string | null;
      tags: string | null;
    };
    const q = await this.prisma.$queryRaw<QuestionRow[]>`
      SELECT q.id as id, q.stem as stem, q.explanation as explanation, q.tags as tags
      FROM Question q
      WHERE q.deletedAt IS NULL
      ${categoryFilter}
      ORDER BY RAND()
      LIMIT ${limit}
    `;

    // For each question get options
    type OptionPublic = {
      id: number;
      text: string;
      description: string | null;
    };
    const results: Array<{
      id: number;
      stem: string;
      explanation: string | null;
      tags: string | null;
      categoryNames: string[];
      options: OptionPublic[];
    }> = [];

    // 批量获取所有题目的分类（一次查询，避免 N+1）
    const questionIds = q.map((row) => row.id);
    const allQC =
      questionIds.length > 0
        ? await this.prisma.questionCategory.findMany({
            where: { questionId: { in: questionIds } },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  isDefault: true,
                  parent: { select: { name: true } },
                },
              },
            },
          })
        : [];

    // 按 questionId 分组，构造显示名称（通识节点拼接父名）
    const categoryMap = new Map<number, string[]>();
    for (const qc of allQC) {
      const { category } = qc;
      const displayName =
        category.isDefault && category.parent?.name
          ? `${category.parent.name}${category.name}`
          : category.name;
      const list = categoryMap.get(qc.questionId) ?? [];
      list.push(displayName);
      categoryMap.set(qc.questionId, list);
    }

    for (const row of q) {
      const options = await this.prisma.option.findMany({
        where: { questionId: row.id },
      });
      const publicOptions: OptionPublic[] = options.map((o) => ({
        id: o.id,
        text: o.text,
        description: o.description,
      }));
      results.push({
        id: row.id,
        stem: row.stem,
        explanation: row.explanation,
        tags: row.tags,
        categoryNames: categoryMap.get(row.id) ?? [],
        options: publicOptions,
      });
    }
    return results;
  }

  async checkAnswer(questionId: number, selectedOptionId: number) {
    const option = await this.prisma.option.findUnique({
      where: { id: selectedOptionId },
    });
    if (!option) {
      throw new Error("Option not found");
    }
    const correctOption = await this.prisma.option.findFirst({
      where: { questionId, isCorrect: true },
    });
    const correct = option.isCorrect;
    return { correct, correctOptionId: correctOption?.id ?? null };
  }

  async findQuestionById(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });
  }
}
