import { Injectable } from "@nestjs/common";

/**
 * 菜单权限定义
 */
export interface MenuPermission {
  id: string;
  name: string;
  description: string;
}

/**
 * API 权限定义
 */
export interface ApiPermission {
  id: string;
  name: string;
  description: string;
  module: string;
}

/**
 * 权限服务
 * 提供系统中所有可用的菜单权限和 API 权限
 */
@Injectable()
export class PermissionsService {
  /**
   * 获取所有菜单权限
   * 这些权限用于控制前端菜单的显示
   */
  getMenuPermissions(): MenuPermission[] {
    return [
      {
        id: "dashboard",
        name: "欢迎页",
        description: "系统首页和统计数据",
      },
      {
        id: "users",
        name: "用户管理",
        description: "App 用户的增删改查",
      },
      {
        id: "admins",
        name: "管理员管理",
        description: "后台管理员的增删改查",
      },
      {
        id: "roles",
        name: "角色管理",
        description: "角色及权限配置",
      },
      {
        id: "permissions",
        name: "权限管理",
        description: "查看系统所有权限",
      },
      {
        id: "system",
        name: "系统管理",
        description: "系统配置和日志",
      },
    ];
  }

  /**
   * 获取所有 API 权限
   * 这些权限用于控制后端接口的访问
   */
  getApiPermissions(): ApiPermission[] {
    return [
      // 用户管理
      {
        id: "users:list",
        name: "查看用户列表",
        description: "获取 App 用户列表",
        module: "users",
      },
      {
        id: "users:create",
        name: "创建用户",
        description: "添加新的 App 用户",
        module: "users",
      },
      {
        id: "users:update",
        name: "更新用户",
        description: "修改用户信息",
        module: "users",
      },
      {
        id: "users:delete",
        name: "删除用户",
        description: "删除 App 用户",
        module: "users",
      },
      {
        id: "users:*",
        name: "用户管理（全部）",
        description: "用户模块的所有权限",
        module: "users",
      },

      // 管理员管理
      {
        id: "admins:list",
        name: "查看管理员列表",
        description: "获取后台管理员列表",
        module: "admins",
      },
      {
        id: "admins:create",
        name: "创建管理员",
        description: "添加新的管理员",
        module: "admins",
      },
      {
        id: "admins:update",
        name: "更新管理员",
        description: "修改管理员信息（包括角色分配）",
        module: "admins",
      },
      {
        id: "admins:delete",
        name: "删除管理员",
        description: "删除管理员账号",
        module: "admins",
      },
      {
        id: "admins:*",
        name: "管理员管理（全部）",
        description: "管理员模块的所有权限",
        module: "admins",
      },

      // 角色管理
      {
        id: "roles:list",
        name: "查看角色列表",
        description: "获取所有角色",
        module: "roles",
      },
      {
        id: "roles:create",
        name: "创建角色",
        description: "添加新的角色",
        module: "roles",
      },
      {
        id: "roles:update",
        name: "更新角色",
        description: "修改角色信息和权限配置",
        module: "roles",
      },
      {
        id: "roles:delete",
        name: "删除角色",
        description: "删除角色",
        module: "roles",
      },
      {
        id: "roles:*",
        name: "角色管理（全部）",
        description: "角色模块的所有权限",
        module: "roles",
      },

      // 权限管理
      {
        id: "permissions:list",
        name: "查看权限列表",
        description: "获取系统所有权限",
        module: "permissions",
      },
      {
        id: "permissions:*",
        name: "权限管理（全部）",
        description: "权限模块的所有权限",
        module: "permissions",
      },

      // 题目管理
      {
        id: "questions:list",
        name: "查看题目列表",
        description: "获取所有题目",
        module: "questions",
      },
      {
        id: "questions:create",
        name: "创建题目",
        description: "添加新题目",
        module: "questions",
      },
      {
        id: "questions:update",
        name: "更新题目",
        description: "修改题目内容",
        module: "questions",
      },
      {
        id: "questions:delete",
        name: "删除题目",
        description: "删除题目",
        module: "questions",
      },
      {
        id: "questions:*",
        name: "题目管理（全部）",
        description: "题目模块的所有权限",
        module: "questions",
      },

      // 标签管理
      {
        id: "tags:list",
        name: "查看标签列表",
        description: "获取所有标签",
        module: "tags",
      },
      {
        id: "tags:create",
        name: "创建标签",
        description: "添加新标签",
        module: "tags",
      },
      {
        id: "tags:update",
        name: "更新标签",
        description: "修改标签",
        module: "tags",
      },
      {
        id: "tags:delete",
        name: "删除标签",
        description: "删除标签",
        module: "tags",
      },
      {
        id: "tags:*",
        name: "标签管理（全部）",
        description: "标签模块的所有权限",
        module: "tags",
      },

      // 答题记录管理
      {
        id: "answers:list",
        name: "查看答题记录",
        description: "获取用户答题记录",
        module: "answers",
      },
      {
        id: "answers:delete",
        name: "删除答题记录",
        description: "删除答题记录",
        module: "answers",
      },
      {
        id: "answers:*",
        name: "答题记录（全部）",
        description: "答题记录模块的所有权限",
        module: "answers",
      },

      // 统计数据
      {
        id: "statistics:view",
        name: "查看统计数据",
        description: "查看系统统计信息",
        module: "statistics",
      },
      {
        id: "statistics:*",
        name: "统计数据（全部）",
        description: "统计模块的所有权限",
        module: "statistics",
      },

      // 系统管理
      {
        id: "system:config",
        name: "系统配置",
        description: "修改系统配置",
        module: "system",
      },
      {
        id: "system:logs",
        name: "系统日志",
        description: "查看系统日志",
        module: "system",
      },
      {
        id: "system:*",
        name: "系统管理（全部）",
        description: "系统模块的所有权限",
        module: "system",
      },
    ];
  }
}
