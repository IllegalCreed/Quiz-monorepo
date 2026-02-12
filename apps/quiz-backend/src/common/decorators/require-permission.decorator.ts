import { SetMetadata } from "@nestjs/common";

/**
 * 权限守卫元数据键
 */
export const PERMISSION_KEY = "permission";

/**
 * 声明接口所需的权限
 * 与 PermissionGuard 配合使用
 *
 * @param permission - 权限标识，格式：'module:action' (如 'admins:list', 'roles:create')
 *
 * @example
 * ```typescript
 * @Get()
 * @RequirePermission('admins:list')
 * async findAll() {
 *   return this.adminsService.findAll();
 * }
 * ```
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
