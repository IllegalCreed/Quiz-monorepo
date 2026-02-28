import { Injectable } from "@nestjs/common";
import type { Prisma, LogType, ActorType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateSystemLogDto } from "./dto/create-system-log.dto";
import type { QuerySystemLogsDto } from "./dto/query-system-logs.dto";

/**
 * 系统日志服务
 * 提供日志创建和分页查询功能
 */
@Injectable()
export class SystemLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建日志记录
   * 由 LoggingInterceptor（API 变更）和 AuthService（登录）调用
   */
  async create(dto: CreateSystemLogDto) {
    return this.prisma.systemLog.create({
      data: {
        type: dto.type,
        actorType: dto.actorType,
        actorId: dto.actorId ?? null,
        actorName: dto.actorName ?? null,
        action: dto.action,
        module: dto.module,
        path: dto.path,
        method: dto.method,
        params: (dto.params as Prisma.InputJsonValue) ?? undefined,
        result: (dto.result as Prisma.InputJsonValue) ?? undefined,
        success: dto.success,
        error: dto.error ?? null,
        ip: dto.ip ?? null,
        durationMs: dto.durationMs ?? null,
      },
    });
  }

  /**
   * 分页查询日志列表
   * 支持多维度筛选：类型、操作者、模块、成功状态、日期范围
   */
  async findAll(query: QuerySystemLogsDto) {
    const {
      type,
      actorType,
      actorId,
      module,
      success,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = query;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.SystemLogWhereInput = {};

    if (type) {
      where.type = type as LogType;
    }

    if (actorType) {
      where.actorType = actorType as ActorType;
    }

    if (actorId !== undefined) {
      where.actorId = actorId;
    }

    if (module) {
      where.module = module;
    }

    // success 从字符串转布尔
    if (success === "true") {
      where.success = true;
    } else if (success === "false") {
      where.success = false;
    }

    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 事务查询：总数 + 分页数据
    const [total, items] = await this.prisma.$transaction([
      this.prisma.systemLog.count({ where }),
      this.prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { total, items };
  }
}
