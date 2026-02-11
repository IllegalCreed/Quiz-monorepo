/**
 * 动态路由更新
 * 根据用户权限动态加载路由
 */
import type { Router } from 'vue-router'
import { homeRoutes } from './home-routes'
import { permissionRoutesMapping } from './permission-routes-mapping'

/** 标记是否已经初始化过路由 */
let isRoutesInitialized = false

/**
 * 重置路由初始化标志（登出时调用）
 */
export const resetRoutesInitialized = () => {
  isRoutesInitialized = false
}

/**
 * 根据用户权限更新 home 子路由
 * @param router 路由实例
 * @param menuPermissions 用户菜单权限数组
 */
export const updateHomeRoutes = (router: Router, menuPermissions: string[]) => {
  // 如果已经初始化过,直接返回(避免重复添加)
  if (isRoutesInitialized) {
    return
  }

  // 获取所有允许访问的路由名称
  const allowedRouteNames = new Set<string>()
  menuPermissions.forEach((permission) => {
    const routes = permissionRoutesMapping[permission] || []
    routes.forEach((name) => allowedRouteNames.add(name))
  })

  // 过滤出有权限的路由
  const filteredRoutes = homeRoutes.filter((route) => allowedRouteNames.has(route.name as string))

  // 添加子路由
  filteredRoutes.forEach((route) => {
    router.addRoute('home', route)
  })

  // 设置默认重定向到第一个子路由
  const firstRoute = filteredRoutes[0]
  if (firstRoute) {
    router.addRoute('home', {
      path: '',
      redirect: { name: firstRoute.name as string },
    })
  }

  // 标记已初始化
  isRoutesInitialized = true
}
