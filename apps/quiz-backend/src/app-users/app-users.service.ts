import { Injectable, NotFoundException } from "@nestjs/common";
import type { UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { QueryAppUsersDto } from "./dto/query-app-users.dto";

/** 用户查询通用 select（排除密码） */
const USER_SELECT = {
  id: true,
  username: true,
  nickname: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * 用户管理服务（管理端）
 * 提供用户 CRUD、做题历史、偏好分类查询
 */
@Injectable()
export class AppUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 分页查询用户列表 */
  async findAll(query: QueryAppUsersDto) {
    const { keyword, status, page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(keyword
        ? {
            OR: [
              { username: { contains: keyword } },
              { nickname: { contains: keyword } },
            ],
          }
        : {}),
      ...(status ? { status: status as UserStatus } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          ...USER_SELECT,
          _count: { select: { answerAttempts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { total, items };
  }

  /** 用户详情（不含密码） */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SELECT,
        _count: { select: { answerAttempts: true, preferences: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    return user;
  }

  /** 做题历史（分页） */
  async getHistory(id: number, page = 1, pageSize = 20) {
    // 确认用户存在
    await this.findOne(id);
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.answerAttempt.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          question: {
            select: { id: true, stem: true, type: true },
          },
        },
      }),
      this.prisma.answerAttempt.count({ where: { userId: id } }),
    ]);

    return { total, items };
  }

  /** 用户偏好分类（按维度分组） */
  async getPreferences(id: number) {
    // 确认用户存在
    await this.findOne(id);

    return this.prisma.userPreference.findMany({
      where: { userId: id },
      include: {
        category: {
          include: { group: true },
        },
      },
    });
  }

  /** 切换用户状态 */
  async updateStatus(id: number, status: string) {
    // 确认用户存在
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
      select: USER_SELECT,
    });
  }

  /** 删除用户（UserPreference 级联删除，AnswerAttempt.userId 设为 null） */
  async remove(id: number) {
    // 确认用户存在
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });
    return { message: "用户删除成功" };
  }
}
