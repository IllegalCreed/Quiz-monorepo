import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  getBrowserConsentStorage,
  hasPrivacySignal,
  readAnalyticsConsent,
  resolveInitialAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
} from "../consent";

describe("访问统计同意状态", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("缺失、损坏或不可用存储一律失败关闭", () => {
    expect(readAnalyticsConsent(localStorage)).toBe("unset");

    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "unexpected");
    expect(readAnalyticsConsent(localStorage)).toBe("unset");

    const brokenStorage = {
      getItem: vi.fn(() => {
        throw new Error("storage disabled");
      }),
      setItem: vi.fn(() => {
        throw new Error("storage disabled");
      }),
    };

    expect(readAnalyticsConsent(brokenStorage)).toBe("unset");
    expect(writeAnalyticsConsent("granted", brokenStorage, window)).toBe(false);
  });

  it("无已存选择时尊重 DNT/GPC，明确选择可以覆盖", () => {
    expect(hasPrivacySignal({ doNotTrack: "1" })).toBe(true);
    expect(hasPrivacySignal({ globalPrivacyControl: true })).toBe(true);
    expect(resolveInitialAnalyticsConsent(localStorage, { doNotTrack: "1" })).toBe("denied");

    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "granted");
    expect(
      resolveInitialAnalyticsConsent(localStorage, {
        doNotTrack: "1",
        globalPrivacyControl: true,
      }),
    ).toBe("granted");
  });

  it("只保存合法选择并广播同意变更", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAnalyticsConsent(listener, window);

    expect(getBrowserConsentStorage(window)).toBe(localStorage);
    expect(writeAnalyticsConsent("denied", localStorage, window)).toBe(true);
    expect(readAnalyticsConsent(localStorage)).toBe("denied");
    expect(listener).toHaveBeenCalledWith("denied");

    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: "unexpected" }));
    expect(listener).toHaveBeenLastCalledWith("unset");

    unsubscribe();
    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: "granted" }));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("浏览器拒绝访问 localStorage 时返回不可用", () => {
    const browserWindow = {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    } as Pick<Window, "localStorage">;

    expect(getBrowserConsentStorage(browserWindow)).toBeUndefined();
  });
});
