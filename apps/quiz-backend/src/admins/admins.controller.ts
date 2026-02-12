import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminRoleDto } from "./dto/update-admin-role.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";

/**
 * 管理员控制器
 * 处理管理员管理相关的 HTTP 请求
 */
@Controller("admin/admins")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * 获取所有管理员
   * @returns 管理员列表
   */
  @Get()
  @RequirePermission("admins:list")
  findAll() {
    return this.adminsService.findAll();
  }

  /**
   * 根据 ID 获取管理员详情
   * @param id - 管理员 ID
   * @returns 管理员详情
   */
  @Get(":id")
  @RequirePermission("admins:list")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.adminsService.findOne(id);
  }

  /**
   * 创建管理员
   * @param createAdminDto - 管理员数据
   * @returns 新创建的管理员
   */
  @Post()
  @RequirePermission("admins:create")
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  /**
   * 更新管理员角色
   * @param id - 管理员 ID
   * @param updateAdminRoleDto - 新角色信息
   * @returns 更新后的管理员
   */
  @Patch(":id/role")
  @RequirePermission("admins:update")
  updateRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAdminRoleDto: UpdateAdminRoleDto,
  ) {
    return this.adminsService.updateRole(id, updateAdminRoleDto);
  }

  /**
   * 删除管理员
   * @param id - 管理员 ID
   * @returns 删除结果
   */
  @Delete(":id")
  @RequirePermission("admins:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.adminsService.remove(id);
  }
}
