/**
 * Prisma 7 配置文件
 *
 * 使用说明：
 * - 默认从 DATABASE_URL 环境变量读取
 * - 如果未设置，使用 placeholder（允许 prisma generate 正常运行）
 * - 实际连接时必须提供真实的 DATABASE_URL
 */
export default {
  datasources: {
    db: {
      provider: "mysql",
      // 使用 placeholder 确保 prisma generate 不报错
      // 实际运行时通过环境变量提供真实连接
      url:
        process.env.DATABASE_URL ??
        "mysql://placeholder:placeholder@localhost:3306/placeholder",
    },
  },
};
