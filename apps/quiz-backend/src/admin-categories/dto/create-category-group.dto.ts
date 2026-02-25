import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

/** 创建分类维度 DTO */
export class CreateCategoryGroupDto {
  @IsString()
  @IsNotEmpty({ message: "维度名称不能为空" })
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort?: number;
}
