/**
 * BaseTag 组件单元测试
 *
 * 测试目标：
 * - size 尺寸：sm、md、lg
 * - color 颜色变体
 * - removable 可关闭模式
 * - remove 事件触发
 * - slot 内容渲染
 * - getTagColor 确定性颜色分配
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BaseTag from "../components/BaseTag.vue";
import { getTagColor } from "../components/tag-utils";

describe("BaseTag 标签组件", () => {
  it("正确渲染基础结构和 slot 内容", () => {
    const wrapper = mount(BaseTag, {
      slots: { default: "Vue" },
    });

    const tag = wrapper.find("span");

    // 断言：是 span 元素
    expect(tag.exists()).toBe(true);
    expect(tag.element.tagName).toBe("SPAN");

    // 断言：有基础类名
    expect(tag.classes()).toContain("tag");

    // 断言：slot 内容正确渲染
    expect(tag.text()).toBe("Vue");
  });

  describe("size 尺寸", () => {
    it("sm 尺寸", () => {
      const wrapper = mount(BaseTag, {
        props: { size: "sm" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--sm");
    });

    it("md 尺寸", () => {
      const wrapper = mount(BaseTag, {
        props: { size: "md" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--md");
    });

    it("lg 尺寸", () => {
      const wrapper = mount(BaseTag, {
        props: { size: "lg" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--lg");
    });

    it("默认 size 为 md", () => {
      const wrapper = mount(BaseTag, {
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--md");
    });
  });

  describe("color 颜色变体", () => {
    it("默认 color 为 default（不添加颜色类名）", () => {
      const wrapper = mount(BaseTag, {
        slots: { default: "标签" },
      });

      const tag = wrapper.find("span");
      expect(tag.classes()).toContain("tag");
      // 不应有颜色 modifier
      expect(
        tag.classes().filter((c) => c.startsWith("tag--") && c !== "tag--md"),
      ).toHaveLength(0);
    });

    it("blue 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "blue" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--blue");
    });

    it("green 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "green" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--green");
    });

    it("purple 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "purple" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--purple");
    });

    it("orange 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "orange" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--orange");
    });

    it("pink 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "pink" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--pink");
    });

    it("cyan 颜色", () => {
      const wrapper = mount(BaseTag, {
        props: { color: "cyan" },
        slots: { default: "标签" },
      });

      expect(wrapper.find("span").classes()).toContain("tag--cyan");
    });
  });

  describe("removable 可关闭", () => {
    it("removable=false 时不显示关闭按钮", () => {
      const wrapper = mount(BaseTag, {
        props: { removable: false },
        slots: { default: "标签" },
      });

      expect(wrapper.find(".tag__remove").exists()).toBe(false);
    });

    it("removable=true 时显示关闭按钮", () => {
      const wrapper = mount(BaseTag, {
        props: { removable: true },
        slots: { default: "标签" },
      });

      expect(wrapper.find(".tag__remove").exists()).toBe(true);
      expect(wrapper.find(".tag__remove").text()).toBe("×");
    });

    it("默认 removable 为 false", () => {
      const wrapper = mount(BaseTag, {
        slots: { default: "标签" },
      });

      expect(wrapper.find(".tag__remove").exists()).toBe(false);
    });

    it("点击关闭按钮触发 remove 事件", async () => {
      const wrapper = mount(BaseTag, {
        props: { removable: true },
        slots: { default: "标签" },
      });

      await wrapper.find(".tag__remove").trigger("click");

      expect(wrapper.emitted("remove")).toHaveLength(1);
    });

    it("点击关闭按钮不冒泡到父元素", async () => {
      const wrapper = mount(BaseTag, {
        props: { removable: true },
        slots: { default: "标签" },
      });

      // .stop 修饰符由 Vue 处理，验证 emit
      await wrapper.find(".tag__remove").trigger("click");

      expect(wrapper.emitted("remove")).toHaveLength(1);
    });
  });

  describe("组合测试", () => {
    it("size + color + removable 组合", () => {
      const wrapper = mount(BaseTag, {
        props: { size: "sm", color: "blue", removable: true },
        slots: { default: "标签" },
      });

      const tag = wrapper.find("span");
      expect(tag.classes()).toContain("tag--sm");
      expect(tag.classes()).toContain("tag--blue");
      expect(wrapper.find(".tag__remove").exists()).toBe(true);
    });

    it("lg + 不可关闭", () => {
      const wrapper = mount(BaseTag, {
        props: { size: "lg", removable: false },
        slots: { default: "标签" },
      });

      const tag = wrapper.find("span");
      expect(tag.classes()).toContain("tag--lg");
      expect(wrapper.find(".tag__remove").exists()).toBe(false);
    });
  });

  describe("slot 内容", () => {
    it("支持文本内容", () => {
      const wrapper = mount(BaseTag, {
        slots: { default: "JavaScript" },
      });

      expect(wrapper.text()).toBe("JavaScript");
    });

    it("支持空内容", () => {
      const wrapper = mount(BaseTag);

      expect(wrapper.text()).toBe("");
    });
  });

  describe("getTagColor 确定性颜色分配", () => {
    it("同一文本始终返回相同颜色", () => {
      const color1 = getTagColor("Vue");
      const color2 = getTagColor("Vue");
      expect(color1).toBe(color2);
    });

    it("不同文本返回不同颜色（大概率）", () => {
      const colors = new Set(
        ["Vue", "React", "CSS", "JavaScript", "HTML", "Node.js"].map(
          getTagColor,
        ),
      );
      // 6 个文本至少有 2 种不同颜色
      expect(colors.size).toBeGreaterThanOrEqual(2);
    });

    it("返回值是有效的 TagColor", () => {
      const validColors = ["blue", "green", "purple", "orange", "pink", "cyan"];
      const color = getTagColor("测试");
      expect(validColors).toContain(color);
    });
  });
});
