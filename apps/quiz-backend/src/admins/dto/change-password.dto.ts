import { IsString, IsNotEmpty, MinLength } from "class-validator";

/**
 * 修改密码 DTO
 */
export class ChangePasswordDto {
  /** 当前密码 */
  @IsString()
  @IsNotEmpty({ message: "当前密码不能为空" })
  currentPassword!: string;

  /** 新密码（至少 6 位） */
  @IsString()
  @IsNotEmpty({ message: "新密码不能为空" })
  @MinLength(6, { message: "新密码至少 6 位" })
  newPassword!: string;
}
