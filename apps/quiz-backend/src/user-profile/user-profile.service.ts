import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * 用户自服务模块
 * 提供当前登录用户的做题历史和偏好分类管理
 * 与 AppUsersService（管理员管理用户）分离
 */
@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取当前用户的做题历史（分页）
   */
  async getHistory(userId: number, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.answerAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          question: {
            select: { id: true, stem: true, type: true },
          },
        },
      }),
      this.prisma.answerAttempt.count({ where: { userId } }),
    ]);

    return { total, items };
  }

  /**
   * 获取当前用户的偏好分类（按维度分组返回）
   */
  async getPreferences(userId: number) {
    return this.prisma.userPreference.findMany({
      where: { userId },
      include: {
        category: {
          include: {
            group: true,
            parent: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  /**
   * 更新当前用户的偏好分类（全量替换）
   * 校验所有 categoryId 为叶子节点
   */
  async updatePreferences(userId: number, categoryIds: number[]) {
    // 校验分类 ID 均为叶子节点
    if (categoryIds.length > 0) {
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
          `以下分类不是叶子节点，不可设为偏好：${names}`,
        );
      }
    }

    // 事务：先删除旧偏好，再批量创建新偏好
    await this.prisma.$transaction([
      this.prisma.userPreference.deleteMany({ where: { userId } }),
      ...(categoryIds.length > 0
        ? [
            this.prisma.userPreference.createMany({
              data: categoryIds.map((categoryId) => ({ userId, categoryId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    // 返回更新后的偏好
    return this.getPreferences(userId);
  }
}
