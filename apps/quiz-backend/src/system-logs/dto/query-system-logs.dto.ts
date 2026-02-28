import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * 系统日志查询 DTO
 * 支持按类型、操作者、模块、状态、日期范围筛选
 */
export class QuerySystemLogsDto {
  /** 日志类型：LOGIN / API_MUTATION */
  @IsOptional()
  @IsString()
  type?: string;

  /** 操作者类型：ADMIN / USER */
  @IsOptional()
  @IsString()
  actorType?: string;

  /** 操作者 ID */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  actorId?: number;

  /** 业务模块名称 */
  @IsOptional()
  @IsString()
  module?: string;

  /** 操作是否成功：传 "true" 或 "false" */
  @IsOptional()
  @IsString()
  success?: string;

  /** 开始日期（ISO 8601 格式） */
  @IsOptional()
  @IsString()
  startDate?: string;

  /** 结束日期（ISO 8601 格式） */
  @IsOptional()
  @IsString()
  endDate?: string;

  /** 页码（从 1 开始） */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  /** 每页条数 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}
