/**
 * 权限-路由映射表
 * 定义每个菜单权限对应哪些路由名称
 */
export const permissionRoutesMapping: Record<string, string[]> = {
  dashboard: ["dashboard"],
  users: ["users"],
  // 题目管理：列表页 + 详情页（新建/编辑）均需 questions 权限
  questions: ["questions", "question-detail"],
  admins: ["admins"],
  roles: ["roles"],
  permissions: ["permissions"],
  system: ["settings"],
};
