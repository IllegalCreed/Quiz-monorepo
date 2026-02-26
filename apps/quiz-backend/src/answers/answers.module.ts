import { Module } from "@nestjs/common";
import { AnswersController } from "./answers.controller";
import { QuestionsModule } from "../questions/questions.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UserAuthModule } from "../user-auth/user-auth.module";

@Module({
  imports: [QuestionsModule, PrismaModule, UserAuthModule],
  controllers: [AnswersController],
})
export class AnswersModule {}
