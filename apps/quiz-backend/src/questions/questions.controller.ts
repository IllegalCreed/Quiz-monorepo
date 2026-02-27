import { Controller, Get, Query } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("questions")
@Public() // 标记为公开接口，quiz-app 不需要登录认证
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  /**
   * 随机获取题目（供 quiz-app 使用）
   * 支持分类筛选：?categoryIds=1,2,3
   * 答题提交请使用 POST /answers
   */
  @Get()
  async get(
    @Query("limit") limit?: string,
    @Query("categoryIds") categoryIdsStr?: string,
  ) {
    // 将 query string 转为数字，默认取 1 道
    const l = limit ? parseInt(limit, 10) : 1;

    // 解析逗号分隔的分类 ID 列表
    const categoryIds = categoryIdsStr
      ? categoryIdsStr
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : undefined;

    const items = await this.service.getRandom(l, categoryIds);
    return items;
  }
}
