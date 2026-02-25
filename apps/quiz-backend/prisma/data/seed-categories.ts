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
 * 按 CATEGORY_GROUPS 定义逐级查找或创建 CategoryGroup 和 Category
 */
export async function seedCategories(prisma: PrismaClient): Promise<void> {
  console.log("  🗂️ 创建分类体系...");

  /** 按名称查找或创建维度 */
  async function getOrCreateGroup(name: string): Promise<number> {
    const existing = await prisma.categoryGroup.findFirst({ where: { name } });
    if (existing) return existing.id;
    const created = await prisma.categoryGroup.create({ data: { name } });
    return created.id;
  }

  /** 按 groupId + parentId + name 查找或创建分类节点 */
  async function getOrCreateCategory(
    name: string,
    groupId: number,
    parentId?: number,
  ): Promise<number> {
    const existing = await prisma.category.findFirst({
      where: { name, groupId, parentId: parentId ?? null },
    });
    if (existing) return existing.id;
    const created = await prisma.category.create({
      data: { name, groupId, parentId: parentId ?? null },
    });
    return created.id;
  }

  for (const group of CATEGORY_GROUPS) {
    const groupId = await getOrCreateGroup(group.name);

    for (const root of group.categories) {
      const rootId = await getOrCreateCategory(root.name, groupId);
      for (const child of root.children ?? []) {
        await getOrCreateCategory(child.name, groupId, rootId);
      }
    }
  }

  console.log("     ✓ 技术方向（前端/后端/通用三棵子树）+ 难度（四级）");
}

/**
 * 将测试题关联到对应的结构化分类（幂等）
 * 依赖 seedCategories() 已经执行、分类节点已存在
 */
export async function linkTestQuestionCategories(
  prisma: PrismaClient,
): Promise<void> {
  console.log("seedTest: linking test questions to categories...");

  for (const [stem, pairs] of TEST_QUESTION_CATEGORY_MAP) {
    const question = await prisma.question.findFirst({ where: { stem } });
    if (!question) continue;

    for (const [groupName, catName] of pairs) {
      const group = await prisma.categoryGroup.findFirst({
        where: { name: groupName },
      });
      if (!group) continue;

      const category = await prisma.category.findFirst({
        where: { name: catName, groupId: group.id },
      });
      if (!category) continue;

      await prisma.questionCategory.upsert({
        where: {
          questionId_categoryId: {
            questionId: question.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: { questionId: question.id, categoryId: category.id },
      });
    }
    console.log("  Linked categories for:", stem);
  }
}
