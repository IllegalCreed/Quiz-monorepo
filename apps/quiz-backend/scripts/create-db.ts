#!/usr/bin/env node
/**
 * 数据库初始化脚本
 *
 * 功能：创建三个数据库环境（dev/test/prod）及对应用户
 *
 * 用法：
 *   1. 复制 .env.create-db.example 为 .env.create-db.local
 *   2. 填写 DB_ROOT_USERNAME 和 DB_ROOT_PASSWORD
 *   3. 运行 pnpm run db:create
 *
 * 注意：需要 root 或具有 CREATE DATABASE/USER 权限的用户
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// 加载环境变量
dotenv.config();
const localCreateEnvPaths = [
  path.resolve(__dirname, "../.env.create-db.local"),
  path.resolve(process.cwd(), ".env.create-db.local"),
];
for (const p of localCreateEnvPaths) {
  try {
    dotenv.config({ path: p });
  } catch {
    // ignore
  }
}

// 数据库连接配置
const config = {
  host: process.env.DATABASE_HOST || "127.0.0.1",
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  rootUser:
    process.env.DB_ROOT_USERNAME || process.env.DATABASE_USERNAME || "root",
  rootPassword:
    process.env.DB_ROOT_PASSWORD || process.env.DATABASE_PASSWORD || "",
};

// 三个环境的数据库配置
const environments = [
  {
    name: "dev",
    db: process.env.DEV_DATABASE_NAME || "quiz_dev",
    user: process.env.DEV_DATABASE_USER || "quiz_dev_user",
    password:
      process.env.DEV_DATABASE_PASSWORD ||
      crypto.randomBytes(12).toString("base64"),
  },
  {
    name: "test",
    db: process.env.TEST_DATABASE_NAME || "quiz_test",
    user: process.env.TEST_DATABASE_USER || "quiz_test_user",
    password:
      process.env.TEST_DATABASE_PASSWORD ||
      crypto.randomBytes(12).toString("base64"),
  },
  {
    name: "prod",
    db: process.env.PROD_DATABASE_NAME || "quiz_prod",
    user: process.env.PROD_DATABASE_USER || "quiz_prod_user",
    password:
      process.env.PROD_DATABASE_PASSWORD ||
      crypto.randomBytes(12).toString("base64"),
  },
];

/**
 * 确保数据库和用户存在
 */
async function ensureDatabase(
  conn: mysql.Connection,
  db: string,
  user: string,
  pwd: string,
) {
  console.log(`📦 创建数据库: ${db}`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\`;`);

  console.log(`👤 创建用户: ${user}`);
  await conn.query(
    `CREATE USER IF NOT EXISTS \`${user}\`@'%' IDENTIFIED BY ?;`,
    [pwd],
  );

  console.log(`🔐 授权: ${user} → ${db}`);
  await conn.query(`GRANT ALL PRIVILEGES ON \`${db}\`.* TO \`${user}\`@'%';`);

  console.log(`✅ ${db} / ${user} 创建完成\n`);
}

/**
 * 打印摘要信息
 */
function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("📋 数据库创建摘要（请妥善保管这些密钥）");
  console.log("=".repeat(60) + "\n");

  for (const env of environments) {
    console.log(`【${env.name.toUpperCase()}】`);
    console.log(`  DATABASE_NAME: ${env.db}`);
    console.log(`  DATABASE_USER: ${env.user}`);
    console.log(`  DATABASE_PASSWORD: ${env.password}\n`);
  }

  console.log("💡 提示：将这些配置复制到对应的 .env.*.local 文件中");
  console.log("   例如：apps/quiz-backend/.env.development.local\n");
}

/**
 * 主函数
 */
async function main() {
  if (!config.rootPassword) {
    console.error(
      "❌ 缺少 root 密码！请在 .env.create-db.local 中设置 DB_ROOT_PASSWORD",
    );
    process.exit(1);
  }

  console.log(
    `🔌 连接到 ${config.host}:${config.port} (用户: ${config.rootUser})\n`,
  );

  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.rootUser,
    password: config.rootPassword,
  });

  try {
    // 创建所有环境的数据库
    for (const env of environments) {
      await ensureDatabase(conn, env.db, env.user, env.password);
    }

    // 刷新权限
    await conn.query("FLUSH PRIVILEGES;");
    console.log("🔄 权限已刷新\n");

    // 打印摘要
    printSummary();
  } finally {
    await conn.end();
  }
}

void main();
