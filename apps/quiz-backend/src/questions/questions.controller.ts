import { Controller, Get, Query } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("questions")
@Public() // 标记为公开接口，quiz-app 不需要登录认证
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  /**
   * 随机获取题目（供 quiz-app 使用）
   * 答题提交请使用 POST /answers
   */
  @Get()
  async get(@Query("limit") limit?: string) {
    // 将 query string 转为数字，默认取 1 道
    const l = limit ? parseInt(limit, 10) : 1;
    const items = await this.service.getRandom(l);
    return items;
  }
}
