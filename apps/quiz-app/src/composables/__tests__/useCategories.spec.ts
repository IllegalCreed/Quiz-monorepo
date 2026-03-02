/**
 * useCategories composable 单元测试
 *
 * 测试数据转换（name→label、通识拼接）和选中管理
 * 包括：clearSelection、loadUserPreferences、applySelection、init
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock API 模块（必须在 import 之前声明）
vi.mock("@/api/categories", () => ({
  fetchCategoryGroups: vi.fn(),
}));
vi.mock("@/api/user-profile", () => ({
  fetchPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}));

import {
  useCategories,
  transformNode,
  transformGroups,
  collectLeafIds,
  findLabelById,
} from "../useCategories";
import { fetchCategoryGroups } from "@/api/categories";
import { fetchPreferences, updatePreferences } from "@/api/user-profile";
import type { RawCategoryNode, RawCategoryGroup, UserPreference, CategoryNode } from "@/types/category";

const mockFetchGroups = vi.mocked(fetchCategoryGroups);
const mockFetchPrefs = vi.mocked(fetchPreferences);
const mockUpdatePrefs = vi.mocked(updatePreferences);

/** 模拟分类树数据 */
const fakeRawGroups: RawCategoryGroup[] = [
  {
    id: 1,
    name: "技术方向",
    sort: 0,
    categories: [
      {
        id: 10,
        name: "前端",
        sort: 0,
        isDefault: false,
        children: [
          { id: 11, name: "Vue", sort: 0, isDefault: false, children: [] },
          { id: 12, name: "React", sort: 1, isDefault: false, children: [] },
          { id: 99, name: "通识", sort: 9999, isDefault: true, children: [] },
        ],
      },
    ],
  },
];

/** 构造最小 UserPreference mock（只使用 categoryId） */
function fakePref(categoryId: number): UserPreference {
  return {
    userId: 1,
    categoryId,
    category: {
      id: categoryId,
      name: `分类${categoryId}`,
      groupId: 1,
      parentId: null,
      isDefault: false,
      group: { id: 1, name: "技术方向" },
      parent: null,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// 数据转换测试（纯函数，无副作用）
// ─────────────────────────────────────────────────────────────────

describe("useCategories — 数据转换", () => {
  describe("transformNode", () => {
    it("普通节点：name → label", () => {
      const raw: RawCategoryNode = {
        id: 1,
        name: "前端",
        sort: 0,
        isDefault: false,
        children: [],
      };
      const result = transformNode(raw);
      expect(result.id).toBe(1);
      expect(result.label).toBe("前端");
      expect(result.isDefault).toBeUndefined();
    });

    it("通识节点：拼接父名", () => {
      const raw: RawCategoryNode = {
        id: 99,
        name: "通识",
        sort: 9999,
        isDefault: true,
        children: [],
      };
      const result = transformNode(raw, "前端");
      expect(result.label).toBe("前端通识");
      expect(result.isDefault).toBe(true);
    });

    it("通识节点无父名：保持原名", () => {
      const raw: RawCategoryNode = {
        id: 99,
        name: "通识",
        sort: 9999,
        isDefault: true,
        children: [],
      };
      const result = transformNode(raw);
      expect(result.label).toBe("通识");
    });

    it("有子节点时递归转换", () => {
      const raw: RawCategoryNode = {
        id: 1,
        name: "前端",
        sort: 0,
        isDefault: false,
        children: [
          { id: 2, name: "Vue", sort: 0, isDefault: false, children: [] },
          { id: 99, name: "通识", sort: 9999, isDefault: true, children: [] },
        ],
      };
      const result = transformNode(raw);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]!.label).toBe("Vue");
      expect(result.children![1]!.label).toBe("前端通识");
    });
  });

  describe("transformGroups", () => {
    it("转换维度数组", () => {
      const raw: RawCategoryGroup[] = [
        {
          id: 1,
          name: "技术方向",
          sort: 0,
          categories: [
            {
              id: 1,
              name: "前端",
              sort: 0,
              isDefault: false,
              children: [{ id: 2, name: "Vue", sort: 0, isDefault: false, children: [] }],
            },
          ],
        },
      ];
      const result = transformGroups(raw);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("技术方向");
      expect(result[0]!.categories[0]!.label).toBe("前端");
      expect(result[0]!.categories[0]!.children![0]!.label).toBe("Vue");
    });
  });

  describe("collectLeafIds", () => {
    it("收集所有叶子节点 ID", () => {
      const nodes: CategoryNode[] = [
        {
          id: 1,
          label: "前端",
          children: [
            { id: 11, label: "Vue" },
            { id: 12, label: "React" },
          ],
        },
        { id: 2, label: "后端" },
      ];
      expect(collectLeafIds(nodes)).toEqual([11, 12, 2]);
    });

    it("空数组返回空", () => {
      expect(collectLeafIds([])).toEqual([]);
    });

    it("深层嵌套时只收集叶子", () => {
      const nodes: CategoryNode[] = [
        {
          id: 1,
          label: "根",
          children: [
            {
              id: 2,
              label: "中间",
              children: [{ id: 3, label: "叶子" }],
            },
          ],
        },
      ];
      expect(collectLeafIds(nodes)).toEqual([3]);
    });
  });

  describe("findLabelById", () => {
    const nodes: CategoryNode[] = [
      {
        id: 1,
        label: "前端",
        children: [
          { id: 11, label: "Vue" },
          { id: 12, label: "React" },
        ],
      },
      { id: 2, label: "后端" },
    ];

    it("找到顶层节点", () => {
      expect(findLabelById(nodes, 1)).toBe("前端");
    });

    it("找到嵌套子节点", () => {
      expect(findLabelById(nodes, 11)).toBe("Vue");
    });

    it("找不到时返回 null", () => {
      expect(findLabelById(nodes, 999)).toBeNull();
    });

    it("空数组返回 null", () => {
      expect(findLabelById([], 1)).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// 选中管理测试（涉及 singleton 状态 + API mock）
// ─────────────────────────────────────────────────────────────────

describe("useCategories — 选中管理", () => {
  /** 重置模块级 singleton 状态 */
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    const { selectedIds, loaded, groups } = useCategories();
    selectedIds.value = [];
    loaded.value = false;
    groups.value = [];
  });

  describe("clearSelection", () => {
    it("清空 selectedIds 并移除 localStorage", () => {
      const { selectedIds, clearSelection } = useCategories();
      selectedIds.value = [11, 12];
      localStorage.setItem("quiz-guest-categories", JSON.stringify([11, 12]));

      clearSelection();

      expect(selectedIds.value).toEqual([]);
      expect(localStorage.getItem("quiz-guest-categories")).toBeNull();
    });

    it("已经为空时调用也不报错", () => {
      const { selectedIds, clearSelection } = useCategories();
      expect(selectedIds.value).toEqual([]);

      clearSelection();

      expect(selectedIds.value).toEqual([]);
    });
  });

  describe("loadUserPreferences", () => {
    it("从后端加载偏好并设置 selectedIds", async () => {
      mockFetchPrefs.mockResolvedValue([fakePref(11), fakePref(12)]);
      const { selectedIds, loadUserPreferences } = useCategories();

      await loadUserPreferences();

      expect(mockFetchPrefs).toHaveBeenCalledTimes(1);
      expect(selectedIds.value).toEqual([11, 12]);
    });

    it("加载后清除游客 localStorage", async () => {
      localStorage.setItem("quiz-guest-categories", JSON.stringify([99]));
      mockFetchPrefs.mockResolvedValue([fakePref(11)]);
      const { loadUserPreferences } = useCategories();

      await loadUserPreferences();

      expect(localStorage.getItem("quiz-guest-categories")).toBeNull();
    });

    it("后端返回空数组时 selectedIds 为空", async () => {
      mockFetchPrefs.mockResolvedValue([]);
      const { selectedIds, loadUserPreferences } = useCategories();

      await loadUserPreferences();

      expect(selectedIds.value).toEqual([]);
    });

    it("请求失败时不修改 selectedIds", async () => {
      mockFetchPrefs.mockRejectedValue(new Error("网络错误"));
      const { selectedIds, loadUserPreferences } = useCategories();
      selectedIds.value = [11];

      await loadUserPreferences();

      expect(selectedIds.value).toEqual([11]);
    });
  });

  describe("applySelection", () => {
    it("登录用户：更新 selectedIds 并同步后端", async () => {
      mockUpdatePrefs.mockResolvedValue([]);
      const { selectedIds, applySelection } = useCategories();

      await applySelection([11, 12], true);

      expect(selectedIds.value).toEqual([11, 12]);
      expect(mockUpdatePrefs).toHaveBeenCalledWith([11, 12]);
    });

    it("游客：更新 selectedIds 并存入 localStorage", async () => {
      const { selectedIds, applySelection } = useCategories();

      await applySelection([11, 12], false);

      expect(selectedIds.value).toEqual([11, 12]);
      expect(mockUpdatePrefs).not.toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem("quiz-guest-categories")!)).toEqual([11, 12]);
    });

    it("游客选空数组时移除 localStorage", async () => {
      localStorage.setItem("quiz-guest-categories", JSON.stringify([11]));
      const { applySelection } = useCategories();

      await applySelection([], false);

      expect(localStorage.getItem("quiz-guest-categories")).toBeNull();
    });

    it("登录用户同步后端失败时 selectedIds 仍更新（乐观更新）", async () => {
      mockUpdatePrefs.mockRejectedValue(new Error("同步失败"));
      const { selectedIds, applySelection } = useCategories();

      await applySelection([11], true);

      expect(selectedIds.value).toEqual([11]);
    });
  });

  describe("init", () => {
    it("加载分类树数据", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, groups, loaded } = useCategories();

      await init();

      expect(mockFetchGroups).toHaveBeenCalledTimes(1);
      expect(loaded.value).toBe(true);
      expect(groups.value).toHaveLength(1);
      expect(groups.value[0]!.name).toBe("技术方向");
    });

    it("有游客 localStorage 时恢复 selectedIds", async () => {
      localStorage.setItem("quiz-guest-categories", JSON.stringify([11, 12]));
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, selectedIds } = useCategories();

      await init();

      expect(selectedIds.value).toEqual([11, 12]);
    });

    it("已有 selectedIds 时不覆盖（登录用户已加载偏好）", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, selectedIds } = useCategories();
      selectedIds.value = [99]; // 模拟已登录用户偏好

      await init();

      expect(selectedIds.value).toEqual([99]);
    });

    it("只加载一次（loaded = true 时跳过 API 调用）", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init } = useCategories();

      await init();
      await init();

      expect(mockFetchGroups).toHaveBeenCalledTimes(1);
    });

    it("加载失败时 loaded 保持 false", async () => {
      mockFetchGroups.mockRejectedValue(new Error("网络错误"));
      const { init, loaded } = useCategories();

      await init();

      expect(loaded.value).toBe(false);
    });
  });

  describe("退出登录 → 重新登录 流程", () => {
    it("clearSelection 清空偏好，loadUserPreferences 恢复", async () => {
      const { selectedIds, clearSelection, loadUserPreferences } = useCategories();

      // 1. 模拟已登录状态，有偏好
      selectedIds.value = [11, 12];

      // 2. 退出登录：清空偏好
      clearSelection();
      expect(selectedIds.value).toEqual([]);

      // 3. 重新登录：从后端加载
      mockFetchPrefs.mockResolvedValue([fakePref(11)]);
      await loadUserPreferences();
      expect(selectedIds.value).toEqual([11]);
    });
  });

  describe("treeData 计算属性", () => {
    it("将 groups 转换为 ColumnSelector 树数据", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, treeData } = useCategories();

      await init();

      // 顶层节点是维度名称
      expect(treeData.value).toHaveLength(1);
      expect(treeData.value[0]!.label).toBe("技术方向");
      expect(treeData.value[0]!.children).toHaveLength(1);
      expect(treeData.value[0]!.children![0]!.label).toBe("前端");
    });
  });

  describe("selectedLabels 计算属性", () => {
    it("返回选中分类的显示名称", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, selectedIds, selectedLabels } = useCategories();

      await init();
      selectedIds.value = [11, 12];

      expect(selectedLabels.value).toEqual(["Vue", "React"]);
    });

    it("选中不存在的 ID 时过滤掉", async () => {
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, selectedIds, selectedLabels } = useCategories();

      await init();
      selectedIds.value = [11, 9999];

      expect(selectedLabels.value).toEqual(["Vue"]);
    });

    it("无选中时返回空数组", () => {
      const { selectedLabels } = useCategories();
      expect(selectedLabels.value).toEqual([]);
    });
  });

  describe("removeById", () => {
    it("移除指定 ID", () => {
      const { selectedIds, removeById } = useCategories();
      selectedIds.value = [11, 12, 99];

      removeById(12);

      expect(selectedIds.value).toEqual([11, 99]);
    });

    it("移除不存在的 ID 时不影响", () => {
      const { selectedIds, removeById } = useCategories();
      selectedIds.value = [11, 12];

      removeById(999);

      expect(selectedIds.value).toEqual([11, 12]);
    });
  });

  describe("showSelector", () => {
    it("默认为 false", () => {
      const { showSelector } = useCategories();
      expect(showSelector.value).toBe(false);
    });

    it("可以切换", () => {
      const { showSelector } = useCategories();
      showSelector.value = true;
      expect(showSelector.value).toBe(true);
      showSelector.value = false;
      expect(showSelector.value).toBe(false);
    });
  });

  describe("loadGuestPreferences 边界情况", () => {
    it("localStorage 存储非法 JSON 时返回空数组", async () => {
      localStorage.setItem("quiz-guest-categories", "not-json");
      mockFetchGroups.mockResolvedValue(fakeRawGroups);
      const { init, selectedIds } = useCategories();

      await init();

      // 非法 JSON 解析失败，回退为空数组
      expect(selectedIds.value).toEqual([]);
    });
  });
});
