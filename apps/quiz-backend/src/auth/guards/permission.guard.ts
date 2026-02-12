import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../../common/decorators/require-permission.decorator";
import type { AdminInfo } from "../interfaces/admin-info.interface";

/**
 * 权限守卫
 * 检查用户是否拥有所需的 API 权限
 * 与 @RequirePermission() 装饰器配合使用
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取接口所需的权限
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有声明权限要求，直接放行
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AdminInfo;
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("未登录");
    }

    // 超级管理员（roleId = 1）跳过权限检查
    if (user.roleId === 1) {
      return true;
    }

    const apiPermissions = user.apiPermissions || [];

    // 检查是否拥有所需权限（支持通配符）
    const hasPermission = apiPermissions.some((permission) => {
      // 完全匹配
      if (permission === requiredPermission) {
        return true;
      }
      // 通配符匹配（如 'admins:*' 匹配 'admins:list'）
      if (permission.endsWith(":*")) {
        const module = permission.split(":")[0];
        return requiredPermission.startsWith(module + ":");
      }
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException("无权限访问该接口");
    }

    return true;
  }
}
