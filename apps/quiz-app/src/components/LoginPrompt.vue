<script setup lang="ts">
/**
 * LoginPrompt — 游客答错后登录引导弹窗
 *
 * 使用 BaseDialog 居中弹窗，仅在未登录 + 答错时显示
 * 用户可选择"不再提示"永久关闭
 */
import { ref, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { BaseDialog, BaseButton } from "@quiz/ui";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthDialog } from "@/composables/useAuthDialog";

const props = defineProps<{
  /** 当前答题状态 */
  status: "idle" | "correct" | "wrong" | "answered";
}>();

/** 用户是否已关闭提示（持久化） */
const dismissed = useLocalStorage("quiz-hide-login-prompt", false);

const userStore = useUserStore();
const { openLogin } = useAuthDialog();

/** 弹窗显示状态 */
const dialogVisible = ref(false);

/** 监听 status 变化：仅答错时弹出 */
watch(
  () => props.status,
  (val) => {
    if (val === "wrong" && !userStore.isLoggedIn && !dismissed.value) {
      dialogVisible.value = true;
    }
  },
);

/** 点击登录 */
function handleLogin() {
  dialogVisible.value = false;
  openLogin();
}

/** 永久关闭（不再提示） */
function handleDismiss() {
  dismissed.value = true;
  dialogVisible.value = false;
}
</script>

<template>
  <BaseDialog v-model="dialogVisible" title="登录提示" placement="center" width="22rem">
    <div class="login-prompt__content">
      <p class="login-prompt__text">登录后可以记录做题历史和设置分类偏好</p>
    </div>
    <template #footer>
      <div class="login-prompt__actions">
        <BaseButton size="sm" variant="ghost" @click="handleDismiss">不再提示</BaseButton>
        <BaseButton size="sm" @click="handleLogin">去登录</BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped lang="scss">
.login-prompt {
  &__content {
    @apply flex flex-col items-center;
  }

  &__text {
    @apply m-0 text-sm text-center leading-relaxed;
    color: var(--quiz-ui-muted);
  }

  &__actions {
    @apply flex justify-end gap-2 w-full;
  }
}
</style>
