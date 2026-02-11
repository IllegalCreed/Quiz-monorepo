/**
 * 菜单导航逻辑
 */
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useMenuNavigation() {
  const router = useRouter()
  const route = useRoute()

  /** 当前激活的菜单索引 */
  const activeIndex = ref(route.path)

  /**
   * 处理菜单选择
   */
  const handleSelect = (key: string) => {
    router.push({ path: key })
  }

  /**
   * 监听路由变化,更新激活状态
   */
  watch(
    () => route.path,
    (newPath) => {
      activeIndex.value = newPath
    },
  )

  return { activeIndex, handleSelect }
}
