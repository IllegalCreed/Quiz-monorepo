/**
 * useCategories — 分类数据管理 composable
 *
 * 模块级 singleton，跨组件共享：
 * - 获取并缓存分类树
 * - 后端 name → ColumnSelector label 转换（含通识节点拼接父名）
 * - 选中状态管理（登录用户同步后端，游客 localStorage）
 */
import { ref, computed } from "vue";
import { fetchCategoryGroups } from "@/api/categories";
import { fetchPreferences, updatePreferences } from "@/api/user-profile";
import type {
  CategoryGroup,
  CategoryNode,
  RawCategoryGroup,
  RawCategoryNode,
} from "@/types/category";

/** URL 查询参数中可接受的分类值 */
type CategoryQueryValue = string | Array<string | null | undefined> | null | undefined;

/** 游客偏好 localStorage key */
const GUEST_KEY = "quiz-guest-categories";

/** 原始分类维度数据 */
const groups = ref<CategoryGroup[]>([]);

/** 是否已加载 */
const loaded = ref(false);

/** 当前选中的叶子分类 ID */
const selectedIds = ref<number[]>([]);

/** 分类选择器对话框开关 */
const showSelector = ref(false);

/**
 * 将后端 RawCategoryNode（name）转换为 CategoryNode（label）
 * 通识节点拼接父名：DB 存 "通识" → 显示 "前端通识"
 */
function transformNode(node: RawCategoryNode, parentName?: string): CategoryNode {
  const label = node.isDefault && parentName ? `${parentName}通识` : node.name;
  const result: CategoryNode = {
    id: node.id,
    label,
    isDefault: node.isDefault || undefined,
  };
  if (node.children && node.children.length > 0) {
    result.children = node.children.map((child) => transformNode(child, node.name));
  }
  return result;
}

/**
 * 将后端维度数据转换为 ColumnSelector 可用的树数据
 * 每个维度作为顶层节点，其子节点为分类树
 */
function transformGroups(rawGroups: RawCategoryGroup[]): CategoryGroup[] {
  return rawGroups.map((g) => ({
    id: g.id,
    name: g.name,
    sort: g.sort,
    categories: g.categories.map((c) => transformNode(c)),
  }));
}

/**
 * 收集树中所有叶子节点的 ID
 */
function collectLeafIds(nodes: CategoryNode[]): number[] {
  const ids: number[] = [];
  function walk(node: CategoryNode) {
    if (!node.children || node.children.length === 0) {
      ids.push(node.id);
    } else {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  for (const n of nodes) {
    walk(n);
  }
  return ids;
}

/**
 * 在树中查找节点的显示名称
 */
function findLabelById(nodes: CategoryNode[], id: number): string | null {
  for (const node of nodes) {
    if (node.id === id) return node.label;
    if (node.children) {
      const found = findLabelById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 将分类名规范化为 URL 友好的 slug
 *
 * 规则与 VitePress 侧测试题链接生成脚本保持一致：
 * - 英文大小写不敏感
 * - 常见符号转成可读词
 * - 中文分类名保留原字面量
 */
function createCategorySlug(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .replace(/@/g, " ")
    .replace(/\./g, "-")
    .replace(/[^0-9a-zA-Z\u4e00-\u9fff]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/**
 * 取 URL 查询参数的第一个有效值
 */
function getFirstCategoryQueryValue(value: CategoryQueryValue): string | null {
  const raw = Array.isArray(value)
    ? value.find((item): item is string => typeof item === "string" && item.trim() !== "")
    : value;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * 生成匹配分类时使用的候选 key
 */
function createCategoryKeys(value: string): Set<string> {
  const raw = value.trim().toLowerCase();
  const slug = createCategorySlug(value);
  const compactSlug = slug.replace(/-/g, "");
  return new Set([raw, slug, compactSlug].filter((item) => item.length > 0));
}

/**
 * 从叶子节点列表中匹配 URL 分类参数
 */
function findLeafIdByCategoryParam(
  leafNodes: Array<{ id: number; label: string }>,
  value: CategoryQueryValue,
): number | null {
  const rawValue = getFirstCategoryQueryValue(value);
  if (!rawValue) return null;

  const numericId = Number(rawValue);
  if (Number.isInteger(numericId)) {
    const leaf = leafNodes.find((node) => node.id === numericId);
    if (leaf) return leaf.id;
  }

  const targetKeys = createCategoryKeys(rawValue);
  const leaf = leafNodes.find((node) => {
    const leafKeys = createCategoryKeys(node.label);
    return [...targetKeys].some((key) => leafKeys.has(key));
  });
  if (leaf) return leaf.id;

  const targetSlug = createCategorySlug(rawValue);
  if (targetSlug.length < 3) return null;

  const fuzzyLeaf = leafNodes.find((node) => {
    const leafSlug = createCategorySlug(node.label);
    if (leafSlug.length < 3) return false;
    return targetSlug.startsWith(`${leafSlug}-`) || leafSlug.startsWith(`${targetSlug}-`);
  });

  return fuzzyLeaf?.id ?? null;
}

/**
 * 从 localStorage 读取游客偏好
 */
function loadGuestPreferences(): number[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

/**
 * 保存游客偏好到 localStorage
 */
function saveGuestPreferences(ids: number[]) {
  if (ids.length > 0) {
    localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  } else {
    localStorage.removeItem(GUEST_KEY);
  }
}

export function useCategories() {
  /** ColumnSelector 使用的树数据（所有维度作为顶层节点） */
  const treeData = computed<CategoryNode[]>(() => {
    return groups.value.map((g) => ({
      id: g.id,
      label: g.name,
      children: g.categories,
    }));
  });

  /** 所有叶子节点的 label 列表（展示用） */
  const allLeafNodes = computed(() => {
    const result: Array<{ id: number; label: string }> = [];
    function walk(nodes: CategoryNode[]) {
      for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
          result.push({ id: node.id, label: node.label });
        } else {
          walk(node.children);
        }
      }
    }
    for (const g of groups.value) {
      walk(g.categories);
    }
    return result;
  });

  /** 选中分类的显示名称列表 */
  const selectedLabels = computed<string[]>(() => {
    return selectedIds.value
      .map((id) => {
        const leaf = allLeafNodes.value.find((n) => n.id === id);
        return leaf?.label ?? null;
      })
      .filter((label): label is string => label !== null);
  });

  /**
   * 获取分类数据（只加载一次）
   */
  async function loadGroups() {
    if (loaded.value) return;
    try {
      const raw = await fetchCategoryGroups();
      groups.value = transformGroups(raw);
      loaded.value = true;
    } catch (e) {
      console.error("加载分类数据失败", e);
    }
  }

  /**
   * 应用选中分类
   *
   * @param ids - 选中的叶子分类 ID 列表
   * @param isLoggedIn - 是否已登录（登录时同步后端）
   */
  async function applySelection(ids: number[], isLoggedIn: boolean) {
    selectedIds.value = [...ids];
    if (isLoggedIn) {
      try {
        await updatePreferences(ids);
      } catch (e) {
        console.error("同步偏好到后端失败", e);
      }
    } else {
      saveGuestPreferences(ids);
    }
  }

  /**
   * 登录后从后端加载用户偏好
   */
  async function loadUserPreferences() {
    try {
      const prefs = await fetchPreferences();
      selectedIds.value = prefs.map((p) => p.categoryId);
      // 清除游客偏好（已迁移到后端）
      localStorage.removeItem(GUEST_KEY);
    } catch (e) {
      console.error("加载用户偏好失败", e);
    }
  }

  /**
   * 按 URL 分类参数临时筛选题目
   *
   * 不写入 localStorage / 后端偏好，避免文档跳转改变用户长期选择。
   */
  function applyCategoryParam(value: CategoryQueryValue): boolean {
    const leafId = findLeafIdByCategoryParam(allLeafNodes.value, value);
    if (!leafId) return false;

    selectedIds.value = [leafId];
    return true;
  }

  /**
   * 初始化：加载分类树 + 游客偏好
   */
  async function init() {
    await loadGroups();
    // 如果没有选中（未登录或首次），尝试从 localStorage 恢复
    if (selectedIds.value.length === 0) {
      const guest = loadGuestPreferences();
      if (guest.length > 0) {
        selectedIds.value = guest;
      }
    }
  }

  /**
   * 清空选中
   */
  function clearSelection() {
    selectedIds.value = [];
    localStorage.removeItem(GUEST_KEY);
  }

  /**
   * 按 ID 移除单个选中
   */
  function removeById(id: number) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }

  return {
    groups,
    treeData,
    selectedIds,
    selectedLabels,
    showSelector,
    loaded,
    loadGroups,
    init,
    applySelection,
    loadUserPreferences,
    applyCategoryParam,
    clearSelection,
    removeById,
  };
}

// 导出工具函数供测试
export {
  transformNode,
  transformGroups,
  collectLeafIds,
  findLabelById,
  createCategorySlug,
  findLeafIdByCategoryParam,
};
