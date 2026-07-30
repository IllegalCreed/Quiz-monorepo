<script setup lang="ts">
import { ref } from "vue";
import {
  getBrowserConsentStorage,
  hasPrivacySignal,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
  type BrowserPrivacySignals,
} from "@/analytics/consent";

const storage = getBrowserConsentStorage(window);
const privacySignal = hasPrivacySignal(navigator as BrowserPrivacySignals);
const consent = ref<AnalyticsConsent>(readAnalyticsConsent(storage));
const isOpen = ref(consent.value === "unset");

/** 保存明确选择；写入失败时保留提示，避免误报已生效。 */
function choose(nextConsent: Exclude<AnalyticsConsent, "unset">): void {
  if (!writeAnalyticsConsent(nextConsent, storage, window)) return;
  consent.value = nextConsent;
  isOpen.value = false;
}
</script>

<template>
  <div v-if="isOpen" class="analytics-consent-space" aria-hidden="true" />

  <aside
    v-if="isOpen"
    class="analytics-consent"
    data-testid="analytics-consent-panel"
    aria-label="可选访问统计"
  >
    <div class="analytics-consent__copy">
      <strong>可选访问统计</strong>
      <span v-if="privacySignal">
        检测到浏览器隐私信号，访问统计已默认关闭。你仍可明确允许 Google Analytics
        和百度统计仅收集经清洗的页面浏览。
      </span>
      <span v-else>
        是否允许 Google Analytics 和百度统计仅收集经清洗的页面浏览？不会发送题目、答案或账号标识。
      </span>
      <a href="/privacy">隐私政策</a>
    </div>
    <div class="analytics-consent__actions">
      <button type="button" data-choice="denied" @click="choose('denied')">拒绝</button>
      <button
        type="button"
        class="analytics-consent__primary"
        data-choice="granted"
        @click="choose('granted')"
      >
        允许
      </button>
    </div>
  </aside>

  <button
    v-else
    type="button"
    class="analytics-preferences"
    data-testid="analytics-preferences"
    @click="isOpen = true"
  >
    隐私设置
  </button>
</template>

<style scoped lang="scss">
.analytics-consent-space {
  flex: 0 0 10rem;
}

.analytics-consent {
  @apply fixed left-6 right-6 bottom-6 z-40 flex items-center justify-between gap-5 p-4 mx-auto;
  max-width: 48rem;
  color: var(--quiz-ui-text);
  background: color-mix(in srgb, var(--quiz-ui-card-bg) 96%, transparent);
  border: 1px solid var(--quiz-ui-border);
  border-radius: 0.75rem;
  box-shadow: 0 10px 32px rgb(0 0 0 / 0.2);
  backdrop-filter: blur(12px);

  &__copy {
    @apply grid gap-1 text-sm leading-relaxed;

    a {
      width: fit-content;
      color: var(--quiz-ui-primary);
      text-underline-offset: 3px;
    }
  }

  &__actions {
    @apply flex flex-none gap-2;

    button {
      @apply min-h-10 px-4 rounded-lg cursor-pointer;
      color: inherit;
      background: transparent;
      border: 1px solid var(--quiz-ui-border);
    }

    .analytics-consent__primary {
      color: #fff;
      background: var(--quiz-ui-primary);
      border-color: var(--quiz-ui-primary);
    }
  }
}

.analytics-preferences {
  @apply fixed right-3.5 bottom-3.5 z-40 px-3 py-1.5 text-sm rounded-full cursor-pointer;
  color: var(--quiz-ui-text);
  background: var(--quiz-ui-card-bg);
  border: 1px solid var(--quiz-ui-border);
}

@media (max-width: 720px) {
  .analytics-consent-space {
    flex-basis: 16rem;
  }

  .analytics-consent {
    @apply flex-col items-stretch;

    &__actions {
      @apply justify-end;
    }
  }
}
</style>
