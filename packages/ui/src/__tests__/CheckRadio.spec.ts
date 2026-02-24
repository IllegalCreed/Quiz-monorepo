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
import { mount, flushPromises } from "@vue/test-utils";
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

  it("Slot：使用 label 和 description 插槽自定义内容", () => {
    // 准备：挂载使用 slot 的 CheckRadio
    const wrapper = mount(CheckRadio, {
      props: { value: "slot-test" },
      slots: {
        label: "<strong>自定义标签</strong>",
        description: "<em>自定义描述内容</em>",
      },
    });

    // 断言：slot 内容正确渲染
    expect(wrapper.find(".radio__label strong").exists()).toBe(true);
    expect(wrapper.find(".radio__label").text()).toBe("自定义标签");

    // 断言：description slot 存在时，描述区域应该渲染（覆盖 $slots.description 分支）
    const desc = wrapper.find(".radio__desc");
    expect(desc.exists()).toBe(true);
    expect(desc.find("em").exists()).toBe(true);
    expect(desc.text()).toBe("自定义描述内容");
  });

  it("Slot：仅使用 description 插槽（无 description prop）", () => {
    // 准备：只传 description slot，不传 description prop
    const wrapper = mount(CheckRadio, {
      props: { value: "slot-only", label: "普通标签" },
      slots: {
        description: "通过 slot 提供的描述",
      },
    });

    // 断言：$slots.description 分支被覆盖
    const desc = wrapper.find(".radio__desc");
    expect(desc.exists()).toBe(true);
    expect(desc.text()).toBe("通过 slot 提供的描述");
  });

  it("动态 description：watch 响应式更新（覆盖 watch + nextTick 分支）", async () => {
    // 准备：挂载初始无描述的 CheckRadio
    const wrapper = mount(CheckRadio, {
      props: { value: "dynamic", label: "动态描述测试" },
    });

    // 断言：初始无描述内容
    const desc = wrapper.find(".radio__desc");
    expect(desc.exists()).toBe(true);
    expect(desc.text()).toBe("");

    // 执行：动态添加描述（触发 watch + nextTick 分支）
    await wrapper.setProps({
      description: "这是动态添加的描述文字，用于测试高度计算",
    });
    await flushPromises(); // 等待 watch 中的 nextTick 执行

    // 断言：描述内容已更新
    expect(desc.text()).toContain("这是动态添加的描述文字");

    // 执行：修改描述内容（再次触发 watch + nextTick 分支）
    await wrapper.setProps({ description: "更新后的描述内容" });
    await flushPromises();

    // 断言：内容已更新
    expect(desc.text()).toContain("更新后的描述内容");

    // 执行：移除描述（触发高度归零分支）
    await wrapper.setProps({ description: undefined });
    await flushPromises();

    // 断言：描述内容已清空
    expect(desc.text()).toBe("");
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
      template: `<CheckRadioGroup v-model="selected" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    // 执行：点击第二个选项（选择正确答案 'b'）
    const radios = wrapper.findAllComponents(CheckRadio);
    await radios[1].find("button").trigger("click");

    // 断言：通过 DOM 状态验证选择生效（黑盒方式）
    // 选项 B 应该显示 correct 样式
    expect(wrapper.findAll(".radio")[1].classes()).toContain("radio--correct");
  });

  it("单次答题模式：已选后再点击其他选项不改变值", async () => {
    // 准备：挂载组件，v-model 初始为 null，正确答案为 'b'
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const radios = wrapper.findAllComponents(CheckRadio);

    // 执行：先点击第一个选项（选择错误答案 'a'）
    await radios[0].find("button").trigger("click");
    // 断言：选项 A 显示 incorrect 样式（黑盒验证已选中）
    expect(wrapper.findAll(".radio")[0].classes()).toContain(
      "radio--incorrect",
    );

    // 执行：再点击第二个选项
    await radios[1].find("button").trigger("click");

    // 断言：选项 A 仍然是 incorrect（值保持不变，单次答题模式）
    expect(wrapper.findAll(".radio")[0].classes()).toContain(
      "radio--incorrect",
    );
    // 选项 B 仍然是 correct（但未被选中为用户答案）
    expect(wrapper.findAll(".radio")[1].classes()).toContain("radio--correct");
  });

  // 键盘导航测试放在 Storybook 浏览器测试中（jsdom 的 focus 行为有限制）

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
      template: `<CheckRadioGroup v-model="selected" :options="opts" :disabled="true" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const radios = wrapper.findAll(".radio");

    // 断言：所有选项都有禁用样式
    expect(radios[0].classes()).toContain("radio--disabled");
    expect(radios[1].classes()).toContain("radio--disabled");

    // 执行：尝试点击
    await radios[0].find("button").trigger("click");

    // 断言：通过 DOM 验证没有任何选项被选中（黑盒方式）
    // 所有选项都不应有 correct/incorrect 样式（因为 selected 仍为 null）
    expect(radios[0].classes()).not.toContain("radio--incorrect");
    expect(radios[1].classes()).not.toContain("radio--correct");
  });

  it("键盘导航：disabled 时 keydown 不执行任何操作", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :disabled="true" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const group = wrapper.find(".radio-group");

    // 触发 keydown（disabled 时应该早返回）
    await group.trigger("keydown", { key: "ArrowRight" });

    // 断言：没有任何变化（覆盖 disabled 分支）
    expect(wrapper.findAll(".radio")[0].classes()).not.toContain(
      "radio--incorrect",
    );
  });

  it("键盘导航：空 refs 列表时 keydown 不执行任何操作", async () => {
    // 挂载一个空选项的组件
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="[]" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null }),
    });

    const group = wrapper.find(".radio-group");

    // 触发 keydown（空列表时应该早返回）
    await group.trigger("keydown", { key: "ArrowRight" });

    // 断言：没有报错，覆盖空列表分支
    expect(group.exists()).toBe(true);
  });

  it("键盘导航：非方向键不触发导航", async () => {
    const wrapper = mount({
      template: `<CheckRadioGroup v-model="selected" :options="opts" :correctValue="'b'" />`,
      components: { CheckRadioGroup },
      data: () => ({ selected: null, opts: baseOptions }),
    });

    const group = wrapper.find(".radio-group");

    // 触发非方向键（应该不做任何处理）
    await group.trigger("keydown", { key: "Tab" });
    await group.trigger("keydown", { key: "Escape" });

    // 断言：没有任何选项被选中
    expect(wrapper.findAll(".radio")[0].classes()).not.toContain(
      "radio--incorrect",
    );
  });

  it("键盘导航：ArrowRight 移动焦点到下一个选项", async () => {
    // 挂载到真实 DOM 以便 focus 生效
    const wrapper = mount(CheckRadioGroup, {
      props: { modelValue: null, options: baseOptions },
      attachTo: document.body,
    });

    const buttons = wrapper.findAll("button");

    // 聚焦第一个按钮
    (buttons[0].element as HTMLElement).focus();
    await wrapper.vm.$nextTick();

    // 触发 ArrowRight
    await wrapper
      .find(".radio-group")
      .trigger("keydown", { key: "ArrowRight" });

    // 断言：焦点移动到第二个按钮
    expect(
      buttons[1].element.contains(document.activeElement) ||
        document.activeElement === buttons[1].element,
    ).toBe(true);

    wrapper.unmount();
  });

  it("键盘导航：ArrowDown 移动焦点到下一个选项", async () => {
    const wrapper = mount(CheckRadioGroup, {
      props: { modelValue: null, options: baseOptions },
      attachTo: document.body,
    });

    const buttons = wrapper.findAll("button");

    (buttons[0].element as HTMLElement).focus();
    await wrapper.vm.$nextTick();

    await wrapper.find(".radio-group").trigger("keydown", { key: "ArrowDown" });

    expect(
      buttons[1].element.contains(document.activeElement) ||
        document.activeElement === buttons[1].element,
    ).toBe(true);

    wrapper.unmount();
  });

  it("键盘导航：ArrowLeft 移动焦点到上一个选项（循环）", async () => {
    const wrapper = mount(CheckRadioGroup, {
      props: { modelValue: null, options: baseOptions },
      attachTo: document.body,
    });

    const buttons = wrapper.findAll("button");

    // 聚焦第一个按钮，按 ArrowLeft 应该循环到最后一个
    (buttons[0].element as HTMLElement).focus();
    await wrapper.vm.$nextTick();

    await wrapper.find(".radio-group").trigger("keydown", { key: "ArrowLeft" });

    expect(
      buttons[2].element.contains(document.activeElement) ||
        document.activeElement === buttons[2].element,
    ).toBe(true);

    wrapper.unmount();
  });

  it("键盘导航：ArrowUp 移动焦点到上一个选项", async () => {
    const wrapper = mount(CheckRadioGroup, {
      props: { modelValue: null, options: baseOptions },
      attachTo: document.body,
    });

    const buttons = wrapper.findAll("button");

    // 聚焦第二个按钮，按 ArrowUp 应该到第一个
    (buttons[1].element as HTMLElement).focus();
    await wrapper.vm.$nextTick();

    await wrapper.find(".radio-group").trigger("keydown", { key: "ArrowUp" });

    expect(
      buttons[0].element.contains(document.activeElement) ||
        document.activeElement === buttons[0].element,
    ).toBe(true);

    wrapper.unmount();
  });

  it("键盘导航：焦点不在组件内时不执行导航", async () => {
    const wrapper = mount(
      {
        template: `<CheckRadioGroup v-model="selected" :options="opts" />`,
        components: { CheckRadioGroup },
        data: () => ({ selected: null, opts: baseOptions }),
      },
      { attachTo: document.body },
    );

    const group = wrapper.find(".radio-group");

    // 不聚焦任何按钮，直接触发 keydown
    document.body.focus();
    await group.trigger("keydown", { key: "ArrowRight" });

    // 断言：没有报错，idx === -1 分支被覆盖
    expect(group.exists()).toBe(true);

    wrapper.unmount();
  });
});
