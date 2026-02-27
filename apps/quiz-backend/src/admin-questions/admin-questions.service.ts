import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateQuestionDto } from "./dto/create-question.dto";
import type { UpdateQuestionDto } from "./dto/update-question.dto";
import type { QueryQuestionsDto } from "./dto/query-questions.dto";

/** 题目列表/详情 include 配置：含选项数量、结构化分类信息（含 parent + isDefault） */
const QUESTION_INCLUDE = {
  _count: { select: { options: true } },
  questionCategories: {
    include: {
      category: {
        include: {
          group: true,
          parent: { select: { id: true, name: true } },
        },
      },
    },
  },
} as const;

/** 题目详情 include 配置：含选项明细 + 结构化分类信息（含 parent + isDefault） */
const QUESTION_DETAIL_INCLUDE = {
  options: true,
  questionCategories: {
    include: {
      category: {
        include: {
          group: true,
          parent: { select: { id: true, name: true } },
        },
      },
    },
  },
} as const;

/**
 * 管理员题目服务
 * 提供题目的完整 CRUD 功能，支持软删除
 */
@Injectable()
export class AdminQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取题目列表（分页、搜索、标签过滤、分类过滤）
   * 只返回未软删除的题目
   */
  async findAll(query: QueryQuestionsDto) {
    const { keyword, tag, categoryId, page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    // 构建 where 条件：排除已软删除
    const where = {
      deletedAt: null,
      // 关键词按题干模糊搜索
      ...(keyword ? { stem: { contains: keyword } } : {}),
      // 按结构化分类过滤（数据库层）
      ...(categoryId ? { questionCategories: { some: { categoryId } } } : {}),
    };

    // 查询题目（含选项数量统计 + 分类信息）
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        include: QUESTION_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.question.count({ where }),
    ]);

    // 应用层按自由标签过滤（MVP 方案，题目量不大时可接受）
    const filtered = tag
      ? items.filter((q) => {
          const tags = q.tags as string[] | null;
          return tags?.includes(tag) ?? false;
        })
      : items;

    const filteredTotal = tag ? filtered.length : total;

    return { total: filteredTotal, items: filtered };
  }

  /**
   * 获取单个题目详情（含所有选项 + 分类信息）
   */
  async findOne(id: number) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: QUESTION_DETAIL_INCLUDE,
    });

    if (!question) {
      throw new NotFoundException(`题目 #${id} 不存在`);
    }

    return question;
  }

  /**
   * 创建题目（含结构化分类关联）
   * 校验选项数量和正确答案唯一性，校验分类必须为叶子节点
   */
  async create(dto: CreateQuestionDto) {
    // 校验恰好有 1 个正确答案（单选题约束）
    const correctCount = dto.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException("单选题必须恰好有 1 个正确答案");
    }

    // 校验分类 ID 均为叶子节点（无子节点）
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this._assertAllLeafCategories(dto.categoryIds);
    }

    const question = await this.prisma.question.create({
      data: {
        stem: dto.stem,
        type: dto.type ?? "single_choice",
        explanation: dto.explanation,
        tags: dto.tags ?? [],
        options: {
          create: dto.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            description: o.description,
          })),
        },
      },
      include: QUESTION_DETAIL_INCLUDE,
    });

    // 批量写入结构化分类关联
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.prisma.questionCategory.createMany({
        data: dto.categoryIds.map((categoryId) => ({
          questionId: question.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOne(question.id);
  }

  /**
   * 更新题目（含结构化分类关联替换）
   * 若提供 options，则替换全部已有选项（replace-all 事务）
   * 若提供 categoryIds，则替换全部已有分类关联
   */
  async update(id: number, dto: UpdateQuestionDto) {
    // 确认题目存在且未删除
    await this.findOne(id);

    // 若提供了 options，校验正确答案唯一性
    if (dto.options !== undefined) {
      const correctCount = dto.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException("单选题必须恰好有 1 个正确答案");
      }
    }

    // 更新分类关联（先删全部，再批量创建）
    if (dto.categoryIds !== undefined) {
      // 校验分类 ID 均为叶子节点
      if (dto.categoryIds.length > 0) {
        await this._assertAllLeafCategories(dto.categoryIds);
      }
      await this.prisma.questionCategory.deleteMany({
        where: { questionId: id },
      });
      if (dto.categoryIds.length > 0) {
        await this.prisma.questionCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            questionId: id,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }
    }

    // 事务：替换选项 + 更新题目信息
    if (dto.options !== undefined) {
      await this.prisma.$transaction([
        // 先删除旧选项
        this.prisma.option.deleteMany({ where: { questionId: id } }),
        // 更新题目并创建新选项
        this.prisma.question.update({
          where: { id },
          data: {
            ...(dto.stem !== undefined ? { stem: dto.stem } : {}),
            ...(dto.type !== undefined ? { type: dto.type } : {}),
            ...(dto.explanation !== undefined
              ? { explanation: dto.explanation }
              : {}),
            ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
            options: {
              create: dto.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                description: o.description,
              })),
            },
          },
        }),
      ]);
    } else {
      // 仅更新题目基本信息（不涉及选项）
      await this.prisma.question.update({
        where: { id },
        data: {
          ...(dto.stem !== undefined ? { stem: dto.stem } : {}),
          ...(dto.type !== undefined ? { type: dto.type } : {}),
          ...(dto.explanation !== undefined
            ? { explanation: dto.explanation }
            : {}),
          ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        },
      });
    }

    return this.findOne(id);
  }

  /**
   * 软删除题目（设置 deletedAt 时间戳）
   */
  async remove(id: number) {
    // 确认题目存在且未删除
    await this.findOne(id);

    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "题目删除成功" };
  }

  // ────────── 私有工具方法 ──────────

  /**
   * 校验分类 ID 均为叶子节点（没有子节点的分类才可关联题目）
   */
  private async _assertAllLeafCategories(categoryIds: number[]) {
    // 查找有子节点的分类（即非叶子节点）
    const nonLeaf = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        children: { some: {} },
      },
      select: { id: true, name: true },
    });

    if (nonLeaf.length > 0) {
      const names = nonLeaf.map((c) => `"${c.name}"(#${c.id})`).join("、");
      throw new BadRequestException(
        `以下分类不是叶子节点，不可关联题目：${names}`,
      );
    }
  }
}
