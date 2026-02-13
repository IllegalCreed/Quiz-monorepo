/**
 * Token 管理 Composable
 * 使用 localStorage 持久化存储 token
 * 模块级 ref 确保多个组件共享同一状态
 */
import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";

/** 模块级共享状态（单例） */
const token = useLocalStorage<string | null>("admin-token", null);
const needToRefreshRouter = ref(true);

export const useToken = () => {
  /**
   * 设置 token
   */
  const setToken = (value: string) => {
    token.value = value;
    needToRefreshRouter.value = true;
  };

  /**
   * 清除 token
   */
  const clearToken = () => {
    token.value = null;
    needToRefreshRouter.value = true;
  };

  return { token, needToRefreshRouter, setToken, clearToken };
};
