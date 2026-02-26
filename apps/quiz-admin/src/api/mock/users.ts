/**
 * Mock App 用户管理 API
 * 管理 Quiz 应用的普通用户（非管理员）
 * 与真实 API 返回格式保持一致（分页 + 大写 status）
 */
import type {
  AppUserListItem,
  AppUserDetail,
  AnswerAttemptItem,
  UserPreferenceItem,
} from "@/types/account";
import type { PaginatedResult, QueryAppUsersParams } from "@/api/users";

/** Mock 数据库 - App 用户列表 */
const mockAppUsers: AppUserListItem[] = [
  {
    id: 1,
    username: "zhangsan",
    nickname: "张三",
    email: "zhangsan@example.com",
    status: "ACTIVE",
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2024-03-01T10:00:00.000Z",
    _count: { answerAttempts: 15 },
  },
  {
    id: 2,
    username: "lisi",
    nickname: "李四",
    email: "lisi@example.com",
    status: "ACTIVE",
    createdAt: "2024-03-05T14:30:00.000Z",
    updatedAt: "2024-03-05T14:30:00.000Z",
    _count: { answerAttempts: 8 },
  },
  {
    id: 3,
    username: "wangwu",
    nickname: "王五",
    email: "wangwu@example.com",
    status: "DISABLED",
    createdAt: "2024-03-10T09:15:00.000Z",
    updatedAt: "2024-04-01T16:00:00.000Z",
    _count: { answerAttempts: 3 },
  },
  {
    id: 4,
    username: "zhaoliu",
    nickname: "赵六",
    email: "zhaoliu@example.com",
    status: "ACTIVE",
    createdAt: "2024-03-15T11:45:00.000Z",
    updatedAt: "2024-03-15T11:45:00.000Z",
    _count: { answerAttempts: 22 },
  },
  {
    id: 5,
    username: "sunqi",
    nickname: "孙七",
    email: "sunqi@example.com",
    status: "ACTIVE",
    createdAt: "2024-04-02T08:20:00.000Z",
    updatedAt: "2024-04-02T08:20:00.000Z",
    _count: { answerAttempts: 0 },
  },
];

/**
 * Mock 获取用户列表（分页+搜索）
 */
export const getAppUsers = async (
  params: QueryAppUsersParams = {},
): Promise<PaginatedResult<AppUserListItem>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockAppUsers];

  // 关键词搜索（用户名或昵称）
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (u) => u.username.toLowerCase().includes(kw) || u.nickname.includes(kw),
    );
  }

  // 状态过滤
  if (params.status) {
    filtered = filtered.filter((u) => u.status === params.status);
  }

  // 分页
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { total: filtered.length, items };
};

/**
 * Mock 获取用户详情
 */
export const getAppUser = async (id: number): Promise<AppUserDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const user = mockAppUsers.find((u) => u.id === id);
  if (!user) {
    throw new Error(`用户 ID ${id} 不存在`);
  }

  return {
    ...user,
    _count: { answerAttempts: user._count.answerAttempts, preferences: 2 },
  };
};

/**
 * Mock 获取用户做题历史（分页）
 */
export const getAppUserHistory = async (
  id: number,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<AnswerAttemptItem>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = mockAppUsers.find((u) => u.id === id);
  if (!user) throw new Error(`用户 ID ${id} 不存在`);

  // 生成模拟做题记录
  const total = user._count.answerAttempts;
  const mockItems: AnswerAttemptItem[] = [];
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  for (let i = start; i < end; i++) {
    mockItems.push({
      id: i + 1,
      questionId: (i % 10) + 1,
      selectedOption: (i % 4) + 1,
      correct: i % 3 !== 0,
      elapsedMs: 3000 + Math.floor(Math.random() * 12000),
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      question: {
        id: (i % 10) + 1,
        stem: `(Mock) 测试题目 #${(i % 10) + 1}`,
        type: "single_choice",
      },
    });
  }

  return { total, items: mockItems };
};

/**
 * Mock 获取用户偏好分类
 */
export const getAppUserPreferences = async (id: number): Promise<UserPreferenceItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const user = mockAppUsers.find((u) => u.id === id);
  if (!user) throw new Error(`用户 ID ${id} 不存在`);

  return [
    {
      userId: id,
      categoryId: 1,
      category: { id: 1, name: "JavaScript", group: { id: 1, name: "技术方向" } },
    },
    {
      userId: id,
      categoryId: 5,
      category: { id: 5, name: "中等", group: { id: 2, name: "难度" } },
    },
  ];
};

/**
 * Mock 更新 App 用户状态
 */
export const updateAppUserStatus = async (
  id: number,
  status: "ACTIVE" | "DISABLED",
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const user = mockAppUsers.find((u) => u.id === id);
  if (!user) {
    throw new Error(`用户 ID ${id} 不存在`);
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();
};

/**
 * Mock 删除 App 用户
 */
export const deleteAppUser = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const index = mockAppUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`用户 ID ${id} 不存在`);
  }

  mockAppUsers.splice(index, 1);
};
