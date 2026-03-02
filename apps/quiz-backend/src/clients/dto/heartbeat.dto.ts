import { IsString, IsOptional, MaxLength } from "class-validator";

/**
 * 客户端心跳 DTO
 * quiz-app 在路由变更、登录/退出时发送
 */
export class HeartbeatDto {
  /** 客户端唯一标识（sessionStorage 生成，per-tab 唯一） */
  @IsString()
  clientId!: string;

  /** 当前页面路径 */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  currentPage?: string;
}
