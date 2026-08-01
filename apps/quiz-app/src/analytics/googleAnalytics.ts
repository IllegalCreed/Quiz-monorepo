import type { AnalyticsConsent } from "./consent";

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/;
const CAMPAIGN_TOKEN_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MAX_CAMPAIGN_TOKEN_LENGTH = 64;
const UTM_FIELDS = ["source", "medium", "campaign", "content"] as const;

export interface AnalyticsPage {
  path: string;
  title: string;
}

export interface GoogleAnalyticsOptions {
  enabled: boolean;
  measurementId: string | undefined;
  window: Window;
  document: Document;
  readConsent: () => AnalyticsConsent;
  subscribeConsent: (listener: (consent: AnalyticsConsent) => void) => () => void;
  readPage: () => AnalyticsPage;
  subscribePage: (listener: (page: AnalyticsPage) => void) => () => void;
}

type AnalyticsWindow = Window & {
  dataLayer?: Array<IArguments | unknown[]>;
  gtag?: (...args: unknown[]) => void;
};

/** 规范化公开 Measurement ID，非法配置保持零副作用。 */
function normalizedMeasurementId(value: string | undefined): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized && GA_MEASUREMENT_ID_PATTERN.test(normalized) ? normalized : undefined;
}

/** 仅允许稳定、短小且不含自由文本的渠道 token。 */
function normalizeCampaignToken(value: string | null): string | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (
    !normalized ||
    normalized.length > MAX_CAMPAIGN_TOKEN_LENGTH ||
    !CAMPAIGN_TOKEN_PATTERN.test(normalized)
  ) {
    return undefined;
  }
  return normalized;
}

/** 清洗页面 URL，仅保留 pathname 与四个经过校验的 UTM 字段。 */
export function sanitizePageViewUrl(path: string, origin: string): string {
  const base = new URL(origin);
  const source = new URL(path, base);
  const sanitized = new URL(source.pathname, base.origin);

  for (const field of UTM_FIELDS) {
    const value = normalizeCampaignToken(source.searchParams.get(`utm_${field}`));
    if (value) sanitized.searchParams.set(`utm_${field}`, value);
  }
  return sanitized.toString();
}

/** 返回供应商路由 API 使用的清洗后 pathname + search。 */
export function sanitizePageViewPath(path: string, origin: string): string {
  const sanitized = new URL(sanitizePageViewUrl(path, origin));
  return `${sanitized.pathname}${sanitized.search}`;
}

/** 按 basic consent 启动最小化 GA4 页面浏览。 */
export function startGoogleAnalytics(options: GoogleAnalyticsOptions): () => void {
  const measurementId = normalizedMeasurementId(options.measurementId);
  if (!options.enabled || !measurementId) return () => undefined;

  const analyticsWindow = options.window as AnalyticsWindow;
  const disableKey = `ga-disable-${measurementId}`;
  let consent = options.readConsent();
  let initialized = false;
  let lastPath: string | undefined;

  const initialize = (): void => {
    analyticsWindow.dataLayer ??= [];
    analyticsWindow.gtag ??= function () {
      analyticsWindow.dataLayer ??= [];
      // eslint-disable-next-line prefer-rest-params
      analyticsWindow.dataLayer.push(arguments);
    };

    if (!initialized) {
      initialized = true;
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", measurementId, {
        anonymize_ip: true,
        send_page_view: false,
      });
    }

    if (!options.document.querySelector("script[data-ga4-measurement-id]")) {
      const script = options.document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        measurementId,
      )}`;
      script.dataset.ga4MeasurementId = measurementId;
      script.onerror = () => {
        script.remove();
      };
      options.document.head.append(script);
    }
  };

  const sendPageView = (page: AnalyticsPage): void => {
    if (consent !== "granted") return;
    try {
      const pageLocation = sanitizePageViewUrl(page.path, options.window.location.origin);
      const pagePath = new URL(pageLocation).pathname;
      if (pagePath === lastPath) return;

      initialize();
      analyticsWindow.gtag?.("event", "page_view", {
        page_title: page.title,
        page_location: pageLocation,
        page_path: pagePath,
      });
      lastPath = pagePath;
    } catch {
      // 分析是可选能力，任何异常都不得影响答题、登录或导航。
    }
  };

  const applyConsent = (nextConsent: AnalyticsConsent): void => {
    consent = nextConsent;
    (analyticsWindow as unknown as Record<string, unknown>)[disableKey] = nextConsent !== "granted";

    if (nextConsent === "granted") {
      initialize();
      sendPageView(options.readPage());
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
