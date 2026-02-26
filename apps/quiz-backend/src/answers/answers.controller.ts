import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import { QuestionsService } from "../questions/questions.service";
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
  async submit(@Body() body: CheckAnswerDto, @Req() req: Request) {
    const res = await this.questionsService.checkAnswer(
      body.questionId,
      body.selectedOptionId,
    );
    // 获取完整题目信息（包含选项解析）
    const q = await this.questionsService.findQuestionById(body.questionId);

    // 已登录用户：持久化答题记录
    const user = req.user as UserInfo | null;
    if (user?.id) {
      await this.prisma.answerAttempt.create({
        data: {
          questionId: body.questionId,
          selectedOption: body.selectedOptionId,
          correct: res.correct,
          elapsedMs: body.elapsedMs ?? null,
          userId: user.id,
        },
      });
    }

    return {
      correct: res.correct,
      correctOptionId: res.correctOptionId,
      explanation: q?.explanation ?? null,
      // 返回所有选项（包含 description 解析），供前端答题后展示
      options:
        q?.options.map((o) => ({
          id: o.id,
          text: o.text,
          description: o.description,
          isCorrect: o.isCorrect,
        })) ?? [],
    };
  }
}
