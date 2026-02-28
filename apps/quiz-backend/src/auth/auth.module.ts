import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionGuard } from "./guards/permission.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemLogsModule } from "../system-logs/system-logs.module";

/**
 * 认证模块
 * 提供 JWT 认证、权限守卫等功能
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    SystemLogsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: {
        expiresIn: "7d", // 默认 7 天（使用字面量避免类型问题）
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PermissionGuard],
  exports: [AuthService, JwtAuthGuard, PermissionGuard],
})
export class AuthModule {}
