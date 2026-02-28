import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SystemLogsService } from "../system-logs/system-logs.service";
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
    private readonly systemLogsService: SystemLogsService,
  ) {}

  /**
   * 管理员登录
   * @param loginDto - 登录信息
   * @param ip - 请求者 IP（用于日志记录）
   * @returns 包含 token 和管理员信息的对象
   */
  async login(loginDto: LoginDto, ip?: string) {
    const { username, password } = loginDto;

    // 1. 查找管理员
    const admin = await this.prisma.admin.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!admin) {
      this._logLogin(false, username, undefined, ip, "账号或密码错误");
      throw new UnauthorizedException("账号或密码错误");
    }

    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      this._logLogin(false, username, admin.id, ip, "账号或密码错误");
      throw new UnauthorizedException("账号或密码错误");
    }

    // 3. 检查账号状态
    if (admin.status === "DISABLED") {
      this._logLogin(false, username, admin.id, ip, "账号已被禁用");
      throw new ForbiddenException("账号已被禁用");
    }

    // 4. 生成 JWT token
    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      roleId: admin.roleId,
    };
    const token = this.jwtService.sign(payload);

    // 5. 记录登录成功日志
    this._logLogin(true, admin.username, admin.id, ip);

    // 6. 返回 token 和管理员信息（包含权限）
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

  /**
   * 记录管理员登录日志（fire-and-forget，不阻塞登录流程）
   */
  private _logLogin(
    success: boolean,
    username: string,
    adminId?: number,
    ip?: string,
    error?: string,
  ): void {
    this.systemLogsService
      .create({
        type: "LOGIN",
        actorType: "ADMIN",
        actorId: adminId,
        actorName: username,
        action: "LOGIN",
        module: "auth",
        path: "/admin/auth/login",
        method: "POST",
        success,
        error,
        ip,
      })
      .catch((err: Error) => {
        console.error("AuthService: 写入登录日志失败", err.message);
      });
  }
}
