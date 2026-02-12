import { Module } from "@nestjs/common";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";

/**
 * 权限模块
 * 提供系统权限查询功能
 */
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
