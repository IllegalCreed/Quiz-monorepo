import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { UserJwtAuthGuard } from "../user-auth/guards/user-jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";
import { UserProfileService } from "./user-profile.service";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import type { UserInfo } from "../user-auth/interfaces/user-info.interface";

/**
 * 用户自服务控制器
 *
 * 路由前缀 /user（登录用户自身操作）
 * - GET  /user/history        做题历史
 * - GET  /user/preferences    偏好分类
 * - PUT  /user/preferences    更新偏好分类
 */
@Controller("user")
@Public() // 绕过全局 admin JWT 守卫，由 UserJwtAuthGuard 单独保护
@UseGuards(UserJwtAuthGuard)
export class UserProfileController {
  constructor(private readonly service: UserProfileService) {}

  /** 获取当前用户做题历史（分页） */
  @Get("history")
  getHistory(
    @Req() req: Request,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const user = req.user as UserInfo;
    return this.service.getHistory(
      user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  /** 获取当前用户偏好分类 */
  @Get("preferences")
  getPreferences(@Req() req: Request) {
    const user = req.user as UserInfo;
    return this.service.getPreferences(user.id);
  }

  /** 更新当前用户偏好分类（全量替换） */
  @Put("preferences")
  updatePreferences(@Req() req: Request, @Body() dto: UpdatePreferencesDto) {
    const user = req.user as UserInfo;
    return this.service.updatePreferences(user.id, dto.categoryIds);
  }
}
