import { IsInt, IsOptional, IsPositive } from "class-validator";
import { Type } from "class-transformer";

export class CheckAnswerDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  questionId!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  selectedOptionId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  elapsedMs?: number;
}
