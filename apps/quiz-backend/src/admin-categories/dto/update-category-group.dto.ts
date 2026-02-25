import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

/** 编辑分类维度 DTO */
export class UpdateCategoryGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort?: number;
}
