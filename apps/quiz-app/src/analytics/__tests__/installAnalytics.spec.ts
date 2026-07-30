import type { Router } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const analyticsMocks = vi.hoisted(() => ({
  startGoogle: vi.fn(),
  startBaidu: vi.fn(),
  stopGoogle: vi.fn(),
  stopBaidu: vi.fn(),
}));

vi.mock("../googleAnalytics", () => ({
  startGoogleAnalytics: analyticsMocks.startGoogle,
}));

vi.mock("../baiduAnalytics", () => ({
  startBaiduAnalytics: analyticsMocks.startBaidu,
}));

import {
  installQuizAnalytics,
  QUIZ_BAIDU_SITE_ID,
  QUIZ_GA_MEASUREMENT_ID,
} from "../installAnalytics";

describe("Quiz 统计安装边界", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    analyticsMocks.startGoogle.mockReturnValue(analyticsMocks.stopGoogle);
    analyticsMocks.startBaidu.mockReturnValue(analyticsMocks.stopBaidu);
  });

  it("两家供应商共享同意、路由和停止生命周期", () => {
    let afterEach:
      | ((to: { fullPath: string }) => void)
      | undefined;
    const removeRouteHook = vi.fn();
    const router = {
      afterEach: vi.fn((listener: (to: { fullPath: string }) => void) => {
        afterEach = listener;
        return removeRouteHook;
      }),
    } as unknown as Router;

    const stop = installQuizAnalytics({
      enabled: true,
      window,
      document,
      navigator,
      router,
    });

    expect(analyticsMocks.startGoogle).toHaveBeenCalledOnce();
    expect(analyticsMocks.startBaidu).toHaveBeenCalledOnce();

    const googleOptions = analyticsMocks.startGoogle.mock.calls[0]?.[0];
    const baiduOptions = analyticsMocks.startBaidu.mock.calls[0]?.[0];

    expect(googleOptions.measurementId).toBe(QUIZ_GA_MEASUREMENT_ID);
    expect(baiduOptions.siteId).toBe(QUIZ_BAIDU_SITE_ID);
    expect(googleOptions.readConsent()).toBe("unset");
    expect(baiduOptions.readConsent()).toBe("unset");
    expect(googleOptions.readPage()).toMatchObject({
      path: "/",
    });

    const pageListener = vi.fn();
    expect(googleOptions.subscribePage(pageListener)).toBe(removeRouteHook);
    afterEach?.({ fullPath: "/privacy?from=footer" });
    expect(pageListener).toHaveBeenCalledWith({
      path: "/privacy?from=footer",
      title: document.title,
    });

    stop();
    expect(analyticsMocks.stopGoogle).toHaveBeenCalledOnce();
    expect(analyticsMocks.stopBaidu).toHaveBeenCalledOnce();
  });
});
