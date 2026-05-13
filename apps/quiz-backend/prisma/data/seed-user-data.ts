/**
 * 测试用户做题历史与偏好分类种子数据
 *
 * 为 testuser1 和 testuser2 创建：
 * - AnswerAttempt 做题记录（关联已有的测试题目）
 * - UserPreference 偏好分类（关联已有的分类节点）
 *
 * 依赖：seedUsers() 和 seedTest() 已执行（用户、题目、分类均已存在）
 */

import type { PrismaClient } from "@prisma/client";

/**
 * 为测试用户插入做题历史和偏好分类数据（幂等）
 */
export async function seedUserData(prisma: PrismaClient): Promise<void> {
  console.log("  📝 创建测试用户做题历史与偏好分类...");

  // ── 1. 获取所有测试题（带选项），用于生成答题记录 ──
  const questions = await prisma.question.findMany({
    where: { stem: { startsWith: "(TEST)" } },
    include: { options: true },
    orderBy: { id: "asc" },
  });

  if (questions.length === 0) {
    console.log("     ⚠ 未找到测试题目，跳过用户数据种子");
    return;
  }

  // ── 2. 为 testuser1 (ID=1) 创建做题记录 ──
  // testuser1 做了前 7 道题，答对 5 道
  const user1Attempts = questions.slice(0, 7).map((q, i) => {
    const correctOption = q.options.find((o) => o.isCorrect);
    const wrongOption = q.options.find((o) => !o.isCorrect);
    // 第 2、5 道题答错，其余答对
    const isWrong = i === 1 || i === 4;
    const selectedOption = isWrong ? wrongOption! : correctOption!;

    return {
      questionId: q.id,
      userId: 1,
      selectedOption: selectedOption.id,
      correct: !isWrong,
      elapsedMs: 3000 + Math.floor(i * 1500), // 3s ~ 12s 递增
      createdAt: new Date(Date.now() - (7 - i) * 86400000), // 倒推 7~1 天前
    };
  });

  // ── 3. 为 testuser2 (ID=2) 创建做题记录 ──
  // testuser2 做了前 4 道题，答对 3 道
  const user2Attempts = questions.slice(0, 4).map((q, i) => {
    const correctOption = q.options.find((o) => o.isCorrect);
    const wrongOption = q.options.find((o) => !o.isCorrect);
    // 第 3 道题答错
    const isWrong = i === 2;
    const selectedOption = isWrong ? wrongOption! : correctOption!;

    return {
      questionId: q.id,
      userId: 2,
      selectedOption: selectedOption.id,
      correct: !isWrong,
      elapsedMs: 5000 + Math.floor(i * 2000), // 5s ~ 11s 递增
      createdAt: new Date(Date.now() - (4 - i) * 86400000), // 倒推 4~1 天前
    };
  });

  // 先清除已有的测试用户答题记录（幂等）
  await prisma.answerAttempt.deleteMany({ where: { userId: { in: [1, 2] } } });

  // 批量插入答题记录
  await prisma.answerAttempt.createMany({
    data: [...user1Attempts, ...user2Attempts],
  });

  console.log(`     ✓ testuser1: ${user1Attempts.length} 条做题记录`);
  console.log(`     ✓ testuser2: ${user2Attempts.length} 条做题记录`);

  // ── 4. 为测试用户创建偏好分类 ──
  // testuser1 偏好：前端方向（JS/TS、框架与库）+ 中级难度
  const user1PrefNames = ["JavaScript / TypeScript", "框架与库", "中级"];
  // testuser2 偏好：后端方向（Node.js、数据库）+ 初级难度
  const user2PrefNames = ["Node.js", "数据库", "初级"];

  // 一次性查出所有偏好用到的分类节点（同名分类按 name 唯一足够，
  // 当前 seed 范围内无歧义），构建 name → id 映射
  const allPrefNames = Array.from(
    new Set([...user1PrefNames, ...user2PrefNames]),
  );
  const cats = await prisma.category.findMany({
    where: { name: { in: allPrefNames } },
    select: { id: true, name: true },
  });
  const categoryIdByName = new Map(cats.map((c) => [c.name, c.id]));

  // 清除已有偏好 + 批量插入新偏好，并行执行
  await prisma.userPreference.deleteMany({
    where: { userId: { in: [1, 2] } },
  });
  const prefRows: { userId: number; categoryId: number }[] = [];
  for (const name of user1PrefNames) {
    const categoryId = categoryIdByName.get(name);
    if (categoryId) prefRows.push({ userId: 1, categoryId });
  }
  for (const name of user2PrefNames) {
    const categoryId = categoryIdByName.get(name);
    if (categoryId) prefRows.push({ userId: 2, categoryId });
  }
  if (prefRows.length) {
    await prisma.userPreference.createMany({ data: prefRows });
  }

  console.log(`     ✓ testuser1: ${user1PrefNames.length} 个偏好分类`);
  console.log(`     ✓ testuser2: ${user2PrefNames.length} 个偏好分类`);
}
