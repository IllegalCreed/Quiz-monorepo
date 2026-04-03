/**
 * 用户认证状态管理
 *
 * - token 持久化到 localStorage（通过 VueUse useLocalStorage）
 * - 登录/注册成功后自动存储 token 和用户信息
 * - 应用启动时若有 token 则自动恢复用户信息
 */
import { computed, nextTick, ref } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import * as authApi from "@/api/auth";
import { useSse } from "@/composables/useSse";
import type { LoginForm, RegisterForm, UserInfo } from "@/types/user";

/** localStorage key（与 request.ts 中的 TOKEN_KEY 一致） */
const TOKEN_KEY = "quiz-user-token";

export const useUserStore = defineStore("user", () => {
  /** JWT token（自动同步到 localStorage） */
  const token = useLocalStorage(TOKEN_KEY, "");

  /** 当前用户信息 */
  const userInfo = ref<UserInfo | null>(null);

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value);
  let fetchUserInfoPromise: Promise<void> | null = null;

  /**
   * 登录
   *
   * @param form - 登录表单
   * @throws 后端返回的错误信息
   */
  async function login(form: LoginForm) {
    const res = await authApi.login(form);
    token.value = res.token;
    userInfo.value = res.user;
    // 等待 VueUse watch 将 token 写入 localStorage（flush: 'pre' 是异步的）
    await nextTick();
    // 登录后发送心跳，服务端从 JWT 提取用户信息
    useSse().sendHeartbeat();
  }

  /**
   * 注册
   *
   * @param form - 注册表单
   * @throws 后端返回的错误信息（如用户名已存在）
   */
  async function register(form: RegisterForm) {
    const res = await authApi.register(form);
    token.value = res.token;
    userInfo.value = res.user;
    // 等待 VueUse watch 将 token 写入 localStorage
    await nextTick();
    // 注册后发送心跳（等同登录）
    useSse().sendHeartbeat();
  }

  /**
   * 退出登录
   */
  async function logout() {
    token.value = "";
    userInfo.value = null;
    // 等待 VueUse watch 将 token 清空写入 localStorage
    await nextTick();
    // 退出后发送心跳，服务端标记为游客
    useSse().sendHeartbeat();
  }

  /**
   * 恢复登录状态
   *
   * 应用启动时调用，若 token 存在则获取用户信息；
   * 若 token 失效则静默清空。
   */
  async function fetchUserInfo() {
    if (!token.value) return;
    if (fetchUserInfoPromise) return fetchUserInfoPromise;

    fetchUserInfoPromise = (async () => {
      try {
        userInfo.value = await authApi.getUserInfo();
      } catch {
        // token 失效，静默清空
        await logout();
      } finally {
        fetchUserInfoPromise = null;
      }
    })();

    return fetchUserInfoPromise;
  }

  return { token, userInfo, isLoggedIn, login, register, logout, fetchUserInfo };
});
