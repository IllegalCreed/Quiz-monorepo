/**
 * 生产内容导入脚本
 *
 * 功能：
 *   1. 导入完整分类体系（幂等，已存在则跳过）
 *   2. 导入各技术的题目 JSON（幂等，按 stem 去重，已存在则更新）
 *   3. 关联题目到分类
 *
 * 原则：
 *   - 只增不删，绝不调用 deleteMany / resetAutoIncrements
 *   - 可在生产环境安全重复运行
 *   - 与 seed 体系完全独立
 *
 * 用法（通过 package.json 脚本）：
 *   pnpm run import:content:dev
 *   pnpm run import:content:prod
 */

import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  CONTENT_CATEGORY_GROUPS,
  type CategoryNode,
} from "../prisma/content/categories";

// ============================================
// 初始化 Prisma Client（与 db-utils.ts 相同模式）
// ============================================

if (!process.env.DATABASE_URL) {
  if (
    process.env.DATABASE_HOST &&
    process.env.DATABASE_USERNAME &&
    process.env.DATABASE_PASSWORD &&
    process.env.DATABASE_NAME
  ) {
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT || "3306";
    const user = encodeURIComponent(process.env.DATABASE_USERNAME);
    const pass = encodeURIComponent(process.env.DATABASE_PASSWORD);
    const db = process.env.DATABASE_NAME;
    process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
  } else {
    throw new Error(
      "DATABASE_URL not set. Please load your dotenv file in the caller.",
    );
  }
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

// ============================================
// 类型定义
// ============================================

/** 题目 JSON 格式 */
interface SeedOption {
  text: string;
  isCorrect: boolean;
  description?: string;
}

interface SeedQuestion {
  stem: string;
  explanation?: string | null;
  tags?: string[] | null;
  options: SeedOption[];
}

/** 分类映射格式：[题干, [[维度名, 叶子分类名], ...]][] */
type CategoryMap = [string, [string, string][]][];

/** 内存中分类名称 → ID 的快速查找索引 */
interface CategoryIndex {
  /** groupName → leafName → categoryId */
  [groupName: string]: { [leafName: string]: number };
}

// ============================================
// 工具函数
// ============================================

function log(msg: string) {
  console.log(`[import-content] ${msg}`);
}

// ============================================
// 第一步：导入分类体系（幂等）
// ============================================

/**
 * 递归创建分类节点，已存在则跳过
 * @returns 创建或找到的节点 ID
 */
async function upsertCategoryNode(
  node: CategoryNode,
  groupId: number,
  parentId: number | null,
): Promise<number> {
  // 按 name + groupId + parentId 查找，确保树结构唯一
  const existing = await prisma.category.findFirst({
    where: { name: node.name, groupId, parentId: parentId ?? undefined },
  });

  if (existing) {
    // 递归处理子节点
    if (node.children?.length) {
      for (const child of node.children) {
        await upsertCategoryNode(child, groupId, existing.id);
      }
    }
    return existing.id;
  }

  const created = await prisma.category.create({
    data: {
      name: node.name,
      groupId,
      parentId: parentId ?? undefined,
      sort: node.sort ?? 0,
    },
  });

  log(`  创建分类节点: ${node.name} (id=${created.id})`);

  // 递归处理子节点
  if (node.children?.length) {
    for (const child of node.children) {
      await upsertCategoryNode(child, groupId, created.id);
    }
  }

  return created.id;
}

/**
 * 导入完整分类体系（幂等）
 * @returns 分类索引（用于后续题目关联）
 */
async function importCategories(): Promise<CategoryIndex> {
  log("=== 开始导入分类体系 ===");
  const index: CategoryIndex = {};

  for (const groupDef of CONTENT_CATEGORY_GROUPS) {
    // 创建或找到维度
    let group = await prisma.categoryGroup.findFirst({
      where: { name: groupDef.name },
    });

    if (!group) {
      group = await prisma.categoryGroup.create({
        data: { name: groupDef.name, sort: groupDef.sort },
      });
      log(`创建分类维度: ${groupDef.name} (id=${group.id})`);
    } else {
      log(`分类维度已存在: ${groupDef.name} (id=${group.id})`);
    }

    // 递归创建分类树
    for (const node of groupDef.categories) {
      await upsertCategoryNode(node, group.id, null);
    }
  }

  // 构建叶子节点索引（name → id），供题目关联使用
  const allGroups = await prisma.categoryGroup.findMany({
    include: { categories: true },
  });

  for (const g of allGroups) {
    index[g.name] = {};
    // 叶子节点 = 没有子节点的分类
    const leafIds = g.categories
      .map((c) => c.id)
      .filter((id) => !g.categories.some((c) => c.parentId === id));
    for (const id of leafIds) {
      const cat = g.categories.find((c) => c.id === id)!;
      index[g.name][cat.name] = cat.id;
    }
  }

  log("=== 分类体系导入完成 ===");
  return index;
}

// ============================================
// 第二步：导入题目（幂等，按 stem 去重）
// ============================================

/**
 * 导入单个技术的题目 JSON 文件
 */
async function importQuestions(
  jsonPath: string,
  categoryMapPath: string | null,
  categoryIndex: CategoryIndex,
): Promise<void> {
  const techName = path.basename(jsonPath, ".json");
  log(`--- 导入题目: ${techName} ---`);

  // 读取题目数据
  const questions = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  ) as SeedQuestion[];

  // 读取分类映射（可选）
  let categoryMap: CategoryMap = [];
  if (categoryMapPath && fs.existsSync(categoryMapPath)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (await import(categoryMapPath)) as Record<string, any>;
    // 取第一个导出的数组

    const exported = Object.values(mod)[0] as CategoryMap;
    if (Array.isArray(exported)) {
      categoryMap = exported;
    }
  }

  const catMapByRtem = new Map<string, [string, string][]>(categoryMap);

  let created = 0;
  let updated = 0;

  for (const q of questions) {
    const existing = await prisma.question.findFirst({
      where: { stem: q.stem },
      include: { options: true, questionCategories: true },
    });

    let questionId: number;

    if (existing) {
      // 更新：先删旧选项再重建
      await prisma.option.deleteMany({ where: { questionId: existing.id } });
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          explanation: q.explanation ?? undefined,
          tags:
            (q.tags as unknown as import("@prisma/client").Prisma.InputJsonValue) ??
            undefined,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              description: o.description ?? undefined,
            })),
          },
        },
      });
      questionId = existing.id;
      updated++;
    } else {
      // 新建
      const created_ = await prisma.question.create({
        data: {
          stem: q.stem,
          explanation: q.explanation ?? undefined,
          tags:
            (q.tags as unknown as import("@prisma/client").Prisma.InputJsonValue) ??
            undefined,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              description: o.description ?? undefined,
            })),
          },
        },
      });
      questionId = created_.id;
      created++;
    }

    // 关联分类（幂等，已存在则跳过）
    const catPairs = catMapByRtem.get(q.stem);
    if (catPairs) {
      for (const [groupName, leafName] of catPairs) {
        const categoryId = categoryIndex[groupName]?.[leafName];
        if (!categoryId) {
          log(`  ⚠️  找不到分类: [${groupName}] > ${leafName}，跳过`);
          continue;
        }
        // 幂等：已关联则跳过
        await prisma.questionCategory.upsert({
          where: { questionId_categoryId: { questionId, categoryId } },
          create: { questionId, categoryId },
          update: {},
        });
      }
    }
  }

  log(`  完成: 新增 ${created} 道，更新 ${updated} 道`);
}

// ============================================
// 主入口
// ============================================

async function main() {
  const contentDir = path.join(__dirname, "../prisma/content");

  // 1. 导入分类体系
  const categoryIndex = await importCategories();

  // 2. 扫描 content/ 目录下所有 .json 文件（题目数据）
  const jsonFiles = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(contentDir, f));

  if (jsonFiles.length === 0) {
    log("content/ 目录下没有题目 JSON 文件，跳过题目导入");
  }

  for (const jsonFile of jsonFiles) {
    const baseName = path.basename(jsonFile, ".json");
    // 对应的分类映射文件：{techName}-categories.ts
    const catMapPath = path.join(contentDir, `${baseName}-categories.ts`);
    await importQuestions(jsonFile, catMapPath, categoryIndex);
  }

  log("✅ 全部导入完成");
}

main()
  .catch((e) => {
    console.error("❌ 导入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
