/**
 * 题目相关类型定义
 */

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
