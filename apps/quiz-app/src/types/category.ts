/**
 * 分类相关类型定义
 */

/** 分类树节点（适配 ColumnSelector 的 TreeNode 接口） */
export interface CategoryNode {
  id: number;
  /** 显示名称（通识节点拼接父名，如"前端通识"） */
  label: string;
  /** 是否为通识默认节点 */
  isDefault?: boolean;
  children?: CategoryNode[];
}

/** 分类维度（对应后端 CategoryGroup） */
export interface CategoryGroup {
  id: number;
  name: string;
  sort: number;
  categories: CategoryNode[];
}

/** 后端返回的原始分类节点（name 字段，需转换为 label） */
export interface RawCategoryNode {
  id: number;
  name: string;
  sort: number;
  isDefault: boolean;
  children: RawCategoryNode[];
}

/** 后端返回的原始分类维度 */
export interface RawCategoryGroup {
  id: number;
  name: string;
  sort: number;
  categories: RawCategoryNode[];
}

/** 用户偏好条目（对应后端 GET /user/preferences 响应） */
export interface UserPreference {
  userId: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    groupId: number;
    parentId: number | null;
    isDefault: boolean;
    group: { id: number; name: string };
    parent: { id: number; name: string } | null;
  };
}
