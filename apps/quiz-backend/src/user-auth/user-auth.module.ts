import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserAuthService } from "./user-auth.service";
import { UserAuthController } from "./user-auth.controller";
import { UserJwtStrategy } from "./strategies/user-jwt.strategy";
import { UserJwtAuthGuard } from "./guards/user-jwt-auth.guard";
import { OptionalUserJwtGuard } from "./guards/optional-user-jwt.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemLogsModule } from "../system-logs/system-logs.module";

/**
 * 用户认证模块
 * 提供 quiz-app 用户注册、登录、JWT 认证
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    SystemLogsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: {
        expiresIn: "7d",
      },
    }),
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    UserJwtStrategy,
    UserJwtAuthGuard,
    OptionalUserJwtGuard,
  ],
  exports: [UserAuthService, UserJwtAuthGuard, OptionalUserJwtGuard],
})
export class UserAuthModule {}
