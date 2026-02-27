import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { UserProfileController } from "./user-profile.controller";
import { UserProfileService } from "./user-profile.service";

/**
 * 用户自服务模块
 * 提供登录用户自身的做题历史和偏好分类管理
 */
@Module({
  imports: [PrismaModule, UserAuthModule],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule {}
