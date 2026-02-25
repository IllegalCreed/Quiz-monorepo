/**
 * 分类管理 Mock API
 * 使用内存数据模拟后端接口，供开发环境使用
 */
import type { CategoryGroupForm, CategoryGroupItem, CategoryForm } from "@/types/category";

/** 模拟延迟（ms） */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 自增 ID 计数器 */
let nextGroupId = 10;
let nextCategoryId = 100;

/** 内存中的维度与分类树数据 */
const mockGroups: CategoryGroupItem[] = [
  {
    id: 1,
    name: "技术方向",
    sort: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    categories: [
      {
        id: 1,
        name: "前端",
        sort: 0,
        children: [
          {
            id: 3,
            name: "框架",
            sort: 0,
            children: [
              { id: 5, name: "Vue", sort: 0, children: [] },
              { id: 6, name: "React", sort: 1, children: [] },
            ],
          },
          {
            id: 4,
            name: "工具链",
            sort: 1,
            children: [
              { id: 7, name: "Vite", sort: 0, children: [] },
              { id: 8, name: "Webpack", sort: 1, children: [] },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "后端",
        sort: 1,
        children: [
          { id: 9, name: "Node.js", sort: 0, children: [] },
          { id: 10, name: "NestJS", sort: 1, children: [] },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "语言",
    sort: 1,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    categories: [
      { id: 11, name: "JavaScript", sort: 0, children: [] },
      { id: 12, name: "TypeScript", sort: 1, children: [] },
    ],
  },
  {
    id: 3,
    name: "难度",
    sort: 2,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    categories: [
      { id: 13, name: "入门", sort: 0, children: [] },
      { id: 14, name: "初级", sort: 1, children: [] },
      { id: 15, name: "中级", sort: 2, children: [] },
      { id: 16, name: "高级", sort: 3, children: [] },
    ],
  },
];

/**
 * 获取所有维度列表（含完整分类树）
 */
export const getCategoryGroups = async (): Promise<CategoryGroupItem[]> => {
  await delay(300);
  return mockGroups.map((g) => ({ ...g }));
};

/**
 * 创建分类维度
 */
export const createCategoryGroup = async (form: CategoryGroupForm): Promise<CategoryGroupItem> => {
  await delay(400);
  const now = new Date().toISOString();
  const group: CategoryGroupItem = {
    id: nextGroupId++,
    name: form.name,
    sort: form.sort ?? 0,
    categories: [],
    createdAt: now,
    updatedAt: now,
  };
  mockGroups.push(group);
  return { ...group };
};

/**
 * 编辑分类维度
 */
export const updateCategoryGroup = async (
  id: number,
  form: Partial<CategoryGroupForm>,
): Promise<CategoryGroupItem> => {
  await delay(300);
  const group = mockGroups.find((g) => g.id === id);
  if (!group) throw new Error(`维度 #${id} 不存在`);
  if (form.name !== undefined) group.name = form.name;
  if (form.sort !== undefined) group.sort = form.sort;
  group.updatedAt = new Date().toISOString();
  return { ...group };
};

/**
 * 删除分类维度（要求组内无分类节点）
 */
export const deleteCategoryGroup = async (id: number): Promise<{ message: string }> => {
  await delay(400);
  const idx = mockGroups.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error(`维度 #${id} 不存在`);
  const group = mockGroups[idx]!;
  if (group.categories.length > 0) throw new Error("该维度下仍有分类节点，请先删除");
  mockGroups.splice(idx, 1);
  return { message: "维度删除成功" };
};

/**
 * 在指定维度下创建分类节点（支持 parentId）
 */
export const createCategory = async (
  groupId: number,
  form: CategoryForm,
): Promise<CategoryGroupItem> => {
  await delay(400);
  const group = mockGroups.find((g) => g.id === groupId);
  if (!group) throw new Error(`维度 #${groupId} 不存在`);

  const newNode = { id: nextCategoryId++, name: form.name, sort: form.sort ?? 0, children: [] };

  if (form.parentId == null) {
    // 根节点
    group.categories.push(newNode);
  } else {
    // 子节点：递归找父节点并插入
    const inserted = _insertChild(group.categories, form.parentId, newNode);
    if (!inserted) throw new Error(`父节点 #${form.parentId} 不存在`);
  }

  group.updatedAt = new Date().toISOString();
  return { ...group };
};

/**
 * 编辑分类节点名称/排序
 */
export const updateCategory = async (
  id: number,
  form: Partial<CategoryForm>,
): Promise<CategoryGroupItem> => {
  await delay(300);
  for (const group of mockGroups) {
    if (_updateNode(group.categories, id, form)) {
      group.updatedAt = new Date().toISOString();
      return { ...group };
    }
  }
  throw new Error(`分类节点 #${id} 不存在`);
};

/**
 * 删除分类节点
 */
export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  await delay(400);
  for (const group of mockGroups) {
    if (_deleteNode(group.categories, id)) {
      group.updatedAt = new Date().toISOString();
      return { message: "分类删除成功" };
    }
  }
  throw new Error(`分类节点 #${id} 不存在`);
};

// ────────── 私有工具函数 ──────────

import type { CategoryItem } from "@/types/category";

/** 递归在树中插入子节点 */
function _insertChild(nodes: CategoryItem[], parentId: number, newNode: CategoryItem): boolean {
  for (const node of nodes) {
    if (node.id === parentId) {
      node.children.push(newNode);
      return true;
    }
    if (_insertChild(node.children, parentId, newNode)) return true;
  }
  return false;
}

/** 递归更新节点属性 */
function _updateNode(nodes: CategoryItem[], id: number, form: Partial<CategoryForm>): boolean {
  for (const node of nodes) {
    if (node.id === id) {
      if (form.name !== undefined) node.name = form.name;
      if (form.sort !== undefined) node.sort = form.sort;
      return true;
    }
    if (_updateNode(node.children, id, form)) return true;
  }
  return false;
}

/** 递归删除节点 */
function _deleteNode(nodes: CategoryItem[], id: number): boolean {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    if (nodes[idx]!.children.length > 0) throw new Error("该分类下仍有子分类，请先删除子分类");
    nodes.splice(idx, 1);
    return true;
  }
  for (const node of nodes) {
    if (_deleteNode(node.children, id)) return true;
  }
  return false;
}
