import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import type { AdminInfo } from "../interfaces/admin-info.interface";

/**
 * JWT 认证守卫
 * 保护需要登录才能访问的路由
 * 支持通过 @Public() 装饰器标记公开接口
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 判断是否可以访问
   */
  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 调用父类的 canActivate（passport-jwt 验证）
    return super.canActivate(context);
  }

  /**
   * 处理认证结果
   */
  handleRequest<TUser = AdminInfo>(
    err: Error | null,
    user: TUser | false,
    info: unknown,
  ): TUser {
    // info 参数由 Passport 提供，但在此处未使用
    void info;

    if (err || !user) {
      throw err || new UnauthorizedException("未登录或登录已过期");
    }
    return user;
  }
}
