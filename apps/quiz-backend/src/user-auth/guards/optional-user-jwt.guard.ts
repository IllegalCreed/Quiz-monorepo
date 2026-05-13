import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * 可选用户 JWT 认证守卫
 * 尝试解析 user JWT，但不强制要求登录
 * 认证失败时 request.user 为 null（不抛异常）
 * 用于答题接口：已登录用户记录答题历史，游客正常答题但不记录
 */
@Injectable()
export class OptionalUserJwtGuard extends AuthGuard("user-jwt") {
  /** 始终允许通过，只是尝试认证 */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /** 认证失败时返回 null 而非抛异常 */
  handleRequest<TUser>(_err: Error | null, user: TUser | false): TUser | null {
    if (!user) return null;
    return user;
  }
}
