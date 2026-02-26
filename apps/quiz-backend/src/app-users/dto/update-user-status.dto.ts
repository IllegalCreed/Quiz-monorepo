import { IsString, IsNotEmpty, IsIn } from "class-validator";

/**
 * 切换用户状态 DTO
 */
export class UpdateUserStatusDto {
  @IsString({ message: "状态必须是字符串" })
  @IsNotEmpty({ message: "状态不能为空" })
  @IsIn(["ACTIVE", "DISABLED"], { message: "状态必须是 ACTIVE 或 DISABLED" })
  status!: string;
}
