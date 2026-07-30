export const ANALYTICS_CONSENT_STORAGE_KEY = "illegalcreed-quiz.analytics-consent.v1";
export const ANALYTICS_CONSENT_EVENT = "illegalcreed-quiz:analytics-consent";

export type AnalyticsConsent = "unset" | "granted" | "denied";

export interface ConsentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface BrowserPrivacySignals {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

/** 判断持久化值是否为有效的明确选择。 */
function isStoredConsent(value: unknown): value is Exclude<AnalyticsConsent, "unset"> {
  return value === "granted" || value === "denied";
}

/** 安全获取浏览器存储；隐私模式或策略拦截时返回不可用。 */
export function getBrowserConsentStorage(
  browserWindow: Pick<Window, "localStorage"> | undefined = typeof window === "undefined"
    ? undefined
    : window,
): ConsentStorage | undefined {
  if (!browserWindow) return undefined;
  try {
    return browserWindow.localStorage;
  } catch {
    return undefined;
  }
}

/** 读取明确选择；缺失、非法或读取异常均返回 unset。 */
export function readAnalyticsConsent(
  storage: Pick<ConsentStorage, "getItem"> | undefined = getBrowserConsentStorage(),
): AnalyticsConsent {
  if (!storage) return "unset";
  try {
    const value = storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return isStoredConsent(value) ? value : "unset";
  } catch {
    return "unset";
  }
}

/** 判断浏览器是否声明了 DNT 或 GPC 隐私信号。 */
export function hasPrivacySignal(navigatorLike: BrowserPrivacySignals | undefined): boolean {
  return navigatorLike?.doNotTrack === "1" || navigatorLike?.globalPrivacyControl === true;
}

/** 合并已存选择与浏览器隐私信号，明确选择优先。 */
export function resolveInitialAnalyticsConsent(
  storage: Pick<ConsentStorage, "getItem"> | undefined,
  navigatorLike: BrowserPrivacySignals | undefined,
): AnalyticsConsent {
  const storedConsent = readAnalyticsConsent(storage);
  if (storedConsent !== "unset") return storedConsent;
  return hasPrivacySignal(navigatorLike) ? "denied" : "unset";
}

/** 持久化选择并通知可选统计控制器；写入失败时保持失败关闭。 */
export function writeAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, "unset">,
  storage: Pick<ConsentStorage, "setItem"> | undefined = getBrowserConsentStorage(),
  eventTarget: EventTarget | undefined = typeof window === "undefined" ? undefined : window,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    return false;
  }

  try {
    eventTarget?.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: consent }));
  } catch {
    // 持久化选择仍是唯一真值；旧浏览器无法广播时保持失败关闭。
  }
  return true;
}

/** 订阅同意状态变化，并只向监听方传递合法三态值。 */
export function subscribeAnalyticsConsent(
  listener: (consent: AnalyticsConsent) => void,
  eventTarget: EventTarget | undefined = typeof window === "undefined" ? undefined : window,
): () => void {
  if (!eventTarget) return () => undefined;

  const handleConsent = (event: Event): void => {
    const detail = event instanceof CustomEvent ? event.detail : undefined;
    listener(isStoredConsent(detail) ? detail : "unset");
  };
  eventTarget.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
  return () => eventTarget.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
}
