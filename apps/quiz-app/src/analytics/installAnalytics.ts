import type { Router } from "vue-router";
import {
  getBrowserConsentStorage,
  resolveInitialAnalyticsConsent,
  subscribeAnalyticsConsent,
  type BrowserPrivacySignals,
} from "./consent";
import { startBaiduAnalytics } from "./baiduAnalytics";
import { startGoogleAnalytics } from "./googleAnalytics";

export const QUIZ_GA_MEASUREMENT_ID = "G-F61SMFC46V";
export const QUIZ_BAIDU_SITE_ID = "9fa7b9c941b4da7b032891a4bb882aec";

export interface QuizAnalyticsOptions {
  enabled: boolean;
  window: Window;
  document: Document;
  navigator: BrowserPrivacySignals;
  router: Router;
}

/** 安装 Quiz 的可选分析控制器；所有供应商共享同一份明确选择。 */
export function installQuizAnalytics(options: QuizAnalyticsOptions): () => void {
  const storage = getBrowserConsentStorage(options.window);
  const readConsent = () => resolveInitialAnalyticsConsent(storage, options.navigator);
  const subscribeConsent = (listener: Parameters<typeof subscribeAnalyticsConsent>[0]) =>
    subscribeAnalyticsConsent(listener, options.window);
  const readPage = () => ({
    path: `${options.window.location.pathname}${options.window.location.search}${options.window.location.hash}`,
    title: options.document.title,
  });
  const subscribePage = (listener: (page: ReturnType<typeof readPage>) => void): (() => void) =>
    options.router.afterEach((to) => {
      listener({
        path: to.fullPath,
        title: options.document.title,
      });
    });

  const stopGoogle = startGoogleAnalytics({
    enabled: options.enabled,
    measurementId: QUIZ_GA_MEASUREMENT_ID,
    window: options.window,
    document: options.document,
    readConsent,
    subscribeConsent,
    readPage,
    subscribePage,
  });
  const stopBaidu = startBaiduAnalytics({
    enabled: options.enabled,
    siteId: QUIZ_BAIDU_SITE_ID,
    window: options.window,
    document: options.document,
    readConsent,
    subscribeConsent,
    readPage,
    subscribePage,
  });

  return () => {
    stopGoogle();
    stopBaidu();
  };
}
