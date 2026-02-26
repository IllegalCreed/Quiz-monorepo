import type { UserStatus } from "@prisma/client";

/**
 * quiz-app 用户信息（不含密码）
 * UserJwtStrategy 验证后注入到 request.user
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string | null;
  email: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
