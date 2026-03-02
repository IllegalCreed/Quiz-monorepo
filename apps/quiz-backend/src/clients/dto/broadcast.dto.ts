import { IsString, IsIn, IsOptional, MaxLength } from "class-validator";

/**
 * 广播事件 DTO
 * 管理端向所有在线客户端推送消息
 */
export class BroadcastDto {
  /** 事件类型：refresh(强制刷新) / announcement(通知) */
  @IsString()
  @IsIn(["refresh", "announcement"])
  type!: "refresh" | "announcement";

  /** 消息内容（announcement 类型时使用） */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
