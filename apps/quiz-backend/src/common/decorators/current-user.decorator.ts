import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UserInfo } from "../../user-auth/interfaces/user-info.interface";

/**
 * 获取当前登录的 quiz-app 用户信息
 * 从 UserJwtStrategy 验证后注入的 request.user 中提取
 *
 * @example
 * ```typescript
 * @Get('info')
 * @UseGuards(UserJwtAuthGuard)
 * async getInfo(@CurrentUser() user: UserInfo) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest<{ user: UserInfo }>();
    return request.user;
  },
);
