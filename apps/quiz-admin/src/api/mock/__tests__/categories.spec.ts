/**
 * categories mock API 单元测试
 * 每个测试通过 vi.resetModules() 获得独立的 mockGroups 状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("categories mock API", () => {
  // 每次测试前重置模块，获得全新的 mockGroups 数组和 nextId
  let getCategoryGroups: (typeof import("../categories"))["getCategoryGroups"];
  let createCategoryGroup: (typeof import("../categories"))["createCategoryGroup"];
  let updateCategoryGroup: (typeof import("../categories"))["updateCategoryGroup"];
  let deleteCategoryGroup: (typeof import("../categories"))["deleteCategoryGroup"];
  let createCategory: (typeof import("../categories"))["createCategory"];
  let updateCategory: (typeof import("../categories"))["updateCategory"];
  let deleteCategory: (typeof import("../categories"))["deleteCategory"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../categories");
    getCategoryGroups = module.getCategoryGroups;
    createCategoryGroup = module.createCategoryGroup;
    updateCategoryGroup = module.updateCategoryGroup;
    deleteCategoryGroup = module.deleteCategoryGroup;
    createCategory = module.createCategory;
    updateCategory = module.updateCategory;
    deleteCategory = module.deleteCategory;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getCategoryGroups ─────────────────────────────────────────────────────

  describe("getCategoryGroups", () => {
    it("返回初始 3 个维度", async () => {
      const p = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await p;
      expect(groups).toHaveLength(3);
    });

    it("每个维度包含必要字段", async () => {
      const p = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await p;
      for (const group of groups) {
        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("sort");
        expect(group).toHaveProperty("categories");
        expect(group).toHaveProperty("createdAt");
        expect(group).toHaveProperty("updatedAt");
      }
    });

    it("「技术方向」维度包含嵌套的分类树", async () => {
      const p = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await p;
      const techGroup = groups.find((g) => g.name === "技术方向");
      expect(techGroup).toBeDefined();
      // 根节点有「前端」和「后端」
      expect(techGroup!.categories).toHaveLength(2);
      const frontend = techGroup!.categories.find((c) => c.name === "前端");
      expect(frontend?.children.length).toBeGreaterThan(0);
    });

    it("返回副本，修改外部数组不影响内部状态", async () => {
      const p1 = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await p1;
      const originalLength = groups.length;
      // 直接 push 到外部副本
      (groups as unknown[]).push({});

      const p2 = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups2 = await p2;
      expect(groups2).toHaveLength(originalLength);
    });
  });

  // ── createCategoryGroup ───────────────────────────────────────────────────

  describe("createCategoryGroup", () => {
    it("成功创建维度并返回新维度", async () => {
      const p = createCategoryGroup({ name: "题型" });
      await vi.runAllTimersAsync();
      const group = await p;
      expect(group.name).toBe("题型");
      expect(group.id).toBeGreaterThan(0);
      expect(group.categories).toHaveLength(0);
    });

    it("创建后维度出现在列表中", async () => {
      const cp = createCategoryGroup({ name: "新维度" });
      await vi.runAllTimersAsync();
      const newGroup = await cp;

      const lp = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await lp;
      expect(groups.find((g) => g.id === newGroup.id)).toBeDefined();
    });

    it("sort 未传时默认为 0", async () => {
      const p = createCategoryGroup({ name: "无排序维度" });
      await vi.runAllTimersAsync();
      const group = await p;
      expect(group.sort).toBe(0);
    });

    it("指定 sort 时正确写入", async () => {
      const p = createCategoryGroup({ name: "有序维度", sort: 5 });
      await vi.runAllTimersAsync();
      const group = await p;
      expect(group.sort).toBe(5);
    });
  });

  // ── updateCategoryGroup ───────────────────────────────────────────────────

  describe("updateCategoryGroup", () => {
    it("成功更新维度名称", async () => {
      const p = updateCategoryGroup(1, { name: "技术栈" });
      await vi.runAllTimersAsync();
      const group = await p;
      expect(group.name).toBe("技术栈");

      const lp = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await lp;
      expect(groups.find((g) => g.id === 1)?.name).toBe("技术栈");
    });

    it("成功更新维度排序", async () => {
      const p = updateCategoryGroup(2, { sort: 10 });
      await vi.runAllTimersAsync();
      const group = await p;
      expect(group.sort).toBe(10);
    });

    it("更新不存在的维度时抛出错误", async () => {
      await Promise.all([
        expect(updateCategoryGroup(9999, { name: "不存在" })).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── deleteCategoryGroup ───────────────────────────────────────────────────

  describe("deleteCategoryGroup", () => {
    it("成功删除空维度（无分类节点）", async () => {
      // 先清空维度 2（「语言」）的分类，或者创建一个空维度
      const cp = createCategoryGroup({ name: "空维度" });
      await vi.runAllTimersAsync();
      const newGroup = await cp;

      const dp = deleteCategoryGroup(newGroup.id);
      await vi.runAllTimersAsync();
      await dp;

      const lp = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await lp;
      expect(groups.find((g) => g.id === newGroup.id)).toBeUndefined();
    });

    it("删除不存在的维度时抛出错误", async () => {
      await Promise.all([
        expect(deleteCategoryGroup(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("维度下有分类节点时拒绝删除", async () => {
      // 维度 1（「技术方向」）包含分类节点
      await Promise.all([
        expect(deleteCategoryGroup(1)).rejects.toThrow("仍有分类节点"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── createCategory ────────────────────────────────────────────────────────

  describe("createCategory", () => {
    it("成功在维度下创建根分类节点", async () => {
      const p = createCategory(1, { name: "DevOps", groupId: 1 });
      await vi.runAllTimersAsync();
      const group = await p;
      // 返回的是更新后的 group，检查新节点在根分类列表中
      const rootNames = group.categories.map((c) => c.name);
      expect(rootNames).toContain("DevOps");
    });

    it("成功创建子分类节点（指定 parentId）", async () => {
      // id=1 是「前端」（根节点）
      const p = createCategory(1, { name: "Angular", groupId: 1, parentId: 1 });
      await vi.runAllTimersAsync();
      const group = await p;
      const frontend = group.categories.find((c) => c.name === "前端");
      // 「框架」节点下的 children 中或 前端 的 children 中找到 Angular
      const allChildren = frontend?.children ?? [];
      const hasAngular = (nodes: typeof allChildren): boolean =>
        nodes.some((n) => n.name === "Angular" || hasAngular(n.children));
      expect(hasAngular(frontend ? [frontend] : group.categories)).toBe(true);
    });

    it("维度不存在时抛出错误", async () => {
      await Promise.all([
        expect(createCategory(9999, { name: "x", groupId: 9999 })).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("父节点不存在时抛出错误", async () => {
      await Promise.all([
        expect(createCategory(1, { name: "x", groupId: 1, parentId: 9999 })).rejects.toThrow(
          "不存在",
        ),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── updateCategory ────────────────────────────────────────────────────────

  describe("updateCategory", () => {
    it("成功更新分类节点名称", async () => {
      // id=11 是「JavaScript」（维度 2「语言」下的根节点）
      const p = updateCategory(11, { name: "JavaScript ES2024" });
      await vi.runAllTimersAsync();
      const group = await p;
      const node = group.categories.find((c) => c.name === "JavaScript ES2024");
      expect(node).toBeDefined();
    });

    it("更新不存在的节点时抛出错误", async () => {
      await Promise.all([
        expect(updateCategory(9999, { name: "不存在" })).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── deleteCategory ────────────────────────────────────────────────────────

  describe("deleteCategory", () => {
    it("成功删除叶节点（无子分类）", async () => {
      // id=5 是「Vue」（叶节点）
      const p = deleteCategory(5);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toMatchObject({ message: "分类删除成功" });
    });

    it("删除后节点从树中消失", async () => {
      const dp = deleteCategory(5);
      await vi.runAllTimersAsync();
      await dp;

      const lp = getCategoryGroups();
      await vi.runAllTimersAsync();
      const groups = await lp;
      // 在整个树中找不到 id=5 的节点
      const findNode = (nodes: { id: number; children: unknown[] }[]): boolean =>
        nodes.some(
          (n) => n.id === 5 || findNode(n.children as { id: number; children: unknown[] }[]),
        );
      const techGroup = groups.find((g) => g.id === 1);
      expect(findNode(techGroup!.categories as { id: number; children: unknown[] }[])).toBe(false);
    });

    it("删除不存在的节点时抛出错误", async () => {
      await Promise.all([
        expect(deleteCategory(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("删除有子节点的分类时抛出错误", async () => {
      // id=3 是「框架」，下有「Vue」和「React」
      await Promise.all([
        expect(deleteCategory(3)).rejects.toThrow("子分类"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
