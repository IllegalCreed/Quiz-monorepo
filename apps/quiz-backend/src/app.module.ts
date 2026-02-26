import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { QuestionsModule } from "./questions/questions.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AnswersModule } from "./answers/answers.module";
import { TestModule } from "./test/test.module";
import { AuthModule } from "./auth/auth.module";
import { AdminsModule } from "./admins/admins.module";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { AdminQuestionsModule } from "./admin-questions/admin-questions.module";
import { AdminCategoriesModule } from "./admin-categories/admin-categories.module";
import { UserAuthModule } from "./user-auth/user-auth.module";
import { AppUsersModule } from "./app-users/app-users.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { PermissionGuard } from "./auth/guards/permission.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminsModule,
    RolesModule,
    PermissionsModule,
    QuestionsModule,
    AdminQuestionsModule,
    AdminCategoriesModule,
    UserAuthModule,
    AppUsersModule,
    AnswersModule,
    TestModule,
  ],
  providers: [
    // 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局权限守卫
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局响应转换拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
