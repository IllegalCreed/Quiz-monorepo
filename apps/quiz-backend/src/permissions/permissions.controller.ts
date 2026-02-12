import { Controller, Get, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";

/**
 * 权限控制器
 * 提供查询系统权限的接口
 */
@Controller("admin/permissions")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * 获取所有菜单权限
   * @returns 菜单权限列表
   */
  @Get("menus")
  @RequirePermission("permissions:list")
  getMenuPermissions() {
    return this.permissionsService.getMenuPermissions();
  }

  /**
   * 获取所有 API 权限
   * @returns API 权限列表
   */
  @Get("apis")
  @RequirePermission("permissions:list")
  getApiPermissions() {
    return this.permissionsService.getApiPermissions();
  }
}
