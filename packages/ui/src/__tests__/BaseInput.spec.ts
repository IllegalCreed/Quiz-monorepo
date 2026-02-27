/**
 * BaseInput 组件单元测试
 *
 * 测试目标：
 * - v-model 双向绑定
 * - label 渲染与 for 关联
 * - error 状态与提示文字
 * - password 可见切换
 * - disabled 禁用状态
 * - size 尺寸修饰符
 * - placeholder 属性
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BaseInput from "../components/BaseInput.vue";

describe("BaseInput 输入框组件", () => {
  // ── 基础渲染 ──────────────────────────────────────────────────

  it("正确渲染 input 元素", () => {
    const wrapper = mount(BaseInput);

    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find(".input").exists()).toBe(true);
  });

  it("默认 type 为 text", () => {
    const wrapper = mount(BaseInput);

    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  // ── v-model ──────────────────────────────────────────────────

  describe("v-model 双向绑定", () => {
    it("modelValue 传入时设置 input value", () => {
      const wrapper = mount(BaseInput, {
        props: { modelValue: "hello" },
      });

      expect(wrapper.find("input").element.value).toBe("hello");
    });

    it("输入时触发 update:modelValue", async () => {
      const wrapper = mount(BaseInput, {
        props: { modelValue: "" },
      });

      await wrapper.find("input").setValue("world");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["world"]);
    });
  });

  // ── label ────────────────────────────────────────────────────

  describe("label", () => {
    it("传入 label 时渲染标签文字", () => {
      const wrapper = mount(BaseInput, {
        props: { label: "用户名" },
      });

      expect(wrapper.find(".input__label").text()).toBe("用户名");
    });

    it("label 通过 for 属性关联 input", () => {
      const wrapper = mount(BaseInput, {
        props: { label: "邮箱" },
      });

      const label = wrapper.find(".input__label");
      const input = wrapper.find("input");
      expect(label.attributes("for")).toBe(input.attributes("id"));
    });

    it("不传 label 时不渲染标签", () => {
      const wrapper = mount(BaseInput);

      expect(wrapper.find(".input__label").exists()).toBe(false);
    });
  });

  // ── error ────────────────────────────────────────────────────

  describe("error 错误状态", () => {
    it("传入 error 时显示错误提示", () => {
      const wrapper = mount(BaseInput, {
        props: { error: "请输入有效邮箱" },
      });

      expect(wrapper.find(".input__error").text()).toBe("请输入有效邮箱");
    });

    it("error 元素有 role=alert", () => {
      const wrapper = mount(BaseInput, {
        props: { error: "错误" },
      });

      expect(wrapper.find(".input__error").attributes("role")).toBe("alert");
    });

    it("有 error 时添加 input--error 修饰类", () => {
      const wrapper = mount(BaseInput, {
        props: { error: "错误" },
      });

      expect(wrapper.find(".input").classes()).toContain("input--error");
    });

    it("无 error 时不显示错误提示", () => {
      const wrapper = mount(BaseInput);

      expect(wrapper.find(".input__error").exists()).toBe(false);
      expect(wrapper.find(".input").classes()).not.toContain("input--error");
    });
  });

  // ── password ──────────────────────────────────────────────────

  describe("password 密码切换", () => {
    it("type=password 时显示切换按钮", () => {
      const wrapper = mount(BaseInput, {
        props: { type: "password" },
      });

      expect(wrapper.find(".input__toggle").exists()).toBe(true);
    });

    it("type=text 时不显示切换按钮", () => {
      const wrapper = mount(BaseInput, {
        props: { type: "text" },
      });

      expect(wrapper.find(".input__toggle").exists()).toBe(false);
    });

    it("默认密码不可见（type=password）", () => {
      const wrapper = mount(BaseInput, {
        props: { type: "password" },
      });

      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("点击切换按钮后密码可见（type 变为 text）", async () => {
      const wrapper = mount(BaseInput, {
        props: { type: "password" },
      });

      await wrapper.find(".input__toggle").trigger("click");

      expect(wrapper.find("input").attributes("type")).toBe("text");
    });

    it("再次点击后密码隐藏（恢复 password）", async () => {
      const wrapper = mount(BaseInput, {
        props: { type: "password" },
      });

      await wrapper.find(".input__toggle").trigger("click");
      await wrapper.find(".input__toggle").trigger("click");

      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("切换按钮有正确的 aria-label", async () => {
      const wrapper = mount(BaseInput, {
        props: { type: "password" },
      });

      // 初始：隐藏 → aria-label 为「显示密码」
      expect(wrapper.find(".input__toggle").attributes("aria-label")).toBe(
        "显示密码",
      );

      // 点击后：可见 → aria-label 变为「隐藏密码」
      await wrapper.find(".input__toggle").trigger("click");
      expect(wrapper.find(".input__toggle").attributes("aria-label")).toBe(
        "隐藏密码",
      );
    });
  });

  // ── disabled ──────────────────────────────────────────────────

  describe("disabled 禁用状态", () => {
    it("disabled=true 时 input 不可编辑", () => {
      const wrapper = mount(BaseInput, {
        props: { disabled: true },
      });

      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("disabled=true 时添加 input--disabled 修饰类", () => {
      const wrapper = mount(BaseInput, {
        props: { disabled: true },
      });

      expect(wrapper.find(".input").classes()).toContain("input--disabled");
    });

    it("默认不禁用", () => {
      const wrapper = mount(BaseInput);

      expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
      expect(wrapper.find(".input").classes()).not.toContain("input--disabled");
    });
  });

  // ── size 尺寸 ──────────────────────────────────────────────────

  describe("size 尺寸", () => {
    it("默认 size 为 md", () => {
      const wrapper = mount(BaseInput);

      expect(wrapper.find(".input").classes()).toContain("input--md");
    });

    it("sm 尺寸", () => {
      const wrapper = mount(BaseInput, {
        props: { size: "sm" },
      });

      expect(wrapper.find(".input").classes()).toContain("input--sm");
    });

    it("lg 尺寸", () => {
      const wrapper = mount(BaseInput, {
        props: { size: "lg" },
      });

      expect(wrapper.find(".input").classes()).toContain("input--lg");
    });
  });

  // ── placeholder ───────────────────────────────────────────────

  describe("placeholder", () => {
    it("正确设置 placeholder 属性", () => {
      const wrapper = mount(BaseInput, {
        props: { placeholder: "请输入..." },
      });

      expect(wrapper.find("input").attributes("placeholder")).toBe("请输入...");
    });
  });

  // ── type ──────────────────────────────────────────────────────

  describe("type 输入类型", () => {
    it("type=email 设置正确", () => {
      const wrapper = mount(BaseInput, {
        props: { type: "email" },
      });

      expect(wrapper.find("input").attributes("type")).toBe("email");
    });
  });
});
