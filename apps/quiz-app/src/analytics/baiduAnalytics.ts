import type { AnalyticsConsent } from "./consent";
import { sanitizePageViewPath } from "./googleAnalytics";

const BAIDU_SITE_ID_PATTERN = /^[a-f0-9]{32}$/;

interface BaiduPage {
  path: string;
}

export interface BaiduAnalyticsOptions {
  enabled: boolean;
  siteId: string | undefined;
  window: Window;
  document: Document;
  readConsent: () => AnalyticsConsent;
  subscribeConsent: (listener: (consent: AnalyticsConsent) => void) => () => void;
  readPage: () => BaiduPage;
  subscribePage: (listener: (page: BaiduPage) => void) => () => void;
}

type BaiduWindow = Window & {
  _hmt?: unknown[][];
};

/** 校验公开的百度统计 site ID，避免非法配置触发网络副作用。 */
function normalizedSiteId(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized && BAIDU_SITE_ID_PATTERN.test(normalized) ? normalized : undefined;
}

/** 按 basic consent 启动最小化百度页面浏览。 */
export function startBaiduAnalytics(options: BaiduAnalyticsOptions): () => void {
  const siteId = normalizedSiteId(options.siteId);
  if (!options.enabled || !siteId) return () => undefined;

  const baiduWindow = options.window as BaiduWindow;
  let consent = options.readConsent();
  let initialized = false;
  let lastPath: string | undefined;

  const currentSanitizedPath = (page: BaiduPage): string =>
    sanitizePageViewPath(page.path, options.window.location.origin);

  const initialize = (): void => {
    if (initialized) return;
    initialized = true;
    baiduWindow._hmt ??= [];

    if (!options.document.querySelector("script[data-baidu-analytics-site-id]")) {
      const script = options.document.createElement("script");
      script.async = true;
      script.src = `https://hm.baidu.com/hm.js?${encodeURIComponent(siteId)}`;
      script.dataset.baiduAnalyticsSiteId = siteId;
      options.document.head.append(script);
    }
  };

  const markCurrentPage = (): void => {
    try {
      lastPath = new URL(currentSanitizedPath(options.readPage()), options.window.location.origin)
        .pathname;
    } catch {
      lastPath = undefined;
    }
  };

  const sendPageView = (page: BaiduPage): void => {
    if (consent !== "granted") return;
    try {
      const sanitizedPath = currentSanitizedPath(page);
      const pathname = new URL(sanitizedPath, options.window.location.origin).pathname;
      if (pathname === lastPath) return;

      initialize();
      baiduWindow._hmt?.push(["_trackPageview", sanitizedPath]);
      lastPath = pathname;
    } catch {
      // 国内访问统计失败不得影响答题、登录或导航。
    }
  };

  const applyConsent = (nextConsent: AnalyticsConsent): void => {
    consent = nextConsent;
    if (nextConsent === "granted") {
      initialize();
      // hm.js 加载时会记录当前页，因此只记住路径，避免手动重复发送。
      markCurrentPage();
      return;
    }
    lastPath = undefined;
  };

  const unsubscribeConsent = options.subscribeConsent(applyConsent);
  const unsubscribePage = options.subscribePage(sendPageView);
  applyConsent(consent);

  return () => {
    unsubscribeConsent();
    unsubscribePage();
  };
}
