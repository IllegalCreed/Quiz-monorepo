import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { OptionDto } from "./option.dto";

/**
 * 更新题目 DTO
 * 所有字段可选，提供 options 时将替换全部已有选项（replace-all 事务）
 */
export class UpdateQuestionDto {
  /** 题干 */
  @IsOptional()
  @IsString()
  stem?: string;

  /** 题目类型 */
  @IsOptional()
  @IsString()
  type?: string;

  /** 题目整体解析 */
  @IsOptional()
  @IsString()
  explanation?: string;

  /** 标签数组 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /** 选项数组（提供时替换全部已有选项，至少 2 个） */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(2, { message: "至少需要 2 个选项" })
  options?: OptionDto[];
}
