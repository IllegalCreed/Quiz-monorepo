import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsConsent } from "../consent";
import {
  sanitizePageViewPath,
  sanitizePageViewUrl,
  startGoogleAnalytics,
} from "../googleAnalytics";

interface TestPage {
  path: string;
  title: string;
}

function createHarness(options?: {
  enabled?: boolean;
  measurementId?: string;
  consent?: AnalyticsConsent;
  page?: TestPage;
}) {
  let consent = options?.consent ?? "unset";
  let page = options?.page ?? {
    path: "/?category=javascript&utm_source=GitHub#answer",
    title: "IllegalCreed Quiz",
  };
  let consentListener: ((value: AnalyticsConsent) => void) | undefined;
  let pageListener: ((value: TestPage) => void) | undefined;

  const stop = startGoogleAnalytics({
    enabled: options?.enabled ?? true,
    measurementId: options?.measurementId ?? "G-TEST12345",
    window,
    document,
    readConsent: () => consent,
    subscribeConsent: (listener) => {
      consentListener = listener;
      return () => {
        consentListener = undefined;
      };
    },
    readPage: () => page,
    subscribePage: (listener) => {
      pageListener = listener;
      return () => {
        pageListener = undefined;
      };
    },
  });

  return {
    stop,
    grant() {
      consent = "granted";
      consentListener?.(consent);
    },
    deny() {
      consent = "denied";
      consentListener?.(consent);
    },
    navigate(nextPage: TestPage) {
      page = nextPage;
      pageListener?.(page);
    },
  };
}

function dataLayerEvents(): unknown[][] {
  return ((window as unknown as { dataLayer?: unknown[][] }).dataLayer ?? []).filter(
    (entry) => entry[0] === "event",
  );
}

describe("最小化 Google Analytics 页面浏览", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete (window as unknown as { dataLayer?: unknown[][] }).dataLayer;
    delete (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  });

  it("非生产或 Measurement ID 非法时零副作用", () => {
    createHarness({ enabled: false, consent: "granted" });
    createHarness({ measurementId: "invalid", consent: "granted" });

    expect(document.querySelector("script[data-ga4-measurement-id]")).toBeNull();
    expect((window as unknown as { dataLayer?: unknown[][] }).dataLayer).toBeUndefined();
  });

  it("unset/denied 不加载脚本且导航不发送", () => {
    const unsetHarness = createHarness();
    unsetHarness.navigate({ path: "/privacy", title: "隐私政策" });

    const deniedHarness = createHarness({ consent: "denied" });
    deniedHarness.navigate({ path: "/", title: "IllegalCreed Quiz" });

    expect(document.querySelector("script[data-ga4-measurement-id]")).toBeNull();
    expect(dataLayerEvents()).toHaveLength(0);
  });

  it("同意后只加载一次并发送一次当前页", () => {
    const harness = createHarness();

    harness.grant();
    harness.grant();

    expect(document.querySelectorAll("script[data-ga4-measurement-id]")).toHaveLength(1);
    expect(dataLayerEvents()).toHaveLength(1);
    expect(dataLayerEvents()[0]?.[1]).toBe("page_view");
  });

  it("页面位置丢弃分类、自由 query 和 hash，只保留合法 UTM", () => {
    const path =
      "/?category=javascript&utm_source=GitHub&utm_medium=Community&utm_campaign=Quiz-Launch&utm_content=Home&answer=秘密#question";

    expect(sanitizePageViewUrl(path, "https://quiz.illegalscreed.cn")).toBe(
      "https://quiz.illegalscreed.cn/?utm_source=github&utm_medium=community&utm_campaign=quiz-launch&utm_content=home",
    );
    expect(sanitizePageViewPath(path, "https://quiz.illegalscreed.cn")).toBe(
      "/?utm_source=github&utm_medium=community&utm_campaign=quiz-launch&utm_content=home",
    );
  });

  it("pathname 导航计页，同路径 query/hash 去重，撤回后停发", () => {
    const harness = createHarness({ consent: "granted" });

    harness.navigate({ path: "/?category=vue#question", title: "IllegalCreed Quiz" });
    harness.navigate({ path: "/privacy?from=footer", title: "隐私政策" });
    harness.deny();
    harness.navigate({ path: "/", title: "IllegalCreed Quiz" });

    expect(dataLayerEvents()).toHaveLength(2);
    expect(dataLayerEvents()[1]?.[2]).toMatchObject({
      page_path: "/privacy",
      page_location: "http://localhost:3000/privacy",
    });
  });

  it("复用既有脚本和 gtag，不重复注入", () => {
    const script = document.createElement("script");
    script.dataset.ga4MeasurementId = "G-TEST12345";
    document.head.append(script);
    const gtag = vi.fn();
    (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag = gtag;

    createHarness({ consent: "granted" });

    expect(document.querySelectorAll("script[data-ga4-measurement-id]")).toHaveLength(1);
    expect(gtag).toHaveBeenCalledWith("config", "G-TEST12345", {
      anonymize_ip: true,
      send_page_view: false,
    });
  });
});
