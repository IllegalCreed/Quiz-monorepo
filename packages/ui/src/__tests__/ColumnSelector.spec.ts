/**
 * ColumnSelector 组件单元测试
 *
 * 测试目标：
 * - 分栏渲染（根据展开路径显示列）
 * - 点击节点展开子级
 * - 三态选中（全选/半选/未选中）
 * - 选中父级自动包含叶子后代
 * - 取消选中
 * - 搜索过滤
 * - 已选摘要区
 */
import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ColumnSelector from "../components/ColumnSelector.vue";
import type { TreeNode } from "../components/ColumnSelector.vue";

/** 测试用树形数据 */
const testData: TreeNode[] = [
  {
    id: "a",
    label: "节点A",
    children: [
      {
        id: "a1",
        label: "子节点A1",
        children: [
          { id: "a1x", label: "叶子A1X" },
          { id: "a1y", label: "叶子A1Y" },
        ],
      },
      { id: "a2", label: "叶子A2" },
    ],
  },
  { id: "b", label: "节点B" },
];

/**
 * 辅助：挂载 ColumnSelector
 */
function mountSelector(overrides: Record<string, unknown> = {}) {
  return mount(ColumnSelector, {
    props: {
      modelValue: [],
      data: testData,
      ...overrides,
    },
  });
}

describe("ColumnSelector 分栏选择器", () => {
  // ── 基础渲染 ──────────────────────────────────────────────────

  it("渲染根节点列表", () => {
    const wrapper = mountSelector();

    const columns = wrapper.findAll(".column-selector__column");
    expect(columns).toHaveLength(1);

    const nodes = columns[0]!.findAll(".column-selector__node");
    expect(nodes).toHaveLength(2);
    expect(nodes[0]!.text()).toContain("节点A");
    expect(nodes[1]!.text()).toContain("节点B");
  });

  it("有子节点的节点显示箭头", () => {
    const wrapper = mountSelector();

    const arrows = wrapper.findAll(".column-selector__arrow");
    // 只有「节点A」有子级
    expect(arrows).toHaveLength(1);
  });

  it("默认显示搜索框", () => {
    const wrapper = mountSelector();

    expect(wrapper.find(".column-selector__search input").exists()).toBe(true);
  });

  it("searchable=false 隐藏搜索框", () => {
    const wrapper = mountSelector({ searchable: false });

    expect(wrapper.find(".column-selector__search").exists()).toBe(false);
  });

  // ── 展开子级 ──────────────────────────────────────────────────

  describe("展开子级", () => {
    it("点击有子级的节点展开右列", async () => {
      const wrapper = mountSelector();

      // 点击「节点A」
      await wrapper.findAll(".column-selector__node")[0]!.trigger("click");

      const columns = wrapper.findAll(".column-selector__column");
      expect(columns).toHaveLength(2);

      // 第二列显示「子节点A1」和「叶子A2」
      const col2Nodes = columns[1]!.findAll(".column-selector__node");
      expect(col2Nodes).toHaveLength(2);
      expect(col2Nodes[0]!.text()).toContain("子节点A1");
      expect(col2Nodes[1]!.text()).toContain("叶子A2");
    });

    it("点击的节点标记为 active", async () => {
      const wrapper = mountSelector();

      await wrapper.findAll(".column-selector__node")[0]!.trigger("click");

      expect(wrapper.findAll(".column-selector__node")[0]!.classes()).toContain(
        "column-selector__node--active",
      );
    });

    it("逐级展开到深层", async () => {
      const wrapper = mountSelector();

      // 展开 A
      await wrapper.findAll(".column-selector__node")[0]!.trigger("click");
      // 展开 A1
      const col2Nodes = wrapper
        .findAll(".column-selector__column")[1]!
        .findAll(".column-selector__node");
      await col2Nodes[0]!.trigger("click");

      // 应有 3 列
      const columns = wrapper.findAll(".column-selector__column");
      expect(columns).toHaveLength(3);

      // 第三列有「叶子A1X」和「叶子A1Y」
      const col3Nodes = columns[2]!.findAll(".column-selector__node");
      expect(col3Nodes).toHaveLength(2);
      expect(col3Nodes[0]!.text()).toContain("叶子A1X");
    });

    it("点击叶子节点不展开新列", async () => {
      const wrapper = mountSelector();

      // 点击「节点B」（叶子节点）
      await wrapper.findAll(".column-selector__node")[1]!.trigger("click");

      // 仍然只有 1 列
      expect(wrapper.findAll(".column-selector__column")).toHaveLength(1);
    });
  });

  // ── 选中状态 ──────────────────────────────────────────────────

  describe("选中/取消", () => {
    it("点击叶子节点指示器选中", async () => {
      const wrapper = mountSelector();

      // 「节点B」是叶子，点击其 indicator
      const indicators = wrapper.findAll(".column-selector__indicator");
      await indicators[1]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]![0]).toContain("b");
    });

    it("选中父级自动包含所有叶子后代", async () => {
      const wrapper = mountSelector();

      // 点击「节点A」的指示器（应选中 a1x, a1y, a2 三个叶子）
      const indicators = wrapper.findAll(".column-selector__indicator");
      await indicators[0]!.trigger("click");

      const emitted = wrapper.emitted("update:modelValue")![0]![0] as (
        | string
        | number
      )[];
      expect(emitted).toHaveLength(3);
      expect(emitted).toContain("a1x");
      expect(emitted).toContain("a1y");
      expect(emitted).toContain("a2");
    });

    it("取消已全选的节点", async () => {
      // 预选所有叶子
      const wrapper = mountSelector({ modelValue: ["a1x", "a1y", "a2"] });

      // 点击「节点A」的指示器取消
      const indicators = wrapper.findAll(".column-selector__indicator");
      await indicators[0]!.trigger("click");

      const emitted = wrapper.emitted("update:modelValue")![0]![0] as (
        | string
        | number
      )[];
      expect(emitted).toHaveLength(0);
    });
  });

  // ── 三态指示器 ────────────────────────────────────────────────

  describe("三态指示器", () => {
    it("未选中时无修饰类", () => {
      const wrapper = mountSelector({ modelValue: [] });

      const indicator = wrapper.findAll(".column-selector__indicator")[0]!;
      expect(indicator.classes()).not.toContain(
        "column-selector__indicator--selected",
      );
      expect(indicator.classes()).not.toContain(
        "column-selector__indicator--indeterminate",
      );
    });

    it("全选时显示 --selected", () => {
      const wrapper = mountSelector({ modelValue: ["a1x", "a1y", "a2"] });

      const indicator = wrapper.findAll(".column-selector__indicator")[0]!;
      expect(indicator.classes()).toContain(
        "column-selector__indicator--selected",
      );
    });

    it("部分选中时显示 --indeterminate", () => {
      // 只选了 a1x，「节点A」应为半选
      const wrapper = mountSelector({ modelValue: ["a1x"] });

      const indicator = wrapper.findAll(".column-selector__indicator")[0]!;
      expect(indicator.classes()).toContain(
        "column-selector__indicator--indeterminate",
      );
    });

    it("叶子节点选中时显示 --selected", () => {
      const wrapper = mountSelector({ modelValue: ["b"] });

      // 「节点B」是第 2 个节点
      const indicator = wrapper.findAll(".column-selector__indicator")[1]!;
      expect(indicator.classes()).toContain(
        "column-selector__indicator--selected",
      );
    });
  });

  // ── 搜索 ──────────────────────────────────────────────────────

  describe("搜索过滤", () => {
    it("输入关键词显示匹配节点", async () => {
      const wrapper = mountSelector();

      // 搜索「叶子」
      await wrapper.find(".column-selector__search input").setValue("叶子");
      await flushPromises();

      // 应切换为搜索模式（单列扁平列表）
      const nodes = wrapper.findAll(".column-selector__node");
      // 应有 3 个叶子匹配：A1X, A1Y, A2
      expect(nodes).toHaveLength(3);
    });

    it("无匹配时显示空状态", async () => {
      const wrapper = mountSelector();

      await wrapper
        .find(".column-selector__search input")
        .setValue("不存在的节点");
      await flushPromises();

      expect(wrapper.find(".column-selector__empty").exists()).toBe(true);
      expect(wrapper.find(".column-selector__empty").text()).toContain(
        "无匹配",
      );
    });

    it("清空搜索恢复分栏模式", async () => {
      const wrapper = mountSelector();

      await wrapper.find(".column-selector__search input").setValue("叶子");
      await flushPromises();
      expect(wrapper.findAll(".column-selector__arrow")).toHaveLength(0);

      await wrapper.find(".column-selector__search input").setValue("");
      await flushPromises();

      // 恢复分栏模式
      expect(wrapper.findAll(".column-selector__arrow").length).toBeGreaterThan(
        0,
      );
    });
  });

  // ── 已选摘要 ──────────────────────────────────────────────────

  describe("已选摘要", () => {
    it("显示已选叶子节点标签", () => {
      const wrapper = mountSelector({ modelValue: ["a1x", "b"] });

      const tags = wrapper.findAll(".column-selector__summary .tag");
      expect(tags).toHaveLength(2);
      expect(tags[0]!.text()).toContain("叶子A1X");
      expect(tags[1]!.text()).toContain("节点B");
    });

    it("无选中时不显示摘要区", () => {
      const wrapper = mountSelector({ modelValue: [] });

      expect(wrapper.find(".column-selector__summary").exists()).toBe(false);
    });

    it("点击标签 × 移除选中", async () => {
      const wrapper = mountSelector({ modelValue: ["a1x", "b"] });

      // 移除第一个标签（BaseTag 的关闭按钮）
      const removeBtn = wrapper.findAll(".tag__remove")[0]!;
      await removeBtn.trigger("click");

      const emitted = wrapper.emitted("update:modelValue")![0]![0] as (
        | string
        | number
      )[];
      // 只剩 b
      expect(emitted).toHaveLength(1);
      expect(emitted).toContain("b");
    });
  });

  // ── placeholder ──────────────────────────────────────────────

  describe("searchPlaceholder", () => {
    it("默认占位文字为「搜索...」", () => {
      const wrapper = mountSelector();

      expect(
        wrapper
          .find(".column-selector__search input")
          .attributes("placeholder"),
      ).toBe("搜索...");
    });

    it("自定义占位文字", () => {
      const wrapper = mountSelector({ searchPlaceholder: "按名称过滤" });

      expect(
        wrapper
          .find(".column-selector__search input")
          .attributes("placeholder"),
      ).toBe("按名称过滤");
    });
  });
});
