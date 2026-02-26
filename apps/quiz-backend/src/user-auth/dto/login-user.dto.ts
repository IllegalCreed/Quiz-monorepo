import { IsString, IsNotEmpty, MinLength } from "class-validator";

/**
 * 用户登录 DTO
 */
export class LoginUserDto {
  @IsString({ message: "用户名必须是字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  username!: string;

  @IsString({ message: "密码必须是字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  @MinLength(6, { message: "密码长度不能少于 6 位" })
  password!: string;
}
