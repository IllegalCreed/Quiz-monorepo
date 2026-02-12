/**
 * v-permission 指令
 * 用于按钮级别的权限控制，根据用户 API 权限显示/隐藏元素
 *
 * 用法：
 * v-permission="'users:delete'"           // 单个权限
 * v-permission="['users:delete', 'users:update']"  // 多个权限（满足任一即可）
 */
import type { Directive } from 'vue'
import { useAccountStore } from '@/stores/modules/account'

export const permission: Directive = {
  mounted(el, binding) {
    const accountStore = useAccountStore()

    // 将权限值转换为数组
    const requiredPermissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    // 获取当前用户的 API 权限
    const userPermissions = accountStore.userInfo?.apiPermissions || []

    // 检查是否有任意一个权限
    const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm))

    // 无权限则移除元素
    if (!hasPermission) {
      el.remove()
    }
  },
}
