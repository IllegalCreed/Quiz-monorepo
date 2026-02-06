/**
 * Card 组件系列单元测试
 *
 * 测试目标：
 * - Card：基础卡片容器渲染
 * - CardHeader：divided 样式、slot 渲染
 * - CardContent：基础内容区渲染
 */
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Card from "../components/Card.vue";
import CardHeader from "../components/CardHeader.vue";
import CardContent from "../components/CardContent.vue";

describe("Card 卡片容器组件", () => {
  it("正确渲染基础结构和 slot 内容", () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div class="test-content">卡片内容</div>',
      },
    });

    const card = wrapper.find(".card");

    // 断言：根元素有 card 类名
    expect(card.exists()).toBe(true);

    // 断言：slot 内容正确渲染
    expect(wrapper.find(".test-content").exists()).toBe(true);
    expect(wrapper.text()).toBe("卡片内容");
  });

  it("组合使用 CardHeader 和 CardContent", () => {
    const wrapper = mount(Card, {
      slots: {
        default: `
          <CardHeader>标题</CardHeader>
          <CardContent>内容</CardContent>
        `,
      },
      global: {
        components: { CardHeader, CardContent },
      },
    });

    // 断言：子组件正确渲染
    expect(wrapper.findComponent(CardHeader).exists()).toBe(true);
    expect(wrapper.findComponent(CardContent).exists()).toBe(true);
  });
});

describe("CardHeader 卡片头部组件", () => {
  it("正确渲染基础结构和 slot 内容", () => {
    const wrapper = mount(CardHeader, {
      slots: {
        default: "<h3>卡片标题</h3>",
      },
    });

    const header = wrapper.find(".card-header");

    // 断言：根元素有 card-header 类名
    expect(header.exists()).toBe(true);

    // 断言：slot 内容正确渲染
    expect(wrapper.find("h3").exists()).toBe(true);
    expect(wrapper.text()).toBe("卡片标题");
  });

  it("divided=false 时不显示分割线样式", () => {
    const wrapper = mount(CardHeader, {
      props: { divided: false },
      slots: { default: "标题" },
    });

    const header = wrapper.find(".card-header");

    // 断言：没有 card-header--divided 类名
    expect(header.classes()).not.toContain("card-header--divided");
  });

  it("divided=true 时显示分割线样式", () => {
    const wrapper = mount(CardHeader, {
      props: { divided: true },
      slots: { default: "标题" },
    });

    const header = wrapper.find(".card-header");

    // 断言：有 card-header--divided 类名
    expect(header.classes()).toContain("card-header--divided");
  });

  it("默认 divided 为 false", () => {
    const wrapper = mount(CardHeader, {
      slots: { default: "标题" },
    });

    const header = wrapper.find(".card-header");

    // 断言：默认不显示分割线
    expect(header.classes()).not.toContain("card-header--divided");
  });
});

describe("CardContent 卡片内容组件", () => {
  it("正确渲染基础结构和 slot 内容", () => {
    const wrapper = mount(CardContent, {
      slots: {
        default: "<p>这是卡片内容</p>",
      },
    });

    const content = wrapper.find(".card-content");

    // 断言：根元素有 card-content 类名
    expect(content.exists()).toBe(true);

    // 断言：slot 内容正确渲染
    expect(wrapper.find("p").exists()).toBe(true);
    expect(wrapper.text()).toBe("这是卡片内容");
  });

  it("支持复杂的嵌套内容", () => {
    const wrapper = mount(CardContent, {
      slots: {
        default: `
          <div>
            <p>段落1</p>
            <ul>
              <li>列表项1</li>
              <li>列表项2</li>
            </ul>
          </div>
        `,
      },
    });

    // 断言：复杂内容正确渲染
    expect(wrapper.find("p").text()).toBe("段落1");
    expect(wrapper.findAll("li")).toHaveLength(2);
  });
});
