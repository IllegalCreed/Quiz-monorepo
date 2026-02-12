import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AdminInfo } from "../../auth/interfaces/admin-info.interface";

/**
 * 获取当前登录的管理员信息
 * 从 JWT Strategy 验证后注入的 request.user 中提取
 *
 * @example
 * ```typescript
 * @Get('me')
 * async getMe(@CurrentAdmin() admin: AdminInfo) {
 *   return admin;
 * }
 * ```
 */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminInfo => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminInfo }>();
    return request.user;
  },
);
