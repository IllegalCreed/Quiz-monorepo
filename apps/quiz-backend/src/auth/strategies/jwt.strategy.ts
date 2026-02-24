import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * JWT Payload 结构
 */
export interface JwtPayload {
  sub: number; // 管理员 ID
  username: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

/**
 * JWT 认证策略
 * 验证 token 并提取用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  /**
   * 验证 JWT payload 并返回用户信息
   * 该方法会被 passport 自动调用，返回值会被注入到 request.user
   */
  async validate(payload: JwtPayload) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!admin) {
      throw new UnauthorizedException("管理员不存在");
    }

    if (admin.status === "DISABLED") {
      throw new UnauthorizedException("账号已被禁用");
    }

    // 返回的数据会被注入到 request.user
    return {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
      roleId: admin.roleId,
      roleName: admin.role.name,
      // 超级管理员拥有全部菜单权限，用通配符标记，与 apiPermissions 的 "*" 逻辑对称
      menuPermissions:
        admin.roleId === 1 ? ["*"] : (admin.role.menuPermissions as string[]),
      apiPermissions: admin.role.apiPermissions as string[],
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
