import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import type { UserJwtPayload } from "./strategies/user-jwt.strategy";

/** bcrypt 加密轮数 */
const SALT_ROUNDS = 10;

/**
 * 用户认证服务
 * 处理 quiz-app 用户注册、登录
 */
@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   * @returns 包含 token 和用户信息的对象
   */
  async register(dto: RegisterUserDto) {
    // 1. 检查用户名是否已存在
    const existingByUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingByUsername) {
      throw new BadRequestException("用户名已存在");
    }

    // 2. 检查邮箱是否已存在（如果提供了邮箱）
    if (dto.email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingByEmail) {
        throw new BadRequestException("邮箱已被注册");
      }
    }

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // 4. 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        nickname: dto.nickname ?? null,
        email: dto.email ?? null,
      },
    });

    // 5. 生成 JWT
    const payload: UserJwtPayload = {
      sub: user.id,
      username: user.username,
      role: "user",
    };
    const token = this.jwtService.sign(payload);

    // 6. 返回（不含密码）
    const { password: _, ...userInfo } = user;
    return { token, user: userInfo };
  }

  /**
   * 用户登录
   * @returns 包含 token 和用户信息的对象
   */
  async login(dto: LoginUserDto) {
    // 1. 查找用户
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException("账号或密码错误");
    }

    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("账号或密码错误");
    }

    // 3. 检查账号状态
    if (user.status === "DISABLED") {
      throw new ForbiddenException("账号已被禁用");
    }

    // 4. 生成 JWT
    const payload: UserJwtPayload = {
      sub: user.id,
      username: user.username,
      role: "user",
    };
    const token = this.jwtService.sign(payload);

    // 5. 返回（不含密码）
    const { password: _, ...userInfo } = user;
    return { token, user: userInfo };
  }
}
