// @unocss-include
/**
 * 菜单 Store
 * 根据用户菜单权限过滤菜单列表
 */
import { defineStore } from "pinia";
import { computed } from "vue";
import { useAccountStore } from "./account";
import type { MenuItem } from "@/types/menu";

/** 所有菜单项定义 */
const allMenus: MenuItem[] = [
  {
    index: "/home/dashboard",
    name: "dashboard",
    title: "欢迎页",
    icon: "i-carbon-home",
  },
  {
    index: "/home/users",
    name: "users",
    title: "用户管理",
    icon: "i-carbon-user-multiple",
  },
  {
    index: "/home/questions",
    name: "questions",
    title: "题目管理",
    icon: "i-carbon-document",
  },
  {
    index: "/home/categories",
    name: "categories",
    title: "分类管理",
    icon: "i-carbon-category",
  },
  {
    index: "/home/admins",
    name: "admins",
    title: "管理员管理",
    icon: "i-carbon-user-admin",
  },
  {
    index: "/home/roles",
    name: "roles",
    title: "角色管理",
    icon: "i-carbon-user-role",
  },
  {
    index: "/home/permissions",
    name: "permissions",
    title: "权限管理",
    icon: "i-carbon-locked",
  },
  {
    index: "/home/system-logs",
    name: "system-logs",
    title: "系统日志",
    icon: "i-carbon-catalog",
  },
  {
    index: "/home/clients",
    name: "clients",
    title: "客户端管理",
    icon: "i-carbon-screen",
  },
  {
    index: "/home/settings",
    name: "system",
    title: "系统设置",
    icon: "i-carbon-settings",
  },
];

export const useMenuStore = defineStore("menu", () => {
  const accountStore = useAccountStore();

  /**
   * 根据权限过滤菜单
   */
  const menus = computed<MenuItem[]>(() => {
    const permissions = accountStore.userInfo?.menuPermissions || [];

    // 超级管理员（通配符 "*"）显示全部菜单
    if (permissions.includes("*")) return [...allMenus];

    // 过滤菜单:只显示有权限的菜单
    return allMenus.filter((menu) => permissions.includes(menu.name));
  });

  return { menus };
});
