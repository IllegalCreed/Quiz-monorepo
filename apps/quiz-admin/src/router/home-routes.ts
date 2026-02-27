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
    // 详情页不设 componentName，不参与 keep-alive 缓存
    path: "users/:id",
    name: "user-detail",
    component: () => import("@/views/users/user-detail-view.vue"),
    meta: { title: "用户详情", belong: "/home/users" },
  },
  {
    path: "questions",
    name: "questions",
    component: () => import("@/views/questions/questions-view.vue"),
    meta: { title: "题目管理", componentName: "QuestionsView" },
  },
  {
    // 详情页不设 componentName，不参与 keep-alive 缓存
    path: "questions/:id",
    name: "question-detail",
    component: () => import("@/views/questions/question-detail-view.vue"),
    meta: { title: "题目详情", belong: "/home/questions" },
  },
  {
    path: "categories",
    name: "categories",
    component: () => import("@/views/categories/categories-view.vue"),
    meta: { title: "分类管理", componentName: "CategoriesView" },
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
