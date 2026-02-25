import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

/** 创建分类节点 DTO */
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: "分类名称不能为空" })
  name!: string;

  /** 父节点 ID，为空则创建为根节点 */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort?: number;
}
