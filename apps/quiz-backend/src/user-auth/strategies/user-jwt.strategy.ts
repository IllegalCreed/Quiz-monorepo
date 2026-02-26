import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * User JWT Payload 结构
 * 与 admin JWT 通过 role 字段区分
 */
export interface UserJwtPayload {
  sub: number; // 用户 ID
  username: string;
  role: "user"; // 区分 admin JWT
  iat?: number;
  exp?: number;
}

/**
 * 用户 JWT 认证策略
 * 注册为 Passport 策略名 "user-jwt"，与 admin 的 "jwt" 互不干扰
 */
@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, "user-jwt") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  /**
   * 验证 JWT payload 并返回用户信息
   * 返回值注入到 request.user
   */
  async validate(payload: UserJwtPayload) {
    // 拒绝 admin token（没有 role: "user"）
    if (payload.role !== "user") {
      throw new UnauthorizedException("无效的用户 token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    if (user.status === "DISABLED") {
      throw new UnauthorizedException("账号已被禁用");
    }

    // 返回用户信息（不含密码）
    const { password: _, ...userInfo } = user;
    return userInfo;
  }
}
