import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { OptionDto } from "./option.dto";

/**
 * 创建题目 DTO
 */
export class CreateQuestionDto {
  /** 题干 */
  @IsString()
  @IsNotEmpty({ message: "题干不能为空" })
  stem!: string;

  /** 题目类型（预留扩展，默认 single_choice） */
  @IsOptional()
  @IsString()
  type?: string;

  /** 题目整体解析（可选） */
  @IsOptional()
  @IsString()
  explanation?: string;

  /** 标签数组（可选） */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /** 选项数组，至少 2 个 */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(2, { message: "至少需要 2 个选项" })
  options!: OptionDto[];
}
