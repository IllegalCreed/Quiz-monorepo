/**
 * BaseDialog 组件单元测试
 *
 * 测试目标：
 * - placement 模式：center、right、left
 * - v-model 双向绑定
 * - title / closable / closeOnOverlay / closeOnEsc 行为
 * - slot 渲染：header / default / footer
 * - body 滚动锁定
 * - Esc 键关闭
 * - 遮罩点击关闭
 */
import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import BaseDialog from "../components/BaseDialog.vue";

/**
 * 辅助：挂载 BaseDialog 并等待 Teleport 渲染到 body
 *
 * @remarks
 * BaseDialog 使用 Teleport to="body"，需要 attachTo 让 DOM 真实挂载
 */
function mountDialog(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  return mount(BaseDialog, {
    props: {
      modelValue: true,
      ...props,
    },
    slots,
    attachTo: document.body,
  });
}

describe("BaseDialog 对话框/抽屉组件", () => {
  /** 每次测试后清理 body 上残留的 DOM */
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  // ── 基础渲染 ──────────────────────────────────────────────────

  it("modelValue=true 时渲染遮罩和面板", () => {
    mountDialog();

    expect(document.querySelector(".dialog-overlay")).toBeTruthy();
    expect(document.querySelector(".dialog")).toBeTruthy();
  });

  it("modelValue=false 时不渲染内容", () => {
    mountDialog({ modelValue: false });

    expect(document.querySelector(".dialog-overlay")).toBeFalsy();
    expect(document.querySelector(".dialog")).toBeFalsy();
  });

  it("设置 role=dialog 和 aria-modal=true", () => {
    mountDialog();

    const panel = document.querySelector(".dialog");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
  });

  it("面板支持程序化聚焦，滚动内容区支持键盘聚焦", () => {
    mountDialog();

    const panel = document.querySelector(".dialog");
    const body = document.querySelector(".dialog__body");

    expect(panel?.getAttribute("tabindex")).toBe("-1");
    expect(body?.getAttribute("tabindex")).toBe("0");
  });

  // ── placement 模式 ───────────────────────────────────────────

  describe("placement 模式", () => {
    it("默认 center 模式：遮罩和面板使用 --center 修饰符", () => {
      mountDialog();

      expect(document.querySelector(".dialog-overlay--center")).toBeTruthy();
      expect(document.querySelector(".dialog--center")).toBeTruthy();
    });

    it("right 模式：遮罩和面板使用 --right 修饰符", () => {
      mountDialog({ placement: "right" });

      expect(document.querySelector(".dialog-overlay--right")).toBeTruthy();
      expect(document.querySelector(".dialog--right")).toBeTruthy();
    });

    it("left 模式：遮罩和面板使用 --left 修饰符", () => {
      mountDialog({ placement: "left" });

      expect(document.querySelector(".dialog-overlay--left")).toBeTruthy();
      expect(document.querySelector(".dialog--left")).toBeTruthy();
    });
  });

  // ── title & header ────────────────────────────────────────────

  describe("title 与 header", () => {
    it("传入 title 时渲染标题文字", () => {
      mountDialog({ title: "测试标题" });

      const title = document.querySelector(".dialog__title");
      expect(title?.textContent).toBe("测试标题");
    });

    it("设置 aria-label 为 title 值", () => {
      mountDialog({ title: "无障碍标题" });

      const panel = document.querySelector(".dialog");
      expect(panel?.getAttribute("aria-label")).toBe("无障碍标题");
    });

    it("不传 title 且无 header slot 时不渲染 header 区域", () => {
      mountDialog();

      expect(document.querySelector(".dialog__header")).toBeFalsy();
    });

    it("header slot 替代 title prop", () => {
      mountDialog({}, { header: '<span class="custom-header">自定义</span>' });

      expect(document.querySelector(".custom-header")).toBeTruthy();
      // 不渲染默认 title
      expect(document.querySelector(".dialog__title")).toBeFalsy();
    });
  });

  // ── 关闭按钮 ──────────────────────────────────────────────────

  describe("closable 关闭按钮", () => {
    it("默认显示关闭按钮", () => {
      mountDialog({ title: "有关闭按钮" });

      expect(document.querySelector(".dialog__close")).toBeTruthy();
    });

    it("closable=false 不渲染关闭按钮", () => {
      mountDialog({ title: "无关闭按钮", closable: false });

      expect(document.querySelector(".dialog__close")).toBeFalsy();
    });

    it("点击关闭按钮触发 update:modelValue(false)", async () => {
      const wrapper = mountDialog({ title: "可关闭" });

      const closeBtn = document.querySelector(".dialog__close") as HTMLElement;
      closeBtn.click();
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([false]);
    });
  });

  // ── 遮罩点击关闭 ─────────────────────────────────────────────

  describe("遮罩点击关闭", () => {
    it("默认点击遮罩关闭对话框", async () => {
      const wrapper = mountDialog();

      const overlay = document.querySelector(".dialog-overlay") as HTMLElement;
      overlay.click();
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([false]);
    });

    it("closeOnOverlay=false 时点击遮罩不关闭", async () => {
      const wrapper = mountDialog({ closeOnOverlay: false });

      const overlay = document.querySelector(".dialog-overlay") as HTMLElement;
      overlay.click();
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });

    it("点击面板内容不关闭（事件不冒泡到遮罩）", async () => {
      const wrapper = mountDialog({ title: "测试" });

      const panel = document.querySelector(".dialog") as HTMLElement;
      panel.click();
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  // ── Esc 键关闭 ────────────────────────────────────────────────

  describe("Esc 键关闭", () => {
    it("默认按 Esc 关闭对话框", async () => {
      const wrapper = mountDialog();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([false]);
    });

    it("closeOnEsc=false 时按 Esc 不关闭", async () => {
      const wrapper = mountDialog({ closeOnEsc: false });

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("焦点管理", () => {
    it("打开后聚焦面板", async () => {
      mountDialog();
      await flushPromises();

      expect(document.activeElement).toBe(document.querySelector(".dialog"));
    });
  });

  // ── width ─────────────────────────────────────────────────────

  describe("width 宽度", () => {
    it("默认宽度 28rem", () => {
      mountDialog();

      const panel = document.querySelector(".dialog") as HTMLElement;
      expect(panel?.style.width).toBe("28rem");
    });

    it("自定义宽度", () => {
      mountDialog({ width: "40rem" });

      const panel = document.querySelector(".dialog") as HTMLElement;
      expect(panel?.style.width).toBe("40rem");
    });
  });

  // ── slot 渲染 ──────────────────────────────────────────────────

  describe("slot 渲染", () => {
    it("default slot 渲染主体内容", () => {
      mountDialog({}, { default: '<p class="body-content">主体内容</p>' });

      expect(document.querySelector(".body-content")).toBeTruthy();
      expect(document.querySelector(".dialog__body")?.textContent).toContain(
        "主体内容",
      );
    });

    it("footer slot 渲染底部操作区", () => {
      mountDialog({}, { footer: '<button class="confirm-btn">确定</button>' });

      expect(document.querySelector(".dialog__footer")).toBeTruthy();
      expect(document.querySelector(".confirm-btn")).toBeTruthy();
    });

    it("无 footer slot 时不渲染 footer 区域", () => {
      mountDialog();

      expect(document.querySelector(".dialog__footer")).toBeFalsy();
    });
  });

  // ── body 滚动锁定 ─────────────────────────────────────────────

  describe("body 滚动锁定", () => {
    it("打开时锁定 body 滚动", () => {
      mountDialog();

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("关闭时恢复 body 滚动", async () => {
      const wrapper = mountDialog();

      // 关闭
      await wrapper.setProps({ modelValue: false });
      await flushPromises();

      expect(document.body.style.overflow).toBe("");
    });
  });

  // ── Esc 事件清理 ──────────────────────────────────────────────

  describe("事件监听清理", () => {
    it("关闭后移除 keydown 监听（Esc 不再触发关闭）", async () => {
      const wrapper = mountDialog();

      // 关闭
      await wrapper.setProps({ modelValue: false });
      await flushPromises();

      // 再按 Esc 不应触发任何事件
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      // 只有打开期间可能产生的事件
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });
});
