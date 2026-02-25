import type { Question, AnswerResult } from "@/types/question";
export type { Option, Question, AnswerResult } from "@/types/question";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:10020/api";

/** 后端统一响应格式 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function fetchQuestions(limit = 1): Promise<Question[]> {
  const res = await fetch(`${BASE}/questions?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  const json: ApiResponse<Question[]> = await res.json();
  return json.data; // 返回 data 字段中的数组
}

export async function submitAnswer(
  questionId: number,
  selectedOptionId: number,
  elapsedMs?: number,
): Promise<AnswerResult> {
  const res = await fetch(`${BASE}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, selectedOptionId, elapsedMs }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  const json: ApiResponse<AnswerResult> = await res.json();
  return json.data; // 返回 data 字段中的结果
}
