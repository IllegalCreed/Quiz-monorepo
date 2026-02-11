/**
 * 菜单折叠状态管理
 * 使用模块级 ref 确保多个组件共享同一状态
 * 支持根据屏幕宽度自动折叠
 */
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

/** 模块级共享状态（单例） */
const isCollapse = ref(false)

/** 是否为窄屏（< 1024px） */
const isNarrowScreen = useMediaQuery('(max-width: 1024px)')

/** 是否已初始化过响应式监听 */
let watcherInitialized = false

export function useMenuCollapse() {
  /**
   * 设置折叠状态
   */
  const setCollapse = (value: boolean) => {
    isCollapse.value = value
  }

  /**
   * 切换折叠状态
   */
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  /**
   * 初始化响应式折叠逻辑
   * 仅在首次挂载时设置，避免重复监听
   */
  if (!watcherInitialized) {
    watcherInitialized = true

    // 初始状态：窄屏自动折叠
    isCollapse.value = isNarrowScreen.value

    // 监听屏幕宽度变化
    const stopWatch = watch(isNarrowScreen, (narrow: boolean) => {
      isCollapse.value = narrow
    })

    // 组件卸载时不需要清理，因为状态是共享的
    void stopWatch
  }

  return { isCollapse, isNarrowScreen, setCollapse, toggleCollapse }
}
