import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentAdmin } from "../common/decorators/current-admin.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AdminInfo } from "./interfaces/admin-info.interface";

/**
 * 认证控制器
 * 处理登录、获取用户信息、登出等认证相关接口
 */
@Controller("admin/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 管理员登录
   * @param loginDto - 登录信息
   * @param req - 请求对象（提取 IP 用于日志记录）
   * @returns 包含 token 和管理员信息的对象
   */
  @Post("login")
  @Public()
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req.ip);
  }

  /**
   * 获取当前登录管理员信息
   * 需要 JWT 认证
   * @param admin - 当前登录的管理员（由 JWT Strategy 注入）
   * @returns 管理员信息（包含权限）
   */
  @Get("info")
  @UseGuards(JwtAuthGuard)
  getInfo(@CurrentAdmin() admin: AdminInfo): AdminInfo {
    // JWT Strategy 已经返回完整的用户信息，直接返回即可
    return admin;
  }

  /**
   * 登出
   * JWT 是无状态的，实际登出由客户端删除 token 完成
   * 这里仅作为占位接口
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout() {
    return { message: "登出成功" };
  }
}
