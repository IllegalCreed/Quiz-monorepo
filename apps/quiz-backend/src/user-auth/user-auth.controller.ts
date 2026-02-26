import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { UserAuthService } from "./user-auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { Public } from "../common/decorators/public.decorator";
import { UserJwtAuthGuard } from "./guards/user-jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { UserInfo } from "./interfaces/user-info.interface";

/**
 * 用户认证控制器
 * 处理 quiz-app 用户注册、登录、获取信息
 * 整个控制器标记 @Public() 跳过全局 admin JWT 守卫
 */
@Controller("user/auth")
@Public()
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  /** 用户注册 */
  @Post("register")
  register(@Body() dto: RegisterUserDto) {
    return this.userAuthService.register(dto);
  }

  /** 用户登录 */
  @Post("login")
  login(@Body() dto: LoginUserDto) {
    return this.userAuthService.login(dto);
  }

  /** 获取当前用户信息（需 user JWT） */
  @Get("info")
  @UseGuards(UserJwtAuthGuard)
  getInfo(@CurrentUser() user: UserInfo): UserInfo {
    return user;
  }
}
