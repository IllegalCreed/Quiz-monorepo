/**
 * 题目管理 API（真实后端）
 * 调用后端 /admin/questions 接口
 */
import { get, post, patch, del } from "@/utils/request";
import type {
  QuestionDetail,
  QuestionForm,
  QuestionItem,
  QuestionListResponse,
  QueryQuestionsParams,
} from "@/types/question";

export type {
  QuestionItem,
  QuestionDetail,
  QuestionForm,
  QuestionListResponse,
  QueryQuestionsParams,
};

/**
 * 获取题目列表（分页、搜索、标签过滤）
 */
export const getQuestions = async (
  params: QueryQuestionsParams = {},
): Promise<QuestionListResponse> => {
  // 构建查询字符串（过滤掉 undefined 值）
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const query = searchParams.toString();
  const url = query ? `/admin/questions?${query}` : "/admin/questions";
  return get<QuestionListResponse>(url);
};

/**
 * 获取题目详情（含所有选项）
 */
export const getQuestion = async (id: number): Promise<QuestionDetail> => {
  return get<QuestionDetail>(`/admin/questions/${id}`);
};

/**
 * 创建题目
 */
export const createQuestion = async (form: QuestionForm): Promise<QuestionDetail> => {
  return post<QuestionDetail>("/admin/questions", form);
};

/**
 * 更新题目（含选项替换）
 */
export const updateQuestion = async (
  id: number,
  form: Partial<QuestionForm>,
): Promise<QuestionDetail> => {
  return patch<QuestionDetail>(`/admin/questions/${id}`, form);
};

/**
 * 软删除题目
 */
export const deleteQuestion = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/questions/${id}`);
};
