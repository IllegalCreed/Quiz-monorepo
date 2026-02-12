import { IsInt, IsPositive } from "class-validator";

/**
 * 更新管理员角色 DTO
 */
export class UpdateAdminRoleDto {
  /**
   * 新的角色 ID
   * @example 3
   */
  @IsInt({ message: "角色 ID 必须是整数" })
  @IsPositive({ message: "角色 ID 必须是正整数" })
  roleId!: number;
}
