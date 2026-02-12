import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsInt,
  IsPositive,
} from "class-validator";

/**
 * 创建管理员 DTO
 */
export class CreateAdminDto {
  /**
   * 用户名
   * @example 'admin01'
   */
  @IsString({ message: "用户名必须是字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  username!: string;

  /**
   * 密码
   * @example 'password123'
   */
  @IsString({ message: "密码必须是字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  @MinLength(6, { message: "密码长度不能少于 6 位" })
  password!: string;

  /**
   * 昵称
   * @example '管理员01'
   */
  @IsString({ message: "昵称必须是字符串" })
  @IsNotEmpty({ message: "昵称不能为空" })
  nickname!: string;

  /**
   * 角色 ID
   * @example 2
   */
  @IsInt({ message: "角色 ID 必须是整数" })
  @IsPositive({ message: "角色 ID 必须是正整数" })
  roleId!: number;
}
