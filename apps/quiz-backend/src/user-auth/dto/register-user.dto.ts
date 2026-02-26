import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
} from "class-validator";

/**
 * 用户注册 DTO
 */
export class RegisterUserDto {
  @IsString({ message: "用户名必须是字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  @MinLength(3, { message: "用户名长度不能少于 3 位" })
  @MaxLength(20, { message: "用户名长度不能超过 20 位" })
  username!: string;

  @IsString({ message: "密码必须是字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  @MinLength(6, { message: "密码长度不能少于 6 位" })
  password!: string;

  @IsOptional()
  @IsString({ message: "昵称必须是字符串" })
  nickname?: string;

  @IsOptional()
  @IsEmail({}, { message: "邮箱格式不正确" })
  email?: string;
}
