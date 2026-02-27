/**
 * 题目相关 API
 *
 * 使用统一请求封装，自动注入 token（答案提交时后端可识别用户身份）
 */
import { get, post } from "@/utils/request";
import type { Question, AnswerResult } from "@/types/question";

export type { Option, Question, AnswerResult } from "@/types/question";

/**
 * 获取随机题目
 *
 * @param limit - 获取数量（默认 1）
 * @param categoryIds - 可选分类 ID 筛选
 */
export function fetchQuestions(limit = 1, categoryIds?: number[]): Promise<Question[]> {
  let url = `/questions?limit=${limit}`;
  if (categoryIds?.length) {
    url += `&categoryIds=${categoryIds.join(",")}`;
  }
  return get<Question[]>(url);
}

/**
 * 提交答案
 *
 * @param questionId - 题目 ID
 * @param selectedOptionId - 选中的选项 ID
 * @param elapsedMs - 答题耗时（毫秒）
 */
export function submitAnswer(
  questionId: number,
  selectedOptionId: number,
  elapsedMs?: number,
): Promise<AnswerResult> {
  return post<AnswerResult>("/answers", {
    questionId,
    selectedOptionId,
    elapsedMs,
  });
}
