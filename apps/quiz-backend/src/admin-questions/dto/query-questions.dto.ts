import { IsInt, IsOptional, IsString, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * 题目列表查询参数 DTO
 */
export class QueryQuestionsDto {
  /** 按题干关键词模糊搜索 */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** 按标签过滤 */
  @IsOptional()
  @IsString()
  tag?: string;

  /** 页码（默认 1） */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  /** 每页条数（默认 20，最大 100） */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}
