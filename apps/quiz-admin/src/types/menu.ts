/**
 * 菜单相关类型定义
 */

/** 菜单项 */
export interface MenuItem {
  index: string;
  name: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}
