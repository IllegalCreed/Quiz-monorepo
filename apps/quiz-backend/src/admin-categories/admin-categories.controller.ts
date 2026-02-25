import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";
import { AdminCategoriesService } from "./admin-categories.service";
import { CreateCategoryGroupDto } from "./dto/create-category-group.dto";
import { UpdateCategoryGroupDto } from "./dto/update-category-group.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  /** 获取所有维度列表（含完整分类树） */
  @Get("groups")
  @RequirePermission("categories:list")
  findAllGroups() {
    return this.service.findAllGroups();
  }

  /** 创建分类维度 */
  @Post("groups")
  @RequirePermission("categories:create")
  createGroup(@Body() dto: CreateCategoryGroupDto) {
    return this.service.createGroup(dto);
  }

  /** 编辑分类维度 */
  @Patch("groups/:id")
  @RequirePermission("categories:update")
  updateGroup(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryGroupDto,
  ) {
    return this.service.updateGroup(id, dto);
  }

  /** 删除分类维度（要求组内无分类节点） */
  @Delete("groups/:id")
  @RequirePermission("categories:delete")
  deleteGroup(@Param("id", ParseIntPipe) id: number) {
    return this.service.deleteGroup(id);
  }

  /** 在指定维度下创建分类节点 */
  @Post("groups/:groupId/categories")
  @RequirePermission("categories:create")
  createCategory(
    @Param("groupId", ParseIntPipe) groupId: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.createCategory(groupId, dto);
  }

  /** 编辑分类节点 */
  @Patch(":id")
  @RequirePermission("categories:update")
  updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  /** 删除分类节点（要求无子节点且无题目关联） */
  @Delete(":id")
  @RequirePermission("categories:delete")
  deleteCategory(@Param("id", ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }
}
