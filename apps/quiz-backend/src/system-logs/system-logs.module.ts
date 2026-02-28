import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemLogsService } from "./system-logs.service";
import { SystemLogsController } from "./system-logs.controller";

/**
 * 系统日志模块
 * 导出 SystemLogsService 供 LoggingInterceptor 和 AuthService 使用
 */
@Module({
  imports: [PrismaModule],
  controllers: [SystemLogsController],
  providers: [SystemLogsService],
  exports: [SystemLogsService],
})
export class SystemLogsModule {}
