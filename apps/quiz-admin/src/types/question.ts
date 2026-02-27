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

/** 题目列表项里的分类关联（含分类名和维度名） */
export interface QuestionCategoryItem {
  categoryId: number;
  category: {
    id: number;
    name: string;
    /** 是否为通识节点 */
    isDefault?: boolean;
    /** 父分类信息（通识节点拼接父名时使用） */
    parent?: {
      id: number;
      name: string;
    } | null;
    group: {
      id: number;
      name: string;
    };
  };
}

/** 题目列表项（不含 options 详情，含选项计数和结构化分类） */
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
  questionCategories?: QuestionCategoryItem[];
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
  /** 结构化分类 ID 列表（多维度多选） */
  categoryIds: number[];
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
