/**
 * 菜单折叠状态管理
 * 参考 beitou-survey-admin 实现：
 * - 自动模式：根据窗口宽度自动折叠/展开
 * - 手动模式：用户点击后保持用户选择，不被 resize 覆盖
 * - 跨越阈值：窗口大小跨越阈值时重置为自动模式
 *
 * 使用模块级 ref 确保多个组件（header、menu）共享同一状态
 */
import { ref } from "vue";
import { useEventListener } from "@vueuse/core";

/** 自动折叠的宽度阈值（px） */
const RESIZE_THRESHOLD = 1024;

/** 模块级共享状态（多组件单例） */
const isCollapse = ref(false);
/** 是否为用户手动操作（手动操作后不被 resize 覆盖） */
const isManual = ref(false);
/** 记录上次是否低于阈值，用于判断是否跨越边界 */
let previousIsBelowThreshold = window.innerWidth < RESIZE_THRESHOLD;
/** 是否已初始化 resize 监听 */
let listenerInitialized = false;

/**
 * 菜单折叠 composable
 * 多组件共享同一折叠状态，支持手动/自动切换
 */
export function useMenuCollapse() {
  /**
   * 用户手动设置折叠状态
   * 标记为手动操作，阻止自动 resize 覆盖
   */
  const setCollapse = (value: boolean) => {
    isCollapse.value = value;
    isManual.value = true;
  };

  /** 切换折叠状态（手动操作） */
  const toggleCollapse = () => {
    setCollapse(!isCollapse.value);
  };

  /**
   * 窗口大小变化处理
   * - 跨越阈值时重置手动标志，恢复自动模式
   * - 非手动操作时才自动调整折叠状态
   */
  const handleResize = () => {
    const currentIsBelowThreshold = window.innerWidth < RESIZE_THRESHOLD;

    // 跨越阈值边界（从宽→窄 或 窄→宽），重置为自动模式
    if (currentIsBelowThreshold !== previousIsBelowThreshold) {
      isManual.value = false;
      previousIsBelowThreshold = currentIsBelowThreshold;
    }

    // 仅在自动模式下调整折叠状态
    if (!isManual.value) {
      isCollapse.value = currentIsBelowThreshold;
    }
  };

  // 仅初始化一次 resize 监听，避免多组件重复绑定
  if (!listenerInitialized) {
    listenerInitialized = true;
    // 初始状态
    isCollapse.value = window.innerWidth < RESIZE_THRESHOLD;
    useEventListener(window, "resize", handleResize);
  }

  return { isCollapse, setCollapse, toggleCollapse };
}
