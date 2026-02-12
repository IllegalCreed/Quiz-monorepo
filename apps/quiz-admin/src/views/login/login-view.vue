<script setup lang="ts">
/**
 * 登录页面
 * 紫色渐变背景 + Element Plus 表单
 */
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDark, useToggle } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { useAccountStore } from "@/stores/modules/account";
import { useToken } from "@/composables/use-token";
import type { FormInstance } from "element-plus";
import type { LoginForm } from "@/types/account";

const router = useRouter();
const route = useRoute();
const accountStore = useAccountStore();
const { setToken } = useToken();

/** 深浅色模式 */
const isDark = useDark();
const toggleDark = useToggle(isDark);

/** 登录表单引用 */
const loginFormRef = ref<FormInstance>();

/** 登录表单数据 */
const loginForm = reactive<LoginForm>({
  username: "",
  password: "",
});

/** 表单验证规则 */
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

/** 登录中状态 */
const loading = ref(false);

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      loading.value = true;

      // 调用登录 API
      const token = await accountStore.login(loginForm);

      // 保存 token
      setToken(token);

      ElMessage.success("登录成功");

      // 跳转到原路由或默认打开欢迎页
      const redirect = (route.query.redirect as string) || "/home/dashboard";
      router.push(redirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败";
      ElMessage.error(message);
    } finally {
      loading.value = false;
    }
  });
};
</script>

<template>
  <div class="login-page">
    <!-- 背景渐变 -->
    <div class="login-bg"></div>

    <!-- 右上角深色模式切换 -->
    <button class="dark-toggle" @click="toggleDark()">
      <i-carbon-sun v-if="!isDark" class="w-5 h-5" />
      <i-carbon-moon v-else class="w-5 h-5" />
    </button>

    <!-- 登录卡片 -->
    <div class="login-card">
      <h1 class="login-title">Quiz Admin</h1>
      <p class="login-subtitle">管理后台</p>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" size="large" clearable>
            <template #prefix>
              <i-carbon-user />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <i-carbon-locked />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <button type="button" class="login-button" :disabled="loading" @click="handleLogin">
            <span v-if="loading" class="i-carbon-renew animate-spin w-4 h-4" />
            登录
          </button>
        </el-form-item>
      </el-form>

      <!-- 测试账号提示 -->
      <div class="test-accounts">
        <p class="test-title">测试账号:</p>
        <p class="test-item">超级管理员: super_admin / super_admin</p>
        <p class="test-item">普通管理员: admin / admin</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  @apply min-h-screen flex items-center justify-center relative overflow-hidden;
}

.login-bg {
  @apply absolute inset-0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.9;
}

/* 右上角深色模式切换按钮 */
.dark-toggle {
  @apply absolute top-6 right-6 z-10;
  @apply w-10 h-10 flex items-center justify-center rounded-full;
  @apply text-white/80 hover:text-white;
  @apply bg-white/15 hover:bg-white/25;
  @apply cursor-pointer transition-all duration-200;
  border: none;
  backdrop-filter: blur(4px);
}

.login-card {
  @apply relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-12 w-full max-w-md;
  z-index: 1;
}

.login-title {
  @apply text-3xl font-bold text-center mb-2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  @apply text-center text-gray-500 dark:text-slate-400 mb-8;
}

.login-form {
  @apply space-y-4;
}

/* 自定义登录按钮（不使用 el-button，避免主题覆盖问题） */
.login-button {
  @apply w-full h-10 rounded-lg text-base font-medium;
  @apply text-white cursor-pointer border-none;
  @apply flex items-center justify-center gap-2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition:
    opacity 0.2s,
    transform 0.1s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    @apply opacity-60 cursor-not-allowed;
  }
}

.test-accounts {
  @apply mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400;
}

.test-title {
  @apply font-semibold mb-2 text-gray-700 dark:text-slate-300;
}

.test-item {
  @apply py-1;
}
</style>
