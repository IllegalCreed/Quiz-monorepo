/**
 * 系统设置 Mock API
 */
import type { PageCacheSettings, UpdatePageCacheRequest } from "@/types/settings";

/** localStorage 存储键 */
const STORAGE_KEY = "quiz-admin:page-cache-settings";

/**
 * 获取默认缓存配置
 * 默认所有页面都启用缓存（设置页面除外）
 */
const getDefaultCacheSettings = (): PageCacheSettings => ({
  pages: [
    {
      routeName: "dashboard",
      componentName: "DashboardView",
      title: "欢迎页",
      cacheEnabled: true,
    },
    {
      routeName: "users",
      componentName: "UsersView",
      title: "用户管理",
      cacheEnabled: true,
    },
    {
      routeName: "admins",
      componentName: "AdminsView",
      title: "管理员管理",
      cacheEnabled: true,
    },
    {
      routeName: "roles",
      componentName: "RolesView",
      title: "角色管理",
      cacheEnabled: true,
    },
    {
      routeName: "permissions",
      componentName: "PermissionsView",
      title: "权限管理",
      cacheEnabled: true,
    },
    {
      routeName: "settings",
      componentName: "SettingsView",
      title: "系统设置",
      cacheEnabled: false, // 设置页面默认不缓存，确保配置实时更新
    },
  ],
  updatedAt: new Date().toISOString(),
});

/**
 * 从 localStorage 加载缓存配置
 */
const loadFromStorage = (): PageCacheSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("加载缓存配置失败:", error);
  }
  return getDefaultCacheSettings();
};

/**
 * 保存缓存配置到 localStorage
 */
const saveToStorage = (settings: PageCacheSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("保存缓存配置失败:", error);
  }
};

/**
 * 获取页面缓存配置
 */
export const getPageCacheSettings = async (): Promise<PageCacheSettings> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  return loadFromStorage();
};

/**
 * 更新单个页面的缓存配置
 */
export const updatePageCache = async (data: UpdatePageCacheRequest): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 400));

  const settings = loadFromStorage();
  const page = settings.pages.find((p) => p.routeName === data.routeName);

  if (!page) {
    throw new Error(`页面 ${data.routeName} 不存在`);
  }

  page.cacheEnabled = data.cacheEnabled;
  settings.updatedAt = new Date().toISOString();

  saveToStorage(settings);
};

/**
 * 批量更新缓存配置
 */
export const batchUpdatePageCache = async (updates: UpdatePageCacheRequest[]): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  const settings = loadFromStorage();

  updates.forEach(({ routeName, cacheEnabled }) => {
    const page = settings.pages.find((p) => p.routeName === routeName);
    if (page) {
      page.cacheEnabled = cacheEnabled;
    }
  });

  settings.updatedAt = new Date().toISOString();
  saveToStorage(settings);
};

/**
 * 重置为默认配置
 */
export const resetPageCacheSettings = async (): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  const defaultSettings = getDefaultCacheSettings();
  saveToStorage(defaultSettings);
};
