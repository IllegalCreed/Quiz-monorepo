import { beforeEach, describe, expect, it } from "vitest";
import type { AnalyticsConsent } from "../consent";
import { startBaiduAnalytics } from "../baiduAnalytics";

function createHarness(options?: {
  enabled?: boolean;
  siteId?: string;
  consent?: AnalyticsConsent;
}) {
  let consent = options?.consent ?? "unset";
  let consentListener: ((value: AnalyticsConsent) => void) | undefined;
  let pageListener: ((page: { path: string }) => void) | undefined;

  startBaiduAnalytics({
    enabled: options?.enabled ?? true,
    siteId: options?.siteId ?? "9fa7b9c941b4da7b032891a4bb882aec",
    window,
    document,
    readConsent: () => consent,
    subscribeConsent: (listener) => {
      consentListener = listener;
      return () => {
        consentListener = undefined;
      };
    },
    readPage: () => ({ path: "/?category=secret&utm_source=GitHub#answer" }),
    subscribePage: (listener) => {
      pageListener = listener;
      return () => {
        pageListener = undefined;
      };
    },
  });

  return {
    grant() {
      consent = "granted";
      consentListener?.(consent);
    },
    deny() {
      consent = "denied";
      consentListener?.(consent);
    },
    navigate(path: string) {
      pageListener?.({ path });
    },
  };
}

describe("最小化百度统计页面浏览", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete (window as unknown as { _hmt?: unknown[][] })._hmt;
  });

  it("非生产、非法 site ID、unset 和 denied 均不加载", () => {
    createHarness({ enabled: false, consent: "granted" });
    createHarness({ siteId: "invalid", consent: "granted" });
    createHarness();
    createHarness({ consent: "denied" });

    expect(document.querySelector("script[data-baidu-analytics-site-id]")).toBeNull();
    expect((window as unknown as { _hmt?: unknown[][] })._hmt).toBeUndefined();
  });

  it("同意后只加载一次，同路径去重并丢弃自由参数", () => {
    const harness = createHarness();

    harness.grant();
    harness.grant();
    harness.navigate("/?category=vue#question");
    harness.navigate("/privacy?answer=secret&utm_source=Footer#details");

    expect(document.querySelectorAll("script[data-baidu-analytics-site-id]")).toHaveLength(1);
    expect((window as unknown as { _hmt?: unknown[][] })._hmt).toEqual([
      ["_trackPageview", "/privacy?utm_source=footer"],
    ]);
  });

  it("撤回后不再发送后续路由", () => {
    const harness = createHarness({ consent: "granted" });

    harness.navigate("/privacy");
    harness.deny();
    harness.navigate("/");

    expect((window as unknown as { _hmt?: unknown[][] })._hmt).toEqual([
      ["_trackPageview", "/privacy"],
    ]);
  });
});
