import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateQuestionDto } from "./dto/create-question.dto";
import type { UpdateQuestionDto } from "./dto/update-question.dto";
import type { QueryQuestionsDto } from "./dto/query-questions.dto";

/**
 * 管理员题目服务
 * 提供题目的完整 CRUD 功能，支持软删除
 */
@Injectable()
export class AdminQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取题目列表（分页、搜索、标签过滤）
   * 只返回未软删除的题目
   */
  async findAll(query: QueryQuestionsDto) {
    const { keyword, tag, page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    // 构建 where 条件：排除已软删除
    const where = {
      deletedAt: null,
      // 关键词按题干模糊搜索
      ...(keyword ? { stem: { contains: keyword } } : {}),
    };

    // 查询题目（含选项数量统计）
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        include: {
          _count: { select: { options: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.question.count({ where }),
    ]);

    // 应用层按标签过滤（MVP 方案，题目量不大时可接受）
    const filtered = tag
      ? items.filter((q) => {
          const tags = q.tags as string[] | null;
          return tags?.includes(tag) ?? false;
        })
      : items;

    // 标签过滤后重新计算 total（保守估计，正式场景可用 $queryRaw + JSON_CONTAINS）
    const filteredTotal = tag ? filtered.length : total;

    return { total: filteredTotal, items: filtered };
  }

  /**
   * 获取单个题目详情（含所有选项）
   */
  async findOne(id: number) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException(`题目 #${id} 不存在`);
    }

    return question;
  }

  /**
   * 创建题目
   * 校验选项数量和正确答案唯一性
   */
  async create(dto: CreateQuestionDto) {
    // 校验恰好有 1 个正确答案（单选题约束）
    const correctCount = dto.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException("单选题必须恰好有 1 个正确答案");
    }

    return this.prisma.question.create({
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
      include: { options: true },
    });
  }

  /**
   * 更新题目
   * 若提供 options，则替换全部已有选项（replace-all 事务）
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
}
