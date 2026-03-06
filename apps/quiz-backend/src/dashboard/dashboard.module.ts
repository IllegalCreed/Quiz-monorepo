/**
 * Dashboard 模块
 * 提供管理后台首页聚合统计数据
 */
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
