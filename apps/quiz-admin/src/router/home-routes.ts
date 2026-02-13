/**
 * Home 页面子路由定义
 * 包含所有业务页面路由
 */
import type { RouteRecordRaw } from "vue-router";

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: "dashboard",
    name: "dashboard",
    component: () => import("@/views/dashboard/dashboard-view.vue"),
    meta: { title: "欢迎页", componentName: "DashboardView" },
  },
  {
    path: "users",
    name: "users",
    component: () => import("@/views/users/users-view.vue"),
    meta: { title: "用户管理", componentName: "UsersView" },
  },
  {
    path: "admins",
    name: "admins",
    component: () => import("@/views/admins/admins-view.vue"),
    meta: { title: "管理员管理", componentName: "AdminsView" },
  },
  {
    path: "roles",
    name: "roles",
    component: () => import("@/views/roles/roles-view.vue"),
    meta: { title: "角色管理", componentName: "RolesView" },
  },
  {
    path: "permissions",
    name: "permissions",
    component: () => import("@/views/permissions/permissions-view.vue"),
    meta: { title: "权限管理", componentName: "PermissionsView" },
  },
  {
    path: "settings",
    name: "settings",
    component: () => import("@/views/system/settings-view.vue"),
    meta: { title: "系统设置", componentName: "SettingsView" },
  },
];
