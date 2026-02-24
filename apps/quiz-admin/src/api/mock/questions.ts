/**
 * 题目管理 Mock API
 * 使用内存数据模拟后端接口，供开发环境使用
 */
import type {
  QuestionDetail,
  QuestionForm,
  QuestionListResponse,
  QueryQuestionsParams,
} from "@/types/question";

/** 模拟延迟（ms） */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 自增 ID 计数器 */
let nextId = 100;

/** 选项 ID 计数器 */
let nextOptionId = 1000;

/** 内存中的题目数据 */
const mockQuestions: QuestionDetail[] = [
  {
    id: 1,
    stem: "JavaScript 中，以下哪种方式可以正确地检查一个变量是否为 null？",
    type: "single_choice",
    explanation:
      "使用 === null 是最严格且推荐的方式，因为它同时检查值和类型，不会与 undefined 混淆。",
    tags: ["JavaScript", "基础"],
    deletedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    _count: { options: 4 },
    options: [
      {
        id: 1,
        questionId: 1,
        text: "variable == null",
        isCorrect: false,
        description: "== null 会同时匹配 null 和 undefined，不够严格。",
      },
      {
        id: 2,
        questionId: 1,
        text: "variable === null",
        isCorrect: true,
        description: "正确！=== null 严格检查类型和值，是推荐做法。",
      },
      {
        id: 3,
        questionId: 1,
        text: "typeof variable === 'null'",
        isCorrect: false,
        description: "typeof null 返回 'object'，不是 'null'，这是 JS 的历史遗留 bug。",
      },
      {
        id: 4,
        questionId: 1,
        text: "!variable",
        isCorrect: false,
        description: "!variable 会把 0、''、false 等假值也视为 null，不准确。",
      },
    ],
  },
  {
    id: 2,
    stem: "Vue 3 中，以下哪个 API 用于在组件外部定义响应式状态？",
    type: "single_choice",
    explanation:
      "ref() 和 reactive() 都可以在组件外部使用，但 ref() 更适合基本类型，reactive() 更适合对象。",
    tags: ["Vue", "响应式"],
    deletedAt: null,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    _count: { options: 4 },
    options: [
      {
        id: 5,
        questionId: 2,
        text: "useState()",
        isCorrect: false,
        description: "useState 是 React 的 Hook，Vue 3 中不存在。",
      },
      {
        id: 6,
        questionId: 2,
        text: "ref()",
        isCorrect: true,
        description: "正确！ref() 可在组件内外使用，通过 .value 访问响应式数据。",
      },
      {
        id: 7,
        questionId: 2,
        text: "data()",
        isCorrect: false,
        description: "data() 是 Vue 2 选项式 API 的写法，不能在组件外使用。",
      },
      {
        id: 8,
        questionId: 2,
        text: "computed()",
        isCorrect: false,
        description: "computed() 用于派生状态，不是独立的响应式状态定义方式。",
      },
    ],
  },
  {
    id: 3,
    stem: "NestJS 中，哪个装饰器用于将类标记为可注入的服务（Provider）？",
    type: "single_choice",
    explanation: "@Injectable() 标记一个类可以被 NestJS 的依赖注入系统管理，是创建服务的基础。",
    tags: ["NestJS", "后端"],
    deletedAt: null,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    _count: { options: 4 },
    options: [
      {
        id: 9,
        questionId: 3,
        text: "@Service()",
        isCorrect: false,
        description: "@Service() 是 Spring（Java）中的注解，NestJS 不使用。",
      },
      {
        id: 10,
        questionId: 3,
        text: "@Injectable()",
        isCorrect: true,
        description: "正确！@Injectable() 是 NestJS 的依赖注入标记装饰器。",
      },
      {
        id: 11,
        questionId: 3,
        text: "@Provider()",
        isCorrect: false,
        description: "@Provider() 不存在，NestJS 用 @Injectable() 标记可注入类。",
      },
      {
        id: 12,
        questionId: 3,
        text: "@Component()",
        isCorrect: false,
        description: "@Component() 是 Angular 的组件装饰器，不是 NestJS 的服务标记。",
      },
    ],
  },
  {
    id: 4,
    stem: "HTTP 状态码 429 表示什么？",
    type: "single_choice",
    explanation:
      "429 Too Many Requests 表示客户端在给定时间内发送了过多请求，常用于 API 限流（Rate Limiting）场景。",
    tags: ["HTTP", "网络"],
    deletedAt: null,
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
    _count: { options: 4 },
    options: [
      {
        id: 13,
        questionId: 4,
        text: "请求超时",
        isCorrect: false,
        description: "请求超时对应 408 Request Timeout。",
      },
      {
        id: 14,
        questionId: 4,
        text: "请求过多（限流）",
        isCorrect: true,
        description: "正确！429 Too Many Requests 是 API 限流的标准响应状态码。",
      },
      {
        id: 15,
        questionId: 4,
        text: "服务不可用",
        isCorrect: false,
        description: "服务不可用对应 503 Service Unavailable。",
      },
      {
        id: 16,
        questionId: 4,
        text: "网关超时",
        isCorrect: false,
        description: "网关超时对应 504 Gateway Timeout。",
      },
    ],
  },
  {
    id: 5,
    stem: "以下哪种排序算法的平均时间复杂度为 O(n log n)？",
    type: "single_choice",
    explanation: "快速排序（Quick Sort）平均时间复杂度为 O(n log n)，最坏情况为 O(n²)。",
    tags: ["算法", "数据结构"],
    deletedAt: null,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    _count: { options: 4 },
    options: [
      {
        id: 17,
        questionId: 5,
        text: "冒泡排序",
        isCorrect: false,
        description: "冒泡排序时间复杂度为 O(n²)，效率较低。",
      },
      {
        id: 18,
        questionId: 5,
        text: "选择排序",
        isCorrect: false,
        description: "选择排序时间复杂度为 O(n²)，不稳定。",
      },
      {
        id: 19,
        questionId: 5,
        text: "快速排序",
        isCorrect: true,
        description: "正确！快速排序平均时间复杂度为 O(n log n)，是实践中最常用的排序算法之一。",
      },
      {
        id: 20,
        questionId: 5,
        text: "插入排序",
        isCorrect: false,
        description: "插入排序时间复杂度为 O(n²)，但对小数据集效果不错。",
      },
    ],
  },
];

/**
 * 获取题目列表（分页、搜索、标签过滤）
 */
export const getQuestions = async (
  params: QueryQuestionsParams = {},
): Promise<QuestionListResponse> => {
  await delay(400);

  const { keyword, tag, page = 1, pageSize = 20 } = params;

  // 按关键词过滤（搜索题干）
  let filtered = mockQuestions.filter((q) => q.deletedAt === null);
  if (keyword) {
    filtered = filtered.filter((q) => q.stem.includes(keyword));
  }

  // 按标签过滤
  if (tag) {
    filtered = filtered.filter((q) => q.tags?.includes(tag) ?? false);
  }

  // 分页
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { total, items };
};

/**
 * 获取题目详情
 */
export const getQuestion = async (id: number): Promise<QuestionDetail> => {
  await delay(300);

  const question = mockQuestions.find((q) => q.id === id && q.deletedAt === null);
  if (!question) {
    throw new Error(`题目 #${id} 不存在`);
  }

  return { ...question };
};

/**
 * 创建题目
 */
export const createQuestion = async (form: QuestionForm): Promise<QuestionDetail> => {
  await delay(500);

  // 校验正确答案数量
  const correctCount = form.options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) {
    throw new Error("单选题必须恰好有 1 个正确答案");
  }

  const questionId = nextId++;
  const now = new Date().toISOString();

  const newQuestion: QuestionDetail = {
    id: questionId,
    stem: form.stem,
    type: form.type,
    explanation: form.explanation || null,
    tags: form.tags.length > 0 ? form.tags : null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    _count: { options: form.options.length },
    options: form.options.map((o) => ({
      id: nextOptionId++,
      questionId,
      text: o.text,
      isCorrect: o.isCorrect,
      description: o.description || null,
    })),
  };

  mockQuestions.push(newQuestion);
  return { ...newQuestion };
};

/**
 * 更新题目（replace-all 选项）
 */
export const updateQuestion = async (
  id: number,
  form: Partial<QuestionForm>,
): Promise<QuestionDetail> => {
  await delay(500);

  const index = mockQuestions.findIndex((q) => q.id === id && q.deletedAt === null);
  if (index === -1) {
    throw new Error(`题目 #${id} 不存在`);
  }

  // 校验正确答案数量（如果提供了选项）
  if (form.options !== undefined) {
    const correctCount = form.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("单选题必须恰好有 1 个正确答案");
    }
  }

  // TypeScript 无法从 findIndex 推断非 -1 时元素一定存在，用 ! 断言
  const question = mockQuestions[index]!;
  const now = new Date().toISOString();

  // 更新字段
  if (form.stem !== undefined) question.stem = form.stem;
  if (form.type !== undefined) question.type = form.type;
  if (form.explanation !== undefined) question.explanation = form.explanation || null;
  if (form.tags !== undefined) question.tags = form.tags.length > 0 ? form.tags : null;
  if (form.options !== undefined) {
    // 替换全部选项
    question.options = form.options.map((o) => ({
      id: nextOptionId++,
      questionId: id,
      text: o.text,
      isCorrect: o.isCorrect,
      description: o.description || null,
    }));
    question._count = { options: question.options.length };
  }
  question.updatedAt = now;

  return { ...question };
};

/**
 * 软删除题目（设置 deletedAt）
 */
export const deleteQuestion = async (id: number): Promise<{ message: string }> => {
  await delay(400);

  const question = mockQuestions.find((q) => q.id === id && q.deletedAt === null);
  if (!question) {
    throw new Error(`题目 #${id} 不存在`);
  }

  question.deletedAt = new Date().toISOString();
  return { message: "题目删除成功" };
};
