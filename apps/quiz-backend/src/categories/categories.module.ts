import { Module } from "@nestjs/common";
import { AdminCategoriesModule } from "../admin-categories/admin-categories.module";
import { CategoriesController } from "./categories.controller";

/**
 * 公开分类模块
 * 复用 AdminCategoriesService 提供公开的分类查询接口
 */
@Module({
  imports: [AdminCategoriesModule],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
