import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import type { JwtPayload } from "./strategies/jwt.strategy";

/**
 * 认证服务
 * 处理登录、JWT 生成等认证相关逻辑
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 管理员登录
   * @param loginDto - 登录信息
   * @returns 包含 token 和管理员信息的对象
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. 查找管理员
    const admin = await this.prisma.admin.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!admin) {
      throw new UnauthorizedException("账号或密码错误");
    }

    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("账号或密码错误");
    }

    // 3. 检查账号状态
    if (admin.status === "DISABLED") {
      throw new ForbiddenException("账号已被禁用");
    }

    // 4. 生成 JWT token
    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      roleId: admin.roleId,
    };
    const token = this.jwtService.sign(payload);

    // 5. 返回 token 和管理员信息（包含权限）
    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
        roleId: admin.roleId,
        roleName: admin.role.name,
        menuPermissions: admin.role.menuPermissions as string[],
        apiPermissions: admin.role.apiPermissions as string[],
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    };
  }

  /**
   * 获取当前登录管理员信息
   * 该方法由 JWT Strategy 自动调用，返回值已注入到 request.user
   * Controller 直接返回 request.user 即可
   */
  async getInfo(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { role: true },
    });

    if (!admin) {
      throw new UnauthorizedException("管理员不存在");
    }

    if (admin.status === "DISABLED") {
      throw new ForbiddenException("账号已被禁用");
    }

    return {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      role: admin.roleId === 1 ? "super_admin" : "admin", // 兼容前端
      roleId: admin.roleId,
      roleName: admin.role.name,
      menuPermissions: admin.role.menuPermissions as string[],
      apiPermissions: admin.role.apiPermissions as string[],
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
