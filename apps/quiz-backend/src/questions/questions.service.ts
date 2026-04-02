import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

type PublicOption = {
  id: number;
  text: string;
  description: string | null;
};

export type AnswerEvaluationResult = {
  correct: boolean;
  correctOptionId: number | null;
  explanation: string | null;
  options: Array<
    PublicOption & {
      isCorrect: boolean;
    }
  >;
};

type RandomQuestionRow = {
  id: number;
  stem: string;
  explanation: string | null;
  tags: Prisma.JsonValue | null;
};

type QuestionCategoryRow = {
  questionId: number;
  categoryId: number;
  categoryName: string;
  categoryIsDefault: boolean;
  parentCategoryName: string | null;
};

type QuestionOptionRow = {
  questionId: number;
  id: number;
  text: string;
  description: string | null;
};

type AnswerOptionRow = {
  questionId: number;
  explanation: string | null;
  optionId: number | null;
  optionText: string | null;
  optionDescription: string | null;
  optionIsCorrect: boolean | null;
};

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

    const questions = await this.prisma.$queryRaw<RandomQuestionRow[]>`
      SELECT q.id as id, q.stem as stem, q.explanation as explanation, q.tags as tags
      FROM Question q
      WHERE q.deletedAt IS NULL
      ${categoryFilter}
      ORDER BY RAND()
      LIMIT ${limit}
    `;

    if (questions.length === 0) {
      return [];
    }

    // 批量获取分类和选项，避免 relation include 带来的多次往返
    const questionIds = questions.map((row) => row.id);
    const [categoryRows, optionRows] = await Promise.all([
      this.prisma.$queryRaw<QuestionCategoryRow[]>`
        SELECT
          qc.questionId as questionId,
          qc.categoryId as categoryId,
          c.name as categoryName,
          c.isDefault as categoryIsDefault,
          p.name as parentCategoryName
        FROM QuestionCategory qc
        INNER JOIN Category c ON c.id = qc.categoryId
        LEFT JOIN Category p ON p.id = c.parentId
        WHERE qc.questionId IN (${Prisma.join(questionIds)})
        ORDER BY qc.questionId ASC, qc.categoryId ASC
      `,
      this.prisma.$queryRaw<QuestionOptionRow[]>`
        SELECT
          o.questionId as questionId,
          o.id as id,
          o.text as text,
          o.description as description
        FROM \`Option\` o
        WHERE o.questionId IN (${Prisma.join(questionIds)})
        ORDER BY o.questionId ASC, o.id ASC
      `,
    ]);

    // 按 questionId 分组，构造显示名称（通识节点拼接父名）
    const categoryMap = new Map<number, string[]>();
    for (const row of categoryRows) {
      const displayName =
        row.categoryIsDefault && row.parentCategoryName
          ? `${row.parentCategoryName}${row.categoryName}`
          : row.categoryName;
      const list = categoryMap.get(row.questionId) ?? [];
      list.push(displayName);
      categoryMap.set(row.questionId, list);
    }

    const optionMap = new Map<number, PublicOption[]>();
    for (const row of optionRows) {
      const list = optionMap.get(row.questionId) ?? [];
      list.push({
        id: row.id,
        text: row.text,
        description: row.description,
      });
      optionMap.set(row.questionId, list);
    }

    return questions.map((row) => ({
      id: row.id,
      stem: row.stem,
      explanation: row.explanation,
      tags: row.tags,
      categoryNames: categoryMap.get(row.id) ?? [],
      options: optionMap.get(row.id) ?? [],
    }));
  }

  async evaluateAnswer(
    questionId: number,
    selectedOptionId: number,
  ): Promise<AnswerEvaluationResult> {
    const rows = await this.prisma.$queryRaw<AnswerOptionRow[]>`
      SELECT
        q.id as questionId,
        q.explanation as explanation,
        o.id as optionId,
        o.text as optionText,
        o.description as optionDescription,
        o.isCorrect as optionIsCorrect
      FROM Question q
      LEFT JOIN \`Option\` o ON o.questionId = q.id
      WHERE q.id = ${questionId}
      ORDER BY o.id ASC
    `;

    if (rows.length === 0) {
      return {
        correct: false,
        correctOptionId: null,
        explanation: null,
        options: [],
      };
    }

    const explanation = rows[0].explanation;
    const options = rows
      .filter((row) => row.optionId !== null)
      .map((row) => ({
        id: row.optionId!,
        text: row.optionText!,
        description: row.optionDescription,
        isCorrect: row.optionIsCorrect ?? false,
      }));

    const selectedOption = options.find(
      (option) => option.id === selectedOptionId,
    );
    if (!selectedOption) {
      throw new Error("Option not found");
    }

    const correctOption = options.find((option) => option.isCorrect);

    return {
      correct: selectedOption.isCorrect,
      correctOptionId: correctOption?.id ?? null,
      explanation,
      options,
    };
  }

  async checkAnswer(questionId: number, selectedOptionId: number) {
    const result = await this.evaluateAnswer(questionId, selectedOptionId);
    return {
      correct: result.correct,
      correctOptionId: result.correctOptionId,
    };
  }

  async findQuestionById(id: number) {
    return this.prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });
  }
}
