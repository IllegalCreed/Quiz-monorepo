import { IsString, IsNotEmpty, IsBoolean, IsArray } from "class-validator";

/**
 * 创建角色 DTO
 */
export class CreateRoleDto {
  /**
   * 角色名称
   * @example '内容管理员'
   */
  @IsString({ message: "角色名称必须是字符串" })
  @IsNotEmpty({ message: "角色名称不能为空" })
  name!: string;

  /**
   * 角色描述
   * @example '负责题目和标签管理'
   */
  @IsString({ message: "角色描述必须是字符串" })
  @IsNotEmpty({ message: "角色描述不能为空" })
  description!: string;

  /**
   * 是否为系统内置角色（系统角色不可删除）
   * @example false
   */
  @IsBoolean({ message: "isSystem 必须是布尔值" })
  isSystem!: boolean;

  /**
   * 菜单权限列表
   * @example ['dashboard', 'users', 'questions']
   */
  @IsArray({ message: "菜单权限必须是数组" })
  @IsString({ each: true, message: "菜单权限项必须是字符串" })
  menuPermissions!: string[];

  /**
   * API 权限列表
   * @example ['users:*', 'questions:*']
   */
  @IsArray({ message: "API 权限必须是数组" })
  @IsString({ each: true, message: "API 权限项必须是字符串" })
  apiPermissions!: string[];
}
