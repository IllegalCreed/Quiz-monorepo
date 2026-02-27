import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { AdminCategoriesService } from "../admin-categories/admin-categories.service";

/**
 * 公开分类接口（quiz-app 使用）
 * 复用 AdminCategoriesService，不需要认证
 */
@Controller("categories")
@Public()
export class CategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  /** 获取所有维度及其完整分类树（供分类筛选器使用） */
  @Get("groups")
  findAllGroups() {
    return this.categoriesService.findAllGroups();
  }
}
