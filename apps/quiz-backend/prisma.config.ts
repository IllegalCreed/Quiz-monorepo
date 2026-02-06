import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 配置文件
 * 数据库连接 URL 在此配置（schema 文件中不再包含 url）
 * 用于 prisma migrate、prisma studio 等 CLI 命令
 *
 * 注意：prisma generate 不需要真实的数据库连接，
 * 因此当 DATABASE_URL 未设置时提供占位 URL 以避免报错。
 */
export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "mysql://placeholder:placeholder@localhost:3306/placeholder",
  },
});
