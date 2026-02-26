import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { AppUsersService } from "./app-users.service";
import { QueryAppUsersDto } from "./dto/query-app-users.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";

/**
 * 用户管理控制器（管理端）
 * 需要 admin JWT + 对应权限
 */
@Controller("admin/app-users")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AppUsersController {
  constructor(private readonly appUsersService: AppUsersService) {}

  /** 用户列表（分页+搜索） */
  @Get()
  @RequirePermission("users:list")
  findAll(@Query() query: QueryAppUsersDto) {
    return this.appUsersService.findAll(query);
  }

  /** 用户详情 */
  @Get(":id")
  @RequirePermission("users:list")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.appUsersService.findOne(id);
  }

  /** 做题历史（分页） */
  @Get(":id/history")
  @RequirePermission("users:list")
  getHistory(
    @Param("id", ParseIntPipe) id: number,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("pageSize", new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.appUsersService.getHistory(id, page ?? 1, pageSize ?? 20);
  }

  /** 偏好分类 */
  @Get(":id/preferences")
  @RequirePermission("users:list")
  getPreferences(@Param("id", ParseIntPipe) id: number) {
    return this.appUsersService.getPreferences(id);
  }

  /** 启用/禁用 */
  @Patch(":id/status")
  @RequirePermission("users:status")
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.appUsersService.updateStatus(id, dto.status);
  }

  /** 删除用户 */
  @Delete(":id")
  @RequirePermission("users:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.appUsersService.remove(id);
  }
}
