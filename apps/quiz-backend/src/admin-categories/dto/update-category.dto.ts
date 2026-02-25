import { IsInt, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

/** 编辑分类节点 DTO */
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  /** 重新挂载到其他父节点（传 null 移到根节点） */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  parentId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort?: number;
}
