import { Module } from "@nestjs/common";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { UserAuthModule } from "../user-auth/user-auth.module";

/**
 * 客户端管理模块
 * 提供 SSE 实时连接 + HTTP 心跳 + 管理端在线监控与广播
 *
 * 导入 UserAuthModule 以使用 OptionalUserJwtGuard（心跳端点提取用户信息）
 */
@Module({
  imports: [UserAuthModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
