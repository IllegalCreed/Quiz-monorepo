/**
 * 内容导入状态核查脚本
 *
 * 对比 prisma/content/ 下的题目 JSON 与目标数据库，按 stem 统计已入库数量，
 * 找出尚未完整导入的文件。只读，不写库，可对任意环境安全运行。
 *
 * 用法：
 *   npx tsx scripts/check-import-status.ts            # 默认 development
 *   npx tsx scripts/check-import-status.ts test       # 核查测试库
 *   npx tsx scripts/check-import-status.ts production  # 核查生产库
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

// 环境名来自命令行参数，决定加载哪套 .env 文件
const env = process.argv[2] || "development";
dotenv.config({ path: `.env.${env}` });
dotenv.config({ path: `.env.${env}.local`, override: true });

const url = `mysql://${encodeURIComponent(process.env.DATABASE_USERNAME!)}:${encodeURIComponent(
  process.env.DATABASE_PASSWORD!,
)}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT || "3306"}/${process.env.DATABASE_NAME}`;
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(
    `>>> 环境=${env}  DB=${process.env.DATABASE_NAME}@${process.env.DATABASE_HOST}`,
  );

  const contentDir = path.join(__dirname, "../prisma/content");
  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  let totalExpected = 0;
  let totalActual = 0;
  const missing: { file: string; expected: number; actual: number }[] = [];

  for (const file of files) {
    const questions = JSON.parse(
      fs.readFileSync(path.join(contentDir, file), "utf-8"),
    ) as { stem: string }[];
    const expected = questions.length;
    totalExpected += expected;

    // 按 stem 统计该文件已入库的题数
    const actual = await prisma.question.count({
      where: { stem: { in: questions.map((q) => q.stem) } },
    });
    totalActual += actual;

    if (actual < expected) {
      missing.push({ file, expected, actual });
      console.log(
        `  ⚠️  ${file.padEnd(30)} ${actual}/${expected} (缺 ${expected - actual} 道)`,
      );
    }
  }

  // 库内 question 总行数 —— 与累计值不符时说明存在跨文件重复 stem
  const dbTotal = await prisma.question.count();
  console.log(`\n内容文件累计: ${totalActual}/${totalExpected} 道已入库`);
  console.log(`库内 question 总行数: ${dbTotal}`);
  console.log(`缺失文件数: ${missing.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
