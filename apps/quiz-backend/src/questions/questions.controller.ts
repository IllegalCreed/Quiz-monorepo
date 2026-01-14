import { Controller, Get, Query, Post, Body } from "@nestjs/common";
import { QuestionsService } from "./questions.service";

@Controller("questions")
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get()
  async get(@Query("limit") limit?: string) {
    const l = limit ? parseInt(limit, 10) : 1;
    const items = await this.service.getRandom(l);
    return items;
  }

  @Post("check")
  async check(
    @Body()
    body: {
      questionId: number;
      selectedOptionId: number;
      elapsedMs?: number;
    },
  ) {
    const res = await this.service.checkAnswer(
      body.questionId,
      body.selectedOptionId,
    );
    // Optionally include explanation (not used currently)
    return { ...res };
  }
}
