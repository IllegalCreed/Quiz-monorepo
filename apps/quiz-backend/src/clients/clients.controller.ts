import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Sse,
  UseGuards,
  type MessageEvent,
} from "@nestjs/common";
import type { Request } from "express";
import { Observable, Subject } from "rxjs";
import { Public } from "../common/decorators/public.decorator";
import { RequirePermission } from "../common/decorators/require-permission.decorator";
import { SkipTransform } from "../common/decorators/skip-transform.decorator";
import { OptionalUserJwtGuard } from "../user-auth/guards/optional-user-jwt.guard";
import { ClientsService } from "./clients.service";
import { HeartbeatDto } from "./dto/heartbeat.dto";
import { BroadcastDto } from "./dto/broadcast.dto";
import type { UserInfo } from "../user-auth/interfaces/user-info.interface";

/**
 * 客户端管理控制器
 *
 * 包含两类端点：
 * 1. 公开端点（quiz-app 使用）：SSE 事件流 + 心跳
 * 2. 管理端点（quiz-admin 使用）：在线客户端列表 + 广播
 */
@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * SSE 事件流端点
   * quiz-app 连接此端点接收服务端推送（广播刷新、公告通知等）
   *
   * @param clientId - 客户端唯一标识（sessionStorage 生成）
   */
  @Sse("clients/stream")
  @Public()
  @SkipTransform()
  stream(
    @Query("clientId") clientId: string,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    // 注册客户端连接
    this.clientsService.register(clientId, subject, req.ip ?? "unknown");

    // SSE 连接关闭时清理
    req.on("close", () => {
      this.clientsService.unregister(clientId);
    });

    return subject.asObservable();
  }

  /**
   * 客户端心跳
   * quiz-app 在路由变更、登录/退出时调用，更新客户端状态
   *
   * @Public + OptionalUserJwtGuard：尝试从 JWT 提取用户信息（游客无 token 也可调用）
   */
  @Post("clients/heartbeat")
  @Public()
  @UseGuards(OptionalUserJwtGuard)
  heartbeat(@Body() dto: HeartbeatDto, @Req() req: Request) {
    const user = req.user as UserInfo | null;

    this.clientsService.updateHeartbeat(dto.clientId, {
      currentPage: dto.currentPage,
      userId: user?.id ?? null,
      username: user?.username ?? user?.nickname ?? null,
    });

    return { ok: true };
  }

  /**
   * 获取在线客户端列表（管理端）
   */
  @Get("admin/clients")
  @RequirePermission("clients:list")
  findAll() {
    return {
      stats: this.clientsService.getStats(),
      clients: this.clientsService.getAll(),
    };
  }

  /**
   * 向所有在线客户端广播事件（管理端）
   */
  @Post("admin/clients/broadcast")
  @RequirePermission("clients:broadcast")
  broadcast(@Body() dto: BroadcastDto) {
    return this.clientsService.broadcast(dto.type, {
      message: dto.message,
    });
  }
}
