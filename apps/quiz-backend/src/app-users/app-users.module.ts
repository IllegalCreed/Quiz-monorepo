import { Module } from "@nestjs/common";
import { AppUsersService } from "./app-users.service";
import { AppUsersController } from "./app-users.controller";
import { PrismaModule } from "../prisma/prisma.module";

/**
 * 用户管理模块（管理端）
 * 提供 quiz-app 用户的 CRUD、做题历史、偏好分类查询
 */
@Module({
  imports: [PrismaModule],
  controllers: [AppUsersController],
  providers: [AppUsersService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
