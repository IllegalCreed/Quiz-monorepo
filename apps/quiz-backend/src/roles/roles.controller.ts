import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";

/**
 * 角色控制器
 * 处理角色管理相关的 HTTP 请求
 */
@Controller("admin/roles")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * 获取所有角色
   * @returns 角色列表
   */
  @Get()
  @RequirePermission("roles:list")
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * 根据 ID 获取角色详情
   * @param id - 角色 ID
   * @returns 角色详情
   */
  @Get(":id")
  @RequirePermission("roles:list")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  /**
   * 创建角色
   * @param createRoleDto - 角色数据
   * @returns 新创建的角色
   */
  @Post()
  @RequirePermission("roles:create")
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * 更新角色
   * @param id - 角色 ID
   * @param updateRoleDto - 更新数据
   * @returns 更新后的角色
   */
  @Put(":id")
  @RequirePermission("roles:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * 删除角色
   * @param id - 角色 ID
   * @returns 删除结果
   */
  @Delete(":id")
  @RequirePermission("roles:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
