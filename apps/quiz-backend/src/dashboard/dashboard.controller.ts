/**
 * Dashboard 控制器
 * 管理后台首页聚合数据接口（无需 @RequirePermission，所有管理员可见）
 */
import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取首页聚合统计数据
   * 包含：概览计数、近7天趋势、分类分布、最近日志
   */
  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
