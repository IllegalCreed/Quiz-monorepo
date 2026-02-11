// @unocss-include
/**
 * 菜单 Store
 * 根据用户菜单权限过滤菜单列表
 */
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAccountStore } from './account'
import type { MenuItem } from '@/types/menu'

/** 所有菜单项定义 */
const allMenus: MenuItem[] = [
  {
    index: '/home/dashboard',
    name: 'dashboard',
    title: '欢迎页',
    icon: 'i-carbon-home',
  },
  {
    index: '/home/users',
    name: 'users',
    title: '用户管理',
    icon: 'i-carbon-user-multiple',
  },
  {
    index: '/home/admins',
    name: 'admins',
    title: '管理员管理',
    icon: 'i-carbon-user-admin',
  },
  {
    index: '/home/settings',
    name: 'system',
    title: '系统设置',
    icon: 'i-carbon-settings',
  },
]

export const useMenuStore = defineStore('menu', () => {
  const accountStore = useAccountStore()

  /**
   * 根据权限过滤菜单
   */
  const menus = computed<MenuItem[]>(() => {
    const permissions = accountStore.userInfo?.menuPermissions || []

    // 过滤菜单:只显示有权限的菜单
    return allMenus.filter((menu) => permissions.includes(menu.name))
  })

  return { menus }
})
