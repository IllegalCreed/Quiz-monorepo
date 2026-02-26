import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * 用户 JWT 认证守卫
 * 绑定 "user-jwt" 策略，用于需要用户登录的接口
 */
@Injectable()
export class UserJwtAuthGuard extends AuthGuard("user-jwt") {
  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException("未登录或登录已过期");
    }
    return user;
  }
}
