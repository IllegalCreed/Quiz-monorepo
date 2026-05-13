/**
 * 分类体系种子数据
 *
 * 维度设计：
 * - 技术方向：前端（JS/TS、框架与库、性能优化）/ 后端（Node.js、数据库、网络与协议）/ 通用（算法、安全、工具链）
 * - 难度：入门 / 初级 / 中级 / 高级
 *
 * 测试题分类映射：将 seed-test.json 里的题目关联到对应分类
 */

import type { PrismaClient } from "@prisma/client";

/** 维度树定义 */
const CATEGORY_GROUPS: {
  name: string;
  /** 根节点列表（children 为子节点） */
  categories: { name: string; children?: { name: string }[] }[];
}[] = [
  {
    name: "技术方向",
    categories: [
      {
        name: "前端",
        children: [
          { name: "JavaScript / TypeScript" },
          { name: "框架与库" },
          { name: "性能优化" },
        ],
      },
      {
        name: "后端",
        children: [
          { name: "Node.js" },
          { name: "数据库" },
          { name: "网络与协议" },
        ],
      },
      {
        name: "通用",
        children: [{ name: "算法" }, { name: "安全" }, { name: "工具链" }],
      },
    ],
  },
  {
    name: "难度",
    categories: [
      { name: "入门" },
      { name: "初级" },
      { name: "中级" },
      { name: "高级" },
    ],
  },
];

/**
 * 测试题分类映射
 * 格式：[题干, [维度名, 分类名][] ]
 * 对应 seed-test.json 中的题目
 */
export const TEST_QUESTION_CATEGORY_MAP: [string, [string, string][]][] = [
  [
    "(TEST) JavaScript: 下列哪项会创建闭包？",
    [
      ["技术方向", "JavaScript / TypeScript"],
      ["难度", "中级"],
    ],
  ],
  [
    "(TEST) 数据库索引：哪种情况下会降低写入性能？",
    [
      ["技术方向", "数据库"],
      ["难度", "中级"],
    ],
  ],
  [
    "(TEST) HTTP/2 的主要优点是什么？",
    [
      ["技术方向", "网络与协议"],
      ["难度", "初级"],
    ],
  ],
  [
    "(TEST) 前端性能优化：哪项能减少渲染阻塞？",
    [
      ["技术方向", "性能优化"],
      ["难度", "中级"],
    ],
  ],
  [
    "(TEST) Git: rebase 与 merge 的主要区别是什么？",
    [
      ["技术方向", "工具链"],
      ["难度", "初级"],
    ],
  ],
  [
    "(TEST) SQL 注入的常见防护方法是？",
    [
      ["技术方向", "安全"],
      ["难度", "初级"],
    ],
  ],
  [
    "(TEST) 算法复杂度：二分查找的时间复杂度是？",
    [
      ["技术方向", "算法"],
      ["难度", "初级"],
    ],
  ],
  [
    "(TEST) Redis 的持久化方式有哪两种？",
    [
      ["技术方向", "数据库"],
      ["难度", "中级"],
    ],
  ],
  [
    "(TEST) HTTP 状态码 429 表示什么？",
    [
      ["技术方向", "网络与协议"],
      ["难度", "初级"],
    ],
  ],
  [
    "(TEST) Node.js: 微任务（microtask）与宏任务（macrotask）执行顺序哪个优先？",
    [
      ["技术方向", "Node.js"],
      ["难度", "中级"],
    ],
  ],
];

/**
 * 创建初始分类体系（幂等）
 *
 * 优化策略：批量加载已有维度/分类到内存 Map，对缺失项用 createMany 批量插入，
 * 三层（CategoryGroup → 根分类 → 子分类）各自只有 ≤3 次往返。
 */
export async function seedCategories(prisma: PrismaClient): Promise<void> {
  console.log("  🗂️ 创建分类体系...");

  // ── 1. 维度（CategoryGroup） ──
  const groupNames = CATEGORY_GROUPS.map((g) => g.name);
  const existingGroups = await prisma.categoryGroup.findMany({
    where: { name: { in: groupNames } },
    select: { id: true, name: true },
  });
  const groupByName = new Map<string, number>(
    existingGroups.map((g) => [g.name, g.id]),
  );
  const missingGroups = groupNames.filter((n) => !groupByName.has(n));
  if (missingGroups.length) {
    await prisma.categoryGroup.createMany({
      data: missingGroups.map((name) => ({ name })),
    });
    const refetched = await prisma.categoryGroup.findMany({
      where: { name: { in: missingGroups } },
      select: { id: true, name: true },
    });
    for (const g of refetched) groupByName.set(g.name, g.id);
  }

  // ── 2. 根分类（parentId = null） ──
  const rootSpecs: { name: string; groupId: number }[] = [];
  for (const g of CATEGORY_GROUPS) {
    const groupId = groupByName.get(g.name)!;
    for (const root of g.categories) {
      rootSpecs.push({ name: root.name, groupId });
    }
  }
  const existingRoots = await prisma.category.findMany({
    where: {
      parentId: null,
      groupId: { in: Array.from(groupByName.values()) },
    },
    select: { id: true, name: true, groupId: true },
  });
  // 用 "groupId::name" 作为唯一键
  const rootKey = (groupId: number, name: string) => `${groupId}::${name}`;
  const rootIdByKey = new Map<string, number>(
    existingRoots.map((r) => [rootKey(r.groupId, r.name), r.id]),
  );
  const missingRoots = rootSpecs.filter(
    (s) => !rootIdByKey.has(rootKey(s.groupId, s.name)),
  );
  if (missingRoots.length) {
    await prisma.category.createMany({ data: missingRoots });
    const refetched = await prisma.category.findMany({
      where: {
        parentId: null,
        OR: missingRoots.map((r) => ({ name: r.name, groupId: r.groupId })),
      },
      select: { id: true, name: true, groupId: true },
    });
    for (const r of refetched)
      rootIdByKey.set(rootKey(r.groupId, r.name), r.id);
  }

  // ── 3. 子分类（parentId 指向根分类） ──
  const childSpecs: { name: string; groupId: number; parentId: number }[] = [];
  for (const g of CATEGORY_GROUPS) {
    const groupId = groupByName.get(g.name)!;
    for (const root of g.categories) {
      const parentId = rootIdByKey.get(rootKey(groupId, root.name))!;
      for (const child of root.children ?? []) {
        childSpecs.push({ name: child.name, groupId, parentId });
      }
    }
  }
  if (childSpecs.length) {
    const existingChildren = await prisma.category.findMany({
      where: {
        parentId: { in: childSpecs.map((c) => c.parentId) },
        name: { in: childSpecs.map((c) => c.name) },
      },
      select: { name: true, parentId: true },
    });
    const childKey = (parentId: number, name: string) => `${parentId}::${name}`;
    const existingChildKeys = new Set(
      existingChildren.map((c) => childKey(c.parentId!, c.name)),
    );
    const missingChildren = childSpecs.filter(
      (c) => !existingChildKeys.has(childKey(c.parentId, c.name)),
    );
    if (missingChildren.length) {
      await prisma.category.createMany({ data: missingChildren });
    }
  }

  console.log("     ✓ 技术方向（前端/后端/通用三棵子树）+ 难度（四级）");
}

/**
 * 将测试题关联到对应的结构化分类（幂等）
 *
 * 优化策略：一次性把所有相关 stem / groupName / categoryName 加载到内存，
 * 构建 join 行清单后用 createMany + skipDuplicates 批量插入。原实现 10 道题
 * × (1 + 2 × 3) = 70 次往返，现压缩到 4 次。
 *
 * 依赖 seedCategories() 已经执行、分类节点已存在
 */
export async function linkTestQuestionCategories(
  prisma: PrismaClient,
): Promise<void> {
  console.log("seedTest: linking test questions to categories...");

  // 收集所有用到的 stem / 维度名 / 分类名（按维度去重映射）
  const stems = TEST_QUESTION_CATEGORY_MAP.map(([stem]) => stem);
  const groupNames = Array.from(
    new Set(
      TEST_QUESTION_CATEGORY_MAP.flatMap(([, pairs]) => pairs.map(([g]) => g)),
    ),
  );
  const catNames = Array.from(
    new Set(
      TEST_QUESTION_CATEGORY_MAP.flatMap(([, pairs]) =>
        pairs.map(([, c]) => c),
      ),
    ),
  );

  // 并行加载题目 + 维度 + 分类
  const [questions, groups, categories] = await Promise.all([
    prisma.question.findMany({
      where: { stem: { in: stems } },
      select: { id: true, stem: true },
    }),
    prisma.categoryGroup.findMany({
      where: { name: { in: groupNames } },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { name: { in: catNames } },
      select: { id: true, name: true, groupId: true },
    }),
  ]);

  const questionIdByStem = new Map(questions.map((q) => [q.stem, q.id]));
  const groupIdByName = new Map(groups.map((g) => [g.name, g.id]));
  // 同名分类可能跨维度，需用 "groupId::name" 唯一定位
  const categoryIdByKey = new Map(
    categories.map((c) => [`${c.groupId}::${c.name}`, c.id]),
  );

  // 构建待插入的 (questionId, categoryId) 对
  const rows: { questionId: number; categoryId: number }[] = [];
  for (const [stem, pairs] of TEST_QUESTION_CATEGORY_MAP) {
    const questionId = questionIdByStem.get(stem);
    if (!questionId) continue;
    for (const [groupName, catName] of pairs) {
      const groupId = groupIdByName.get(groupName);
      if (!groupId) continue;
      const categoryId = categoryIdByKey.get(`${groupId}::${catName}`);
      if (!categoryId) continue;
      rows.push({ questionId, categoryId });
    }
  }

  if (rows.length) {
    await prisma.questionCategory.createMany({
      data: rows,
      skipDuplicates: true,
    });
  }
  console.log(`  Linked categories for ${questions.length} test questions`);
}
