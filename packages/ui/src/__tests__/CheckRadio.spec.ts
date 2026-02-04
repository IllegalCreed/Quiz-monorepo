/**
 * CheckRadio & CheckRadioGroup 组件单元测试
 *
 * 测试目标：
 * - CheckRadio：点击事件、禁用状态、状态样式（correct/incorrect/none）、描述文本渲染
 * - CheckRadioGroup：v-model 双向绑定、单次答题模式、正确答案标记、禁用整组
 *
 * 覆盖分支：
 * - onActivate 的 disabled 早返回
 * - computeStatus 的各种组合（无 correctValue、有 correctValue、已选/未选）
 * - status 为 null 时的默认处理
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import CheckRadioGroup from "../components/CheckRadioGroup.vue";
import CheckRadio from "../components/CheckRadio.vue";

describe("CheckRadio 单选按钮组件", () => {
  it("点击触发 select 事件并携带 value", async () => {
    // 准备：挂载单个 CheckRadio
    const wrapper = mount(CheckRadio, {
      props: { value: "opt-a", label: "选项 A" },
    });

    // 执行：点击按钮
    await wrapper.find("button").trigger("click");

    // 断言：select 事件被触发且携带正确的 value
    expect(wrapper.emitted("select")).toHaveLength(1);
    expect(wrapper.emitted("select")?.[0]).toEqual(["opt-a"]);
  });

  it("禁用状态：不触发事件且显示禁用样式", async () => {
    // 准备：挂载禁用的 CheckRadio
    const wrapper = mount(CheckRadio, {
      props: { value: "x", label: "禁用项", disabled: true },
    });

    // 断言：按钮有 disabled 属性，根节点有禁用样式
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    expect(wrapper.find("label").classes()).toContain("radio--disabled");

    // 执行：尝试点击（由于 button 的 disabled 属性，浏览器会阻止点击）
    await wrapper.find("button").trigger("click");

    // 断言：不触发 select 事件（disabled button 原生阻止 click 事件）
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("状态样式：correct/incorrect/none 对应不同类名", () => {
    // 测试 correct 状态
    const wCorrect = mount(CheckRadio, {
      props: { value: "c", status: "correct" },
    });
    expect(wCorrect.find("label").classes()).toContain("radio--correct");
    expect(wCorrect.find("button").classes()).toContain("radio--correct");

    // 测试 incorrect 状态
    const wIncorrect = mount(CheckRadio, {
      props: { value: "i", status: "incorrect" },
    });
    expect(wIncorrect.find("label").classes()).toContain("radio--incorrect");
    expect(wIncorrect.find("button").classes()).toContain("radio--incorrect");

    // 测试 null 状态（应等同于 none，无特殊类名）
    const wNull = mount(CheckRadio, {
      props: { value: "n", status: null } as {
        value: string | number;
        status: "none" | "correct" | "incorrect" | null;
      },
    });
    expect(wNull.find("label").classes()).not.toContain("radio--correct");
    expect(wNull.find("label").classes()).not.toContain("radio--incorrect");
  });

  it("描述文本：传入 description 时正确渲染", () => {
    // 准备：挂载带描述的 CheckRadio
    const wrapper = mount(CheckRadio, {
      props: { value: "d", label: "带描述", description: "这是一段描述文字" },
    });

    // 断言：描述元素存在且内容正确
    const desc = wrapper.find(".radio__desc");
    expect(desc.exists()).toBe(true);
    expect(desc.text()).toBe("这是一段描述文字");
  });
});

describe("CheckRadioGroup 单选组组件", () => {
  /** 通用选项数据 */
  const baseOptions = [
    { value: "a", label: "选项 A" },
    { value: "b", label: "选项 B" },
    { value: "c", label: "选项 C" },
  ];

  it("点击选项更新 v-model", async () => {
    // 准备：挂载组件，v-model 初始为 null
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    // 执行：点击第二个选项
    const radios = wrapper.findAllComponents(CheckRadio);
    await radios[1].find("button").trigger("click");

    // 断言：v-model 更新为 'b'
    expect(wrapper.vm.selected).toBe("b");
  });

  it("单次答题模式：已选后再点击其他选项不改变值", async () => {
    // 准备：挂载组件，v-model 初始为 null
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const radios = wrapper.findAllComponents(CheckRadio);

    // 执行：先点击第一个选项
    await radios[0].find("button").trigger("click");
    expect(wrapper.vm.selected).toBe("a");

    // 执行：再点击第二个选项
    await radios[1].find("button").trigger("click");

    // 断言：值保持不变（单次答题模式）
    expect(wrapper.vm.selected).toBe("a");
  });

  it("正确答案标记：选错时显示 correct/incorrect 样式", async () => {
    // 准备：挂载组件，设置正确答案为 'b'
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    // 执行：选择错误答案 'a'
    const radios = wrapper.findAll(".radio");
    await radios[0].find("button").trigger("click");
    await wrapper.vm.$nextTick();

    // 断言：选项 a 显示 incorrect，选项 b 显示 correct，选项 c 无特殊样式
    expect(radios[0].classes()).toContain("radio--incorrect");
    expect(radios[1].classes()).toContain("radio--correct");
    expect(radios[2].classes()).not.toContain("radio--correct");
    expect(radios[2].classes()).not.toContain("radio--incorrect");
  });

  it("已有初始值时 computeStatus 正确计算状态", () => {
    // 准备：挂载组件，v-model 初始为 'a'，正确答案为 'b'
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: "a", opts: baseOptions }),
    });

    // 断言：初始状态下各选项样式正确
    const radios = wrapper.findAll(".radio");
    expect(radios[0].classes()).toContain("radio--incorrect"); // 已选但错误
    expect(radios[1].classes()).toContain("radio--correct"); // 正确答案
    expect(radios[2].classes()).not.toContain("radio--correct"); // 未选且非正确
  });

  it("禁用整组：所有选项不可点击且显示禁用样式", async () => {
    // 准备：挂载禁用的组件
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :disabled="true" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const radios = wrapper.findAll(".radio");

    // 断言：所有选项都有禁用样式
    expect(radios[0].classes()).toContain("radio--disabled");
    expect(radios[1].classes()).toContain("radio--disabled");

    // 执行：尝试点击
    await radios[0].find("button").trigger("click");

    // 断言：v-model 保持 null
    expect(wrapper.vm.selected).toBeNull();
  });
});
