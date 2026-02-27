/**
 * 分类管理相关类型定义
 */

/** 分类节点（树形，children 为子节点） */
export interface CategoryItem {
  id: number;
  name: string;
  sort: number;
  /** 是否为通识节点（通识节点不可编辑/删除，名称灰色斜体显示） */
  isDefault?: boolean;
  children: CategoryItem[];
}

/** 分类维度（含完整分类树） */
export interface CategoryGroupItem {
  id: number;
  name: string;
  sort: number;
  categories: CategoryItem[];
  createdAt: string;
  updatedAt: string;
}

/** 创建/编辑维度的表单数据 */
export interface CategoryGroupForm {
  name: string;
  sort?: number;
}

/** 创建/编辑分类节点的表单数据 */
export interface CategoryForm {
  name: string;
  groupId: number;
  parentId?: number | null;
  sort?: number;
}

/** 扁平化分类节点（用于题目表单选择器的选项） */
export interface CategoryFlatItem {
  id: number;
  name: string;
  groupId: number;
  parentId: number | null;
  /** 展示时的缩进深度（0 = 根节点） */
  depth: number;
  /** 带层级前缀的完整名称，如 "└─ Vue" */
  displayName: string;
}
