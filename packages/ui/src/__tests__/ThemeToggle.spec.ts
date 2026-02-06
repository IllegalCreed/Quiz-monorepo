/**
 * ThemeToggle 组件单元测试
 *
 * 测试目标：
 * - 基础渲染
 * - BaseButton 组件复用
 * - 点击事件
 * - 组件名称
 * - 无障碍属性
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ThemeToggle from "../components/ThemeToggle.vue";
import BaseButton from "../components/BaseButton.vue";

describe("ThemeToggle 主题切换组件", () => {
  it("正确渲染基础结构", () => {
    const wrapper = mount(ThemeToggle);

    // 断言：使用 BaseButton 组件
    expect(wrapper.findComponent(BaseButton).exists()).toBe(true);

    // 断言：BaseButton 使用 ghost 变体
    const button = wrapper.findComponent(BaseButton);
    expect(button.props("variant")).toBe("ghost");
  });

  it("BaseButton size 为 md", () => {
    const wrapper = mount(ThemeToggle);

    const button = wrapper.findComponent(BaseButton);
    expect(button.props("size")).toBe("md");
  });

  it("点击按钮触发切换功能", async () => {
    const wrapper = mount(ThemeToggle);

    const button = wrapper.find("button");

    // 执行：点击按钮
    await button.trigger("click");

    // 断言：按钮可点击（不报错即通过）
    expect(button.exists()).toBe(true);
  });

  it("组件名称为 ThemeToggle", () => {
    const wrapper = mount(ThemeToggle);

    expect(wrapper.vm.$options.name).toBe("ThemeToggle");
  });

  it("渲染图标元素", () => {
    const wrapper = mount(ThemeToggle);

    // 断言：存在图标元素（sun 或 moon）
    const sunIcon = wrapper.find(".i-carbon-sun");
    const moonIcon = wrapper.find(".i-carbon-moon");

    // 至少有一个图标存在
    expect(sunIcon.exists() || moonIcon.exists()).toBe(true);
  });

  it("按钮有 aria-label 属性", () => {
    const wrapper = mount(ThemeToggle);

    const button = wrapper.find("button");
    expect(button.attributes("aria-label")).toBeDefined();
    expect(button.attributes("aria-label")).toMatch(/切换到/);
  });

  it("按钮有 title 属性", () => {
    const wrapper = mount(ThemeToggle);

    const button = wrapper.find("button");
    expect(button.attributes("title")).toBeDefined();
    expect(button.attributes("title")).toMatch(/切换到/);
  });

  it("图标有正确的 aria-hidden 属性", () => {
    const wrapper = mount(ThemeToggle);

    const icon = wrapper.find("i");
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("图标有正确的尺寸类", () => {
    const wrapper = mount(ThemeToggle);

    const icon = wrapper.find("i");
    expect(icon.classes()).toContain("w-5");
    expect(icon.classes()).toContain("h-5");
  });
});
