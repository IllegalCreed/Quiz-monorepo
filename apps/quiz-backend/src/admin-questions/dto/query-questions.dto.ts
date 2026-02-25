import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * 题目列表查询参数 DTO
 */
export class QueryQuestionsDto {
  /** 按题干关键词模糊搜索 */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** 按自由辅助标签过滤 */
  @IsOptional()
  @IsString()
  tag?: string;

  /** 按结构化分类 ID 过滤 */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId?: number;

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
