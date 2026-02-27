/**
 * BasePopover 组件单元测试
 *
 * 测试目标：
 * - 点击 trigger 切换显示
 * - 点击外部关闭
 * - Esc 键关闭
 * - placement 定位修饰符
 * - offset 间距
 * - slot 渲染
 */
import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, afterEach } from "vitest";
import BasePopover from "../components/BasePopover.vue";

/**
 * 辅助：挂载 BasePopover
 */
function mountPopover(props: Record<string, unknown> = {}) {
  return mount(BasePopover, {
    props,
    slots: {
      trigger: '<button class="trigger-btn">触发</button>',
      default: '<div class="popover-body">弹出内容</div>',
    },
    attachTo: document.body,
  });
}

describe("BasePopover 弹出面板组件", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── 基础渲染 ──────────────────────────────────────────────────

  it("初始不渲染弹出内容", () => {
    const wrapper = mountPopover();

    expect(wrapper.find(".popover__content").exists()).toBe(false);
    expect(wrapper.find(".trigger-btn").exists()).toBe(true);
  });

  it("渲染 trigger slot 内容", () => {
    const wrapper = mountPopover();

    expect(wrapper.find(".popover__trigger").exists()).toBe(true);
    expect(wrapper.find(".trigger-btn").text()).toBe("触发");
  });

  // ── 点击切换 ──────────────────────────────────────────────────

  describe("点击切换", () => {
    it("点击 trigger 显示弹出内容", async () => {
      const wrapper = mountPopover();

      await wrapper.find(".popover__trigger").trigger("click");

      expect(wrapper.find(".popover__content").exists()).toBe(true);
      expect(wrapper.find(".popover-body").text()).toBe("弹出内容");
    });

    it("再次点击 trigger 关闭弹出内容", async () => {
      const wrapper = mountPopover();

      await wrapper.find(".popover__trigger").trigger("click");
      expect(wrapper.find(".popover__content").exists()).toBe(true);

      await wrapper.find(".popover__trigger").trigger("click");
      expect(wrapper.find(".popover__content").exists()).toBe(false);
    });
  });

  // ── 点击外部关闭 ─────────────────────────────────────────────

  describe("点击外部关闭", () => {
    it("点击 popover 外部区域关闭面板", async () => {
      const wrapper = mountPopover();

      // 打开
      await wrapper.find(".popover__trigger").trigger("click");
      expect(wrapper.find(".popover__content").exists()).toBe(true);

      // 点击外部
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      expect(wrapper.find(".popover__content").exists()).toBe(false);
    });

    it("点击弹出面板内部不关闭", async () => {
      const wrapper = mountPopover();

      // 打开
      await wrapper.find(".popover__trigger").trigger("click");

      // 点击面板内容（事件冒泡到 popover 容器内部，onClickOutside 不触发）
      await wrapper.find(".popover-body").trigger("click");

      expect(wrapper.find(".popover__content").exists()).toBe(true);
    });
  });

  // ── Esc 键关闭 ────────────────────────────────────────────────

  describe("Esc 键关闭", () => {
    it("按 Esc 关闭弹出面板", async () => {
      const wrapper = mountPopover();

      // 打开
      await wrapper.find(".popover__trigger").trigger("click");
      expect(wrapper.find(".popover__content").exists()).toBe(true);

      // 按 Esc
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      expect(wrapper.find(".popover__content").exists()).toBe(false);
    });

    it("未打开时按 Esc 无副作用", async () => {
      const wrapper = mountPopover();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      expect(wrapper.find(".popover__content").exists()).toBe(false);
    });
  });

  // ── placement 定位 ───────────────────────────────────────────

  describe("placement 定位", () => {
    it("默认 bottom-end", async () => {
      const wrapper = mountPopover();

      await wrapper.find(".popover__trigger").trigger("click");

      expect(wrapper.find(".popover__content--bottom-end").exists()).toBe(true);
    });

    it("bottom-start", async () => {
      const wrapper = mountPopover({ placement: "bottom-start" });

      await wrapper.find(".popover__trigger").trigger("click");

      expect(wrapper.find(".popover__content--bottom-start").exists()).toBe(
        true,
      );
    });

    it("top-end", async () => {
      const wrapper = mountPopover({ placement: "top-end" });

      await wrapper.find(".popover__trigger").trigger("click");

      expect(wrapper.find(".popover__content--top-end").exists()).toBe(true);
    });

    it("top-start", async () => {
      const wrapper = mountPopover({ placement: "top-start" });

      await wrapper.find(".popover__trigger").trigger("click");

      expect(wrapper.find(".popover__content--top-start").exists()).toBe(true);
    });
  });

  // ── offset 间距 ──────────────────────────────────────────────

  describe("offset 间距", () => {
    it("默认 offset=4，bottom 方向设置 margin-top", async () => {
      const wrapper = mountPopover();

      await wrapper.find(".popover__trigger").trigger("click");

      const content = wrapper.find(".popover__content");
      expect(content.attributes("style")).toContain("margin-top: 4px");
    });

    it("自定义 offset=8", async () => {
      const wrapper = mountPopover({ offset: 8 });

      await wrapper.find(".popover__trigger").trigger("click");

      const content = wrapper.find(".popover__content");
      expect(content.attributes("style")).toContain("margin-top: 8px");
    });

    it("top 方向设置 margin-bottom", async () => {
      const wrapper = mountPopover({ placement: "top-end", offset: 6 });

      await wrapper.find(".popover__trigger").trigger("click");

      const content = wrapper.find(".popover__content");
      expect(content.attributes("style")).toContain("margin-bottom: 6px");
    });
  });

  // ── expose ───────────────────────────────────────────────────

  describe("expose", () => {
    it("暴露 visible 和 close 方法", async () => {
      const wrapper = mountPopover();

      // 通过 expose 的 close 关闭
      await wrapper.find(".popover__trigger").trigger("click");
      expect(wrapper.vm.visible).toBe(true);

      wrapper.vm.close();
      await flushPromises();

      expect(wrapper.vm.visible).toBe(false);
    });
  });
});
