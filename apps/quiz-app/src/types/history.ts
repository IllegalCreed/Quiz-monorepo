/**
 * 答题历史相关类型定义
 */

/** 答题历史条目（对应后端 GET /user/history 响应 items） */
export interface HistoryItem {
  id: number;
  questionId: number;
  selectedOptionId: number;
  correct: boolean;
  elapsedMs: number | null;
  createdAt: string;
  question: {
    id: number;
    stem: string;
    type: string;
  };
}

/** 分页响应 */
export interface HistoryPage {
  total: number;
  items: HistoryItem[];
}
