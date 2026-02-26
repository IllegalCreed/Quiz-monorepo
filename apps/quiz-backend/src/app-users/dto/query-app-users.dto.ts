import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * 用户列表查询 DTO
 */
export class QueryAppUsersDto {
  /** 按用户名/昵称关键词搜索 */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** 按状态过滤（ACTIVE / DISABLED） */
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}
