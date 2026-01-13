import { Controller, Post, Body } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';
import { CheckAnswerDto } from '../questions/dto/check-answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async submit(@Body() body: CheckAnswerDto) {
    const res = await this.questionsService.checkAnswer(body.questionId, body.selectedOptionId);
    // fetch explanation
    const q = await this.questionsService.findQuestionById(body.questionId);
    return { correct: res.correct, correctOptionId: res.correctOptionId, explanation: q?.explanation ?? null };
  }
}
