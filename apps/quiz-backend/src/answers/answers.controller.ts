import { Controller, Post, Body } from "@nestjs/common";
import { QuestionsService } from "../questions/questions.service";
import { CheckAnswerDto } from "../questions/dto/check-answer.dto";

@Controller("answers")
export class AnswersController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async submit(@Body() body: CheckAnswerDto) {
    const res = await this.questionsService.checkAnswer(
      body.questionId,
      body.selectedOptionId,
    );
    // 获取完整题目信息（包含选项解析）
    const q = await this.questionsService.findQuestionById(body.questionId);
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
