/**
 * 主题管理组合式函数
 * 使用 VueUse useDark() 实现深色模式切换
 */
import { useDark, useToggle } from "@vueuse/core";

export function useTheme() {
  // useDark 自动：
  // 1. 添加/移除 <html> 的 .dark 类
  // 2. 持久化到 localStorage（key: 'vueuse-color-scheme'）
  // 3. 支持系统主题检测（prefers-color-scheme）
  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  return {
    isDark,
    toggleDark,
  };
}
