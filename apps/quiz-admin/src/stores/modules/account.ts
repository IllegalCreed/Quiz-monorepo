/**
 * 账号 Store
 * 支持 Mock 模式切换
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  login as loginMockAPI,
  getInfo as getInfoMockAPI,
  logout as logoutMockAPI,
} from "@/api/mock/account";
import { login as loginAPI, getInfo as getInfoAPI, logout as logoutAPI } from "@/api/account";
import { useMockStore } from "@/composables/use-mock-store";
import { useToken } from "@/composables/use-token";
import type { LoginForm, AdminUser } from "@/types/account";

export const useAccountStore = defineStore("account", () => {
  const { isMock } = useMockStore();
  const { token, setToken, clearToken } = useToken();
  const userInfo = ref<AdminUser>();

  /**
   * 登录
   * @param loginForm 登录表单
   * @returns token
   */
  const login = async (loginForm: LoginForm): Promise<string> => {
    if (isMock.value) {
      const mockToken = await loginMockAPI(loginForm);
      setToken(mockToken);
      return mockToken;
    }
    // 真实 API：返回 { token, admin }
    const response = await loginAPI(loginForm);
    // 保存 token 到 localStorage
    setToken(response.token);
    // 保存用户信息到 store
    userInfo.value = response.admin;
    return response.token;
  };

  /**
   * 获取用户信息
   * @returns 管理员信息
   */
  const getInfo = async (): Promise<AdminUser> => {
    // 如果已经加载过,直接返回
    if (userInfo.value) {
      return userInfo.value;
    }

    if (isMock.value) {
      // token 在调用 getInfo 时应该已经存在（登录后调用）
      const info = await getInfoMockAPI(token.value!);
      userInfo.value = info;
      return info;
    }

    // 真实 API
    const info = await getInfoAPI();
    userInfo.value = info;
    return info;
  };

  /**
   * 登出
   */
  const logout = async () => {
    if (isMock.value) {
      // token 在登出时应该已经存在
      await logoutMockAPI(token.value!);
    } else {
      await logoutAPI();
    }
    clearToken();
    userInfo.value = undefined;
  };

  return { login, getInfo, logout, userInfo };
});
