/**
 * Home 页面子路由定义
 * 包含所有业务页面路由
 */
import type { RouteRecordRaw } from 'vue-router'

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/dashboard-view.vue'),
    meta: { title: '欢迎页' },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/views/users/users-view.vue'),
    meta: { title: '用户管理' },
  },
  {
    path: 'admins',
    name: 'admins',
    component: () => import('@/views/admins/admins-view.vue'),
    meta: { title: '管理员管理' },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/views/roles/roles-view.vue'),
    meta: { title: '角色管理' },
  },
  {
    path: 'permissions',
    name: 'permissions',
    component: () => import('@/views/permissions/permissions-view.vue'),
    meta: { title: '权限管理' },
  },
  {
    path: 'settings',
    name: 'settings',
    component: () => import('@/views/system/settings-view.vue'),
    meta: { title: '系统设置' },
  },
]
