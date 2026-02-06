/**
 * Button 组件单元测试
 *
 * 测试目标：
 * - variant 变体：default、outline、ghost
 * - size 尺寸：md、sm、lg
 * - disabled 禁用状态
 * - type 按钮类型
 * - slot 内容渲染
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BaseButton from "../components/BaseButton.vue";

describe("BaseButton 按钮组件", () => {
  it("正确渲染基础结构和 slot 内容", () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: "点击我",
      },
    });

    const button = wrapper.find("button");

    // 断言：是 button 元素
    expect(button.exists()).toBe(true);
    expect(button.element.tagName).toBe("BUTTON");

    // 断言：有基础类名
    expect(button.classes()).toContain("btn");

    // 断言：slot 内容正确渲染
    expect(button.text()).toBe("点击我");
  });

  describe("variant 变体", () => {
    it("default 变体：显示主按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "default" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--default");
    });

    it("outline 变体：显示次要按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "outline" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--outline");
    });

    it("ghost 变体：显示幽灵按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "ghost" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--ghost");
    });

    it("默认 variant 为 default", () => {
      const wrapper = mount(BaseButton);

      expect(wrapper.find("button").classes()).toContain("btn--default");
    });
  });

  describe("size 尺寸", () => {
    it("sm 尺寸：显示小按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "sm" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--sm");
    });

    it("md 尺寸：显示默认按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "md" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--md");
    });

    it("lg 尺寸：显示大按钮样式", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "lg" },
      });

      expect(wrapper.find("button").classes()).toContain("btn--lg");
    });

    it("默认 size 为 md", () => {
      const wrapper = mount(BaseButton);

      // 断言：默认有 btn--md 类
      expect(wrapper.find("button").classes()).toContain("btn--md");
    });
  });

  describe("disabled 禁用状态", () => {
    it("disabled=true 时按钮不可点击", () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: "禁用按钮" },
      });

      const button = wrapper.find("button");

      // 断言：有 disabled 属性
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disabled=false 时按钮可点击", () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: false },
      });

      // 断言：没有 disabled 属性
      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });

    it("默认 disabled 为 false", () => {
      const wrapper = mount(BaseButton);

      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });
  });

  describe("type 按钮类型", () => {
    it("type=button 设置正确", () => {
      const wrapper = mount(BaseButton, {
        props: { type: "button" },
      });

      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("type=submit 设置正确", () => {
      const wrapper = mount(BaseButton, {
        props: { type: "submit" },
      });

      expect(wrapper.find("button").attributes("type")).toBe("submit");
    });

    it("type=reset 设置正确", () => {
      const wrapper = mount(BaseButton, {
        props: { type: "reset" },
      });

      expect(wrapper.find("button").attributes("type")).toBe("reset");
    });

    it("默认 type 为 button", () => {
      const wrapper = mount(BaseButton);

      expect(wrapper.find("button").attributes("type")).toBe("button");
    });
  });

  describe("组合测试", () => {
    it("variant + size 组合：outline + lg", () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: "outline",
          size: "lg",
        },
      });

      const button = wrapper.find("button");
      expect(button.classes()).toContain("btn--outline");
      expect(button.classes()).toContain("btn--lg");
    });

    it("variant + size + disabled 组合", () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: "ghost",
          size: "sm",
          disabled: true,
        },
      });

      const button = wrapper.find("button");
      expect(button.classes()).toContain("btn--ghost");
      expect(button.classes()).toContain("btn--sm");
      expect(button.attributes("disabled")).toBeDefined();
    });
  });

  describe("slot 内容", () => {
    it("支持文本内容", () => {
      const wrapper = mount(BaseButton, {
        slots: { default: "按钮文字" },
      });

      expect(wrapper.text()).toBe("按钮文字");
    });

    it("支持 HTML 内容", () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: '<span class="icon">图标</span> 文字',
        },
      });

      expect(wrapper.find(".icon").exists()).toBe(true);
      expect(wrapper.text()).toContain("图标");
      expect(wrapper.text()).toContain("文字");
    });

    it("支持空内容", () => {
      const wrapper = mount(BaseButton);

      expect(wrapper.text()).toBe("");
    });
  });
});
