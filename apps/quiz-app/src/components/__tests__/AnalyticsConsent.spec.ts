import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ANALYTICS_CONSENT_STORAGE_KEY, readAnalyticsConsent } from "@/analytics/consent";
import AnalyticsConsent from "../AnalyticsConsent.vue";

describe("AnalyticsConsent", () => {
  let originalDoNotTrack: PropertyDescriptor | undefined;

  beforeEach(() => {
    localStorage.clear();
    originalDoNotTrack = Object.getOwnPropertyDescriptor(navigator, "doNotTrack");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    if (originalDoNotTrack) {
      Object.defineProperty(navigator, "doNotTrack", originalDoNotTrack);
    } else {
      Reflect.deleteProperty(navigator, "doNotTrack");
    }
  });

  it("首次提示可拒绝或允许，且提供隐私政策链接", async () => {
    const wrapper = mount(AnalyticsConsent);

    expect(wrapper.get('[data-testid="analytics-consent-panel"]').text()).toContain(
      "Google Analytics 和百度统计",
    );
    expect(wrapper.get('a[href="/privacy"]').text()).toBe("隐私政策");

    await wrapper.get('[data-choice="denied"]').trigger("click");
    expect(readAnalyticsConsent(localStorage)).toBe("denied");
  });

  it("已选择后可重新打开隐私设置并修改", async () => {
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "denied");
    const wrapper = mount(AnalyticsConsent);

    expect(wrapper.find('[data-testid="analytics-consent-panel"]').exists()).toBe(false);
    await wrapper.get('[data-testid="analytics-preferences"]').trigger("click");
    await wrapper.get('[data-choice="granted"]').trigger("click");

    expect(readAnalyticsConsent(localStorage)).toBe("granted");
  });

  it("检测到 DNT 时说明默认关闭，但仍允许用户明确覆盖", async () => {
    Object.defineProperty(navigator, "doNotTrack", {
      configurable: true,
      value: "1",
    });
    const wrapper = mount(AnalyticsConsent);

    expect(wrapper.get('[data-testid="analytics-consent-panel"]').text()).toContain("已默认关闭");
    await wrapper.get('[data-choice="granted"]').trigger("click");
    expect(readAnalyticsConsent(localStorage)).toBe("granted");
  });

  it("存储失败时保持提示，不误报已保存", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });

    try {
      const wrapper = mount(AnalyticsConsent);
      await wrapper.get('[data-choice="granted"]').trigger("click");
      expect(wrapper.find('[data-testid="analytics-consent-panel"]').exists()).toBe(true);
    } finally {
      if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
    }
  });
});
