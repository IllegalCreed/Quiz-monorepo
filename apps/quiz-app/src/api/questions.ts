/** 题目选项 */
export type Option = { id: number; text: string; description?: string };

/** 题目 */
export type Question = {
  id: number;
  stem: string;
  options: Option[];
  explanation?: string;
  tags?: string[];
};

/** 提交答案后的响应（包含选项解析） */
export type AnswerResult = {
  correct: boolean;
  correctOptionId: number | null;
  explanation: string | null;
  /** 答题后返回所有选项的完整信息（含解析和正确标识） */
  options: Array<{
    id: number;
    text: string;
    description: string | null;
    isCorrect: boolean;
  }>;
};

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:10020/api";

export async function fetchQuestions(limit = 1): Promise<Question[]> {
  const res = await fetch(`${BASE}/questions?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
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
  return res.json();
}
