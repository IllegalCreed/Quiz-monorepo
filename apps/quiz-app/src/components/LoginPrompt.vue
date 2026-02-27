<script setup lang="ts">
/**
 * LoginPrompt — 游客答题后登录引导卡片
 *
 * 仅在未登录 + 答题后显示，可永久关闭
 */
import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { BaseCard, BaseCardContent, BaseButton } from "@quiz/ui";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthDialog } from "@/composables/useAuthDialog";

/** 用户是否已关闭提示（持久化） */
const dismissed = useLocalStorage("quiz-hide-login-prompt", false);

const userStore = useUserStore();
const { openLogin } = useAuthDialog();

/** 是否显示（未登录 + 未关闭） */
const visible = computed(() => !userStore.isLoggedIn && !dismissed.value);

/** 永久关闭 */
function dismiss() {
  dismissed.value = true;
}
</script>

<template>
  <BaseCard v-if="visible" class="login-prompt">
    <BaseCardContent>
      <div class="login-prompt__content">
        <p class="login-prompt__text">登录后可以记录做题历史和设置分类偏好</p>
        <div class="login-prompt__actions">
          <BaseButton size="sm" @click="openLogin">登录</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="dismiss">不再提示</BaseButton>
        </div>
      </div>
    </BaseCardContent>
  </BaseCard>
</template>

<style scoped lang="scss">
.login-prompt {
  @apply w-full;

  &__content {
    @apply flex flex-col items-center gap-3;
  }

  &__text {
    @apply m-0 text-sm text-center;
    color: var(--quiz-ui-muted);
  }

  &__actions {
    @apply flex gap-2;
  }
}
</style>
