import { IsBoolean, IsOptional, IsString, IsNotEmpty } from "class-validator";

/**
 * 选项 DTO
 * 用于创建/更新题目时内嵌的选项数据
 */
export class OptionDto {
  /** 选项文本 */
  @IsString()
  @IsNotEmpty({ message: "选项文本不能为空" })
  text!: string;

  /** 是否正确答案 */
  @IsBoolean()
  isCorrect!: boolean;

  /** 选项解析（可选，答题后展示） */
  @IsOptional()
  @IsString()
  description?: string;
}
