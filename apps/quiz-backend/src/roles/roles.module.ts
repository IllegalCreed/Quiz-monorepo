import { Module } from "@nestjs/common";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { PrismaModule } from "../prisma/prisma.module";

/**
 * 角色模块
 * 提供角色管理功能
 */
@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
