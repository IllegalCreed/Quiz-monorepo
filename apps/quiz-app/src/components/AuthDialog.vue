<script setup lang="ts">
/**
 * AuthDialog — 登录/注册对话框
 *
 * 使用 BaseDialog（center 模式）+ BaseInput + BaseButton，
 * 通过 useAuthDialog 控制显示/隐藏和 Tab 切换。
 */
import { ref, watch } from "vue";
import { BaseDialog, BaseInput, BaseButton } from "@quiz/ui";
import { useAuthDialog } from "@/composables/useAuthDialog";
import { useUserStore } from "@/stores/useUserStore";
import { useCategories } from "@/composables/useCategories";

const { showAuthDialog, activeTab, close } = useAuthDialog();
const userStore = useUserStore();
const { loadUserPreferences } = useCategories();

// ── 表单状态 ───────────────────────────────────────
const username = ref("");
const password = ref("");
const nickname = ref("");
const email = ref("");

/** 后端返回的错误信息 */
const errorMsg = ref("");

/** 提交中 */
const loading = ref(false);

// ── 前端校验 ───────────────────────────────────────
const usernameError = ref("");
const passwordError = ref("");

/** 校验表单，返回是否通过 */
function validate(): boolean {
  usernameError.value = "";
  passwordError.value = "";

  if (!username.value.trim()) {
    usernameError.value = "请输入用户名";
    return false;
  }
  // 注册时用户名 3-20 字符
  if (activeTab.value === "register" && username.value.trim().length < 3) {
    usernameError.value = "用户名至少 3 个字符";
    return false;
  }
  if (password.value.length < 6) {
    passwordError.value = "密码至少 6 位";
    return false;
  }
  return true;
}

// ── 提交 ───────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    if (activeTab.value === "login") {
      await userStore.login({
        username: username.value.trim(),
        password: password.value,
      });
    } else {
      await userStore.register({
        username: username.value.trim(),
        password: password.value,
        nickname: nickname.value.trim() || undefined,
        email: email.value.trim() || undefined,
      });
    }
    // 成功 → 关闭对话框 + 加载用户分类偏好
    close();
    loadUserPreferences();
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "操作失败";
  } finally {
    loading.value = false;
  }
}

// ── 对话框打开时重置表单 ────────────────────────────
watch(showAuthDialog, (open) => {
  if (open) {
    username.value = "";
    password.value = "";
    nickname.value = "";
    email.value = "";
    errorMsg.value = "";
    usernameError.value = "";
    passwordError.value = "";
  }
});

/** 切换 Tab 时清除错误 */
watch(activeTab, () => {
  errorMsg.value = "";
  usernameError.value = "";
  passwordError.value = "";
});
</script>

<template>
  <BaseDialog v-model="showAuthDialog" placement="center" width="24rem" :closable="true">
    <!-- 自定义 Header：Tab 切换 -->
    <template #header>
      <div class="auth-tabs">
        <button
          :class="['auth-tabs__item', { 'auth-tabs__item--active': activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button
          :class="['auth-tabs__item', { 'auth-tabs__item--active': activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>
    </template>

    <!-- 表单内容 -->
    <form class="auth-form" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="username"
        type="text"
        label="用户名"
        placeholder="请输入用户名"
        :error="usernameError"
      />

      <BaseInput
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        :error="passwordError"
      />

      <!-- 注册额外字段 -->
      <template v-if="activeTab === 'register'">
        <BaseInput v-model="nickname" type="text" label="昵称（可选）" placeholder="请输入昵称" />
        <BaseInput v-model="email" type="email" label="邮箱（可选）" placeholder="请输入邮箱" />
      </template>

      <!-- 错误提示 -->
      <p v-if="errorMsg" class="auth-form__error" role="alert">
        {{ errorMsg }}
      </p>

      <!-- 提交按钮 -->
      <BaseButton type="submit" variant="default" class="auth-form__submit" :disabled="loading">
        {{ loading ? "请稍候..." : activeTab === "login" ? "登录" : "注册" }}
      </BaseButton>
    </form>
  </BaseDialog>
</template>

<style scoped lang="scss">
/* ── Tab 切换样式 ─────────────────────────────────── */
.auth-tabs {
  @apply flex gap-6;

  &__item {
    @apply text-base font-medium cursor-pointer pb-2;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--quiz-ui-muted);
    transition: all 0.2s ease;

    &--active {
      color: var(--quiz-ui-primary);
      border-bottom-color: var(--quiz-ui-primary);
    }

    &:hover:not(&--active) {
      color: var(--quiz-ui-text);
    }
  }
}

/* ── 表单样式 ─────────────────────────────────────── */
.auth-form {
  @apply flex flex-col gap-4;

  &__error {
    @apply text-sm m-0;
    color: var(--quiz-ui-danger, #ef4444);
  }

  &__submit {
    @apply w-full mt-2;
  }
}
</style>
