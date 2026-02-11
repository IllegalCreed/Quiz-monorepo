/**
 * 账号 Store
 * 支持 Mock 模式切换
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  login as loginMockAPI,
  getInfo as getInfoMockAPI,
  logout as logoutMockAPI,
} from '@/api/mock/account'
import { useMockStore } from '@/composables/use-mock-store'
import { useToken } from '@/composables/use-token'
import type { LoginForm, AdminUser } from '@/types/account'

export const useAccountStore = defineStore('account', () => {
  const { isMock } = useMockStore()
  const { token } = useToken()
  const userInfo = ref<AdminUser>()

  /**
   * 登录
   * @param loginForm 登录表单
   * @returns token
   */
  const login = async (loginForm: LoginForm): Promise<string> => {
    if (isMock.value) {
      return await loginMockAPI(loginForm)
    }
    // return await loginAPI(loginForm); // 真实 API(后续启用)
    throw new Error('真实 API 尚未实现')
  }

  /**
   * 获取用户信息
   * @returns 管理员信息
   */
  const getInfo = async (): Promise<AdminUser> => {
    // 如果已经加载过,直接返回
    if (userInfo.value) {
      return userInfo.value
    }

    if (isMock.value) {
      const info = await getInfoMockAPI(token.value)
      userInfo.value = info
      return info
    }

    // const info = await getInfoAPI(); // 真实 API(后续启用)
    // userInfo.value = info;
    // return info;
    throw new Error('真实 API 尚未实现')
  }

  /**
   * 登出
   */
  const logout = async () => {
    if (isMock.value) {
      await logoutMockAPI(token.value)
    } else {
      // await logoutAPI(); // 真实 API(后续启用)
    }
    userInfo.value = undefined
  }

  return { login, getInfo, logout, userInfo }
})
