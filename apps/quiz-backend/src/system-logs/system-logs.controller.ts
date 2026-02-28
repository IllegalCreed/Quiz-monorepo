import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RequirePermission } from "../common/decorators/require-permission.decorator";
import { SystemLogsService } from "./system-logs.service";
import { QuerySystemLogsDto } from "./dto/query-system-logs.dto";

/**
 * 系统日志控制器
 * 提供管理后台日志查询接口
 */
@Controller("admin/system-logs")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  /**
   * 获取系统日志列表（分页 + 筛选）
   */
  @Get()
  @RequirePermission("system:logs")
  findAll(@Query() query: QuerySystemLogsDto) {
    return this.systemLogsService.findAll(query);
  }
}
