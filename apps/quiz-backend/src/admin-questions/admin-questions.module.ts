import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminQuestionsController } from "./admin-questions.controller";
import { AdminQuestionsService } from "./admin-questions.service";

/**
 * 管理员题目管理模块
 * 提供后台题目 CRUD 接口，与公开题目 API（QuestionsModule）严格分离
 */
@Module({
  imports: [PrismaModule],
  controllers: [AdminQuestionsController],
  providers: [AdminQuestionsService],
})
export class AdminQuestionsModule {}
