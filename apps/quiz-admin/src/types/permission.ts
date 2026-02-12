/**
 * 权限相关类型定义
 *
 * 权限模型：
 * - 超级管理员(super_admin)：拥有全部权限，包括管理员管理
 * - 可配置角色：支持动态创建角色并分配权限
 *
 * 权限命名规范：{模块}:{操作}
 * 操作类型：list(列表), create(创建), update(更新), delete(删除), status(状态切换), permission(权限配置)
 */

/** 菜单权限 */
export interface MenuPermission {
  key: string;
  label: string;
  children?: MenuPermission[];
}

/** API 权限 */
export interface ApiPermission {
  key: string;
  label: string;
  module: string;
}

/** API 权限分组 */
export interface ApiPermissionGroup {
  module: string;
  label: string;
  permissions: ApiPermission[];
}

/** 所有菜单权限 */
export const ALL_MENU_PERMISSIONS: MenuPermission[] = [
  { key: "dashboard", label: "欢迎页" },
  { key: "users", label: "用户管理" },
  { key: "admins", label: "管理员管理" },
  { key: "roles", label: "角色管理" },
  { key: "permissions", label: "权限管理" },
  { key: "system", label: "系统设置" },
];

/** 所有 API 权限分组（按模块组织） */
export const ALL_API_PERMISSION_GROUPS: ApiPermissionGroup[] = [
  {
    module: "users",
    label: "App 用户管理",
    permissions: [
      { key: "users:list", label: "查看用户列表", module: "users" },
      { key: "users:create", label: "创建用户", module: "users" },
      { key: "users:update", label: "编辑用户信息", module: "users" },
      { key: "users:status", label: "切换用户状态", module: "users" },
      { key: "users:delete", label: "删除用户", module: "users" },
      { key: "users:export", label: "导出用户数据", module: "users" },
      { key: "users:import", label: "批量导入用户", module: "users" },
    ],
  },
  {
    module: "admins",
    label: "管理员管理",
    permissions: [
      { key: "admins:list", label: "查看管理员列表", module: "admins" },
      { key: "admins:create", label: "创建管理员", module: "admins" },
      { key: "admins:update", label: "编辑管理员信息", module: "admins" },
      { key: "admins:permission", label: "配置管理员权限", module: "admins" },
      { key: "admins:delete", label: "删除管理员", module: "admins" },
    ],
  },
  {
    module: "roles",
    label: "角色管理",
    permissions: [
      { key: "roles:list", label: "查看角色列表", module: "roles" },
      { key: "roles:create", label: "创建角色", module: "roles" },
      { key: "roles:update", label: "编辑角色信息", module: "roles" },
      { key: "roles:permission", label: "配置角色权限", module: "roles" },
      { key: "roles:delete", label: "删除角色", module: "roles" },
      { key: "roles:assign", label: "分配角色给用户", module: "roles" },
    ],
  },
  {
    module: "permissions",
    label: "权限管理",
    permissions: [
      { key: "permissions:list", label: "查看权限列表", module: "permissions" },
      { key: "permissions:view", label: "查看权限详情", module: "permissions" },
    ],
  },
  {
    module: "questions",
    label: "题目管理",
    permissions: [
      { key: "questions:list", label: "查看题目列表", module: "questions" },
      { key: "questions:create", label: "创建题目", module: "questions" },
      { key: "questions:update", label: "编辑题目", module: "questions" },
      { key: "questions:delete", label: "删除题目", module: "questions" },
      { key: "questions:publish", label: "发布题目", module: "questions" },
      { key: "questions:export", label: "导出题目", module: "questions" },
      { key: "questions:import", label: "批量导入题目", module: "questions" },
    ],
  },
  {
    module: "tags",
    label: "标签管理",
    permissions: [
      { key: "tags:list", label: "查看标签列表", module: "tags" },
      { key: "tags:create", label: "创建标签", module: "tags" },
      { key: "tags:update", label: "编辑标签", module: "tags" },
      { key: "tags:delete", label: "删除标签", module: "tags" },
    ],
  },
  {
    module: "answers",
    label: "答题记录管理",
    permissions: [
      { key: "answers:list", label: "查看答题记录", module: "answers" },
      { key: "answers:view", label: "查看答题详情", module: "answers" },
      { key: "answers:export", label: "导出答题数据", module: "answers" },
      { key: "answers:delete", label: "删除答题记录", module: "answers" },
    ],
  },
  {
    module: "statistics",
    label: "数据统计",
    permissions: [
      {
        key: "statistics:dashboard",
        label: "查看数据仪表盘",
        module: "statistics",
      },
      { key: "statistics:users", label: "查看用户统计", module: "statistics" },
      {
        key: "statistics:questions",
        label: "查看题目统计",
        module: "statistics",
      },
      { key: "statistics:export", label: "导出统计报表", module: "statistics" },
    ],
  },
  {
    module: "system",
    label: "系统设置",
    permissions: [
      { key: "system:config", label: "修改系统配置", module: "system" },
      { key: "system:logs", label: "查看系统日志", module: "system" },
      { key: "system:cache", label: "清理系统缓存", module: "system" },
      { key: "system:backup", label: "数据备份", module: "system" },
    ],
  },
];

/** 扁平化的所有 API 权限 */
export const ALL_API_PERMISSIONS: ApiPermission[] = ALL_API_PERMISSION_GROUPS.flatMap(
  (group) => group.permissions,
);
