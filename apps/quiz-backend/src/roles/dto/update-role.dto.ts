import { IsString, IsBoolean, IsArray, IsOptional } from "class-validator";

/**
 * 更新角色 DTO
 * 所有字段都是可选的
 */
export class UpdateRoleDto {
  /**
   * 角色名称
   * @example '内容管理员'
   */
  @IsOptional()
  @IsString({ message: "角色名称必须是字符串" })
  name?: string;

  /**
   * 角色描述
   * @example '负责题目和标签管理'
   */
  @IsOptional()
  @IsString({ message: "角色描述必须是字符串" })
  description?: string;

  /**
   * 是否为系统内置角色（系统角色不可删除）
   * @example false
   */
  @IsOptional()
  @IsBoolean({ message: "isSystem 必须是布尔值" })
  isSystem?: boolean;

  /**
   * 菜单权限列表
   * @example ['dashboard', 'users', 'questions']
   */
  @IsOptional()
  @IsArray({ message: "菜单权限必须是数组" })
  @IsString({ each: true, message: "菜单权限项必须是字符串" })
  menuPermissions?: string[];

  /**
   * API 权限列表
   * @example ['users:*', 'questions:*']
   */
  @IsOptional()
  @IsArray({ message: "API 权限必须是数组" })
  @IsString({ each: true, message: "API 权限项必须是字符串" })
  apiPermissions?: string[];
}
