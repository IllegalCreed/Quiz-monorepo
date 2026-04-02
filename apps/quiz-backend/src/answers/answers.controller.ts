import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import {
  QuestionsService,
  type AnswerEvaluationResult,
} from "../questions/questions.service";
import { CheckAnswerDto } from "../questions/dto/check-answer.dto";
import { Public } from "../common/decorators/public.decorator";
import { OptionalUserJwtGuard } from "../user-auth/guards/optional-user-jwt.guard";
import { PrismaService } from "../prisma/prisma.service";
import type { UserInfo } from "../user-auth/interfaces/user-info.interface";

@Controller("answers")
@Public() // 标记为公开接口，quiz-app 不需要 admin 登录认证
export class AnswersController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(OptionalUserJwtGuard)
  async submit(
    @Body() body: CheckAnswerDto,
    @Req() req: Request,
  ): Promise<AnswerEvaluationResult> {
    const result: AnswerEvaluationResult =
      await this.questionsService.evaluateAnswer(
        body.questionId,
        body.selectedOptionId,
      );

    // 已登录用户：持久化答题记录
    const user = req.user as UserInfo | null;
    if (user?.id) {
      await this.prisma.answerAttempt.create({
        data: {
          questionId: body.questionId,
          selectedOption: body.selectedOptionId,
          correct: result.correct,
          elapsedMs: body.elapsedMs ?? null,
          userId: user.id,
        },
      });
    }

    return result;
  }
}
