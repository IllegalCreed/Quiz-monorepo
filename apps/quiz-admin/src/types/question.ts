/**
 * 题目管理相关类型定义
 * 对应后端 Prisma Question 和 Option 模型
 */

/** 题目类型枚举 */
export type QuestionType = "single_choice";

/** 选项（含完整信息，含 isCorrect） */
export interface QuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  description: string | null;
}

/** 题目列表项（不含 options 详情，含选项计数） */
export interface QuestionItem {
  id: number;
  stem: string;
  type: QuestionType;
  explanation: string | null;
  tags: string[] | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { options: number };
}

/** 题目详情（含所有选项） */
export interface QuestionDetail extends QuestionItem {
  options: QuestionOption[];
}

/** 选项表单项 */
export interface OptionForm {
  text: string;
  isCorrect: boolean;
  description: string;
}

/** 创建/编辑题目表单 */
export interface QuestionForm {
  stem: string;
  type: QuestionType;
  explanation: string;
  tags: string[];
  options: OptionForm[];
}

/** 题目列表分页响应 */
export interface QuestionListResponse {
  total: number;
  items: QuestionItem[];
}

/** 题目列表查询参数 */
export interface QueryQuestionsParams {
  keyword?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}
