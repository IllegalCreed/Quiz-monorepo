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

/** 题目 JSON 格式（含内嵌分类映射） */
interface SeedOption {
  text: string;
  isCorrect: boolean;
  description?: string;
}

interface SeedQuestion {
  stem: string;
  explanation?: string | null;
  tags?: string[] | null;
  /** 内嵌分类映射：[[维度名, 叶子分类名], ...] */
  categories?: [string, string][];
  options: SeedOption[];
}

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
 * 递归创建分类节点；先查内存索引，未命中才 create（已存在则跳过）
 *
 * 性能：用预加载的 nodeIndex 取代逐节点 `findFirst`。原实现对几百个分类节点
 * 各发一次 findFirst，远程 RDS 下 = 几百次串行查询 × 网络往返，耗时数分钟；
 * 改为内存命中后仅对缺失节点 create，整树查询压成上层一次 findMany。
 *
 * @param nodeIndex key=`${groupId}:${parentId??0}:${name}` → categoryId
 * @returns 创建或找到的节点 ID
 */
async function upsertCategoryNode(
  node: CategoryNode,
  groupId: number,
  parentId: number | null,
  nodeIndex: Map<string, number>,
): Promise<number> {
  // key 由 groupId + parentId + name 组成，确保树结构唯一
  const key = `${groupId}:${parentId ?? 0}:${node.name}`;
  let id = nodeIndex.get(key);

  if (id === undefined) {
    const created = await prisma.category.create({
      data: {
        name: node.name,
        groupId,
        parentId: parentId ?? undefined,
        sort: node.sort ?? 0,
      },
    });
    id = created.id;
    nodeIndex.set(key, id);
    log(`  创建分类节点: ${node.name} (id=${id})`);
  }

  // 递归处理子节点（命中与否都要递归，确保新增的子节点被创建）
  if (node.children?.length) {
    for (const child of node.children) {
      await upsertCategoryNode(child, groupId, id, nodeIndex);
    }
  }

  return id;
}

/**
 * 导入完整分类体系（幂等）
 * @returns 分类索引（用于后续题目关联）
 */
async function importCategories(): Promise<CategoryIndex> {
  log("=== 开始导入分类体系 ===");
  const index: CategoryIndex = {};

  // 预加载所有现有分类到内存索引，避免逐节点 findFirst
  // （远程 RDS 下几百节点 × 串行查询 × 网络往返会极慢，这里压成 1 次 findMany）
  const existingCats = await prisma.category.findMany({
    select: { id: true, name: true, groupId: true, parentId: true },
  });
  const nodeIndex = new Map<string, number>();
  for (const c of existingCats) {
    nodeIndex.set(`${c.groupId}:${c.parentId ?? 0}:${c.name}`, c.id);
  }

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
      await upsertCategoryNode(node, group.id, null, nodeIndex);
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
 * 分类信息从 JSON 的 categories 字段内嵌读取
 */
async function importQuestions(
  jsonPath: string,
  categoryIndex: CategoryIndex,
): Promise<void> {
  const techName = path.basename(jsonPath, ".json");
  log(`--- 导入题目: ${techName} ---`);

  // 读取题目数据（含内嵌 categories）
  const questions = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  ) as SeedQuestion[];

  // 断点续传 / 防 RDS 连接池超时：该文件所有 stem 已入库则整文件跳过。
  // 真题只增不删，已完整的文件无需重复 update；仅未完整的文件才逐题处理。
  if (questions.length > 0) {
    const dbCount = await prisma.question.count({
      where: { stem: { in: questions.map((q) => q.stem) } },
    });
    if (dbCount === questions.length) {
      log(`  已完整 ${dbCount}/${questions.length}，跳过`);
      return;
    }
  }

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

    // 关联分类（幂等，已存在则跳过）—— 从 JSON 内嵌的 categories 字段读取
    if (q.categories?.length) {
      for (const [groupName, leafName] of q.categories) {
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
  // 可选：命令行传入库名（basename，不含 .json）则只导这些库，跳过全目录扫描
  // —— 大幅加速 + 减少远程 RDS 连接压力（避免连接池超时）。例：import:content:prod -- axios zod
  const onlyTechs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  let jsonFiles = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(contentDir, f));
  if (onlyTechs.length > 0) {
    jsonFiles = jsonFiles.filter((p) =>
      onlyTechs.includes(path.basename(p, ".json")),
    );
    log(`仅导入指定库（${jsonFiles.length}）: ${onlyTechs.join(", ")}`);
  }

  if (jsonFiles.length === 0) {
    log("content/ 目录下没有题目 JSON 文件，跳过题目导入");
  }

  for (const jsonFile of jsonFiles) {
    await importQuestions(jsonFile, categoryIndex);
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
