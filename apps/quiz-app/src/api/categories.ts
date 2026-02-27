/**
 * 分类相关 API
 *
 * 公开接口，无需登录即可获取分类树
 */
import { get } from "@/utils/request";
import type { RawCategoryGroup } from "@/types/category";

/**
 * 获取公开分类树（所有维度 + 分类层级）
 *
 * 返回后端原始格式（name 字段），需要在 composable 中转换为 label
 */
export function fetchCategoryGroups(): Promise<RawCategoryGroup[]> {
  return get<RawCategoryGroup[]>("/categories/groups");
}
