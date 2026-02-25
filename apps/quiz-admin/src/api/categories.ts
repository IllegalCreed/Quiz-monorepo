/**
 * 分类管理 API（真实后端）
 * 调用后端 /admin/categories 接口
 */
import { get, post, patch, del } from "@/utils/request";
import type { CategoryGroupForm, CategoryGroupItem, CategoryForm } from "@/types/category";

/**
 * 获取所有维度列表（含完整分类树）
 */
export const getCategoryGroups = async (): Promise<CategoryGroupItem[]> => {
  return get<CategoryGroupItem[]>("/admin/categories/groups");
};

/**
 * 创建分类维度
 */
export const createCategoryGroup = async (form: CategoryGroupForm): Promise<CategoryGroupItem> => {
  return post<CategoryGroupItem>("/admin/categories/groups", form);
};

/**
 * 编辑分类维度
 */
export const updateCategoryGroup = async (
  id: number,
  form: Partial<CategoryGroupForm>,
): Promise<CategoryGroupItem> => {
  return patch<CategoryGroupItem>(`/admin/categories/groups/${id}`, form);
};

/**
 * 删除分类维度（要求组内无分类节点）
 */
export const deleteCategoryGroup = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/categories/groups/${id}`);
};

/**
 * 在指定维度下创建分类节点
 */
export const createCategory = async (
  groupId: number,
  form: CategoryForm,
): Promise<CategoryGroupItem> => {
  return post<CategoryGroupItem>(`/admin/categories/groups/${groupId}/categories`, form);
};

/**
 * 编辑分类节点
 */
export const updateCategory = async (
  id: number,
  form: Partial<CategoryForm>,
): Promise<CategoryGroupItem> => {
  return patch<CategoryGroupItem>(`/admin/categories/${id}`, form);
};

/**
 * 删除分类节点（要求无子节点且无题目关联）
 */
export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/categories/${id}`);
};
