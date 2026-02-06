# Scripts 说明

本目录包含后端项目的辅助脚本。

## 📁 脚本列表

### create-db.ts

**功能**：初始化数据库环境，创建三个数据库（dev/test/prod）及对应用户

**使用场景**：项目初次设置或重建数据库环境

**使用方法**：

```bash
# 1. 复制配置文件
cp .env.create-db.example .env.create-db.local

# 2. 编辑 .env.create-db.local，填写 root 用户信息
# DB_ROOT_USERNAME=root
# DB_ROOT_PASSWORD=your_password
# DATABASE_HOST=localhost

# 3. 运行脚本
pnpm run db:create
```

**输出**：

- 创建 `quiz_dev`、`quiz_test`、`quiz_prod` 数据库
- 创建对应用户并授权
- 打印生成的密码（请妥善保管）

**注意事项**：

- 需要具有 `CREATE DATABASE` 和 `CREATE USER` 权限的数据库用户
- RDS 等托管数据库通常需要手动创建数据库，此脚本仅适用于自托管 MySQL

---

### seed.ts

**功能**：向数据库插入种子数据

**使用场景**：

- 开发环境：插入基础系统数据
- 测试环境：重置并插入测试数据集
- 生产环境：插入基础系统数据（需确认）

**使用方法**：

```bash
# 开发库
pnpm run db:seed:dev

# 测试库（会先清空数据）
pnpm run db:seed:test

# 生产库（需要设置 QUIZ_ALLOW_PROD_SEED=true）
pnpm run db:seed:prod
```

**特性**：

- 自动加载对应环境的 `.env.*.local` 文件
- 测试库会先清空数据再插入（幂等操作）
- 生产库需要明确确认，防止误操作

---

### rotate-db-passwords.ts

**功能**：安全地轮换数据库密码

**使用场景**：定期更新数据库密码以提升安全性

**使用方法**：

```bash
# 预览轮换计划（dry-run）
pnpm run db:rotate-passwords

# 实际执行轮换
pnpm run db:rotate-passwords --yes
```

**特性**：

- 支持 dry-run 模式预览变更
- 自动更新 `.env.create-db.local` 文件
- 兼容多种 MySQL/MariaDB 版本的 ALTER USER 语法
- 生成强随机密码（24 字节 base64url）

**注意事项**：

- 需要 root 或具有 ALTER USER 权限的用户
- 轮换后需要手动更新各环境的 `.env.*.local` 文件
- 文件权限会自动设置为 0600（仅所有者可读写）

---

### type-check-backend.ts

**功能**：运行 TypeScript 类型检查

**使用场景**：CI/CD 或本地开发时验证类型安全

**使用方法**：

```bash
# 通过 package.json 脚本调用
pnpm run type-check

# 或作为 check 命令的一部分
pnpm run check  # lint + type-check + test:unit
```

**特性**：

- 使用项目本地的 `tsc`
- 只检查类型，不生成文件（`--noEmit`）
- 快速失败，便于 CI 集成

---

## 🔧 开发建议

### 添加新脚本

1. 在 `scripts/` 目录创建 `.ts` 文件
2. 添加文件头注释说明功能和用法
3. 在 `package.json` 中添加对应的脚本命令
4. 更新本 README.md

### 脚本规范

- **文件头**：使用 JSDoc 风格注释说明功能
- **错误处理**：妥善处理错误，使用 `process.exit(1)` 退出
- **日志输出**：使用 emoji 提升可读性（✅ 成功 / ❌ 失败）
- **环境变量**：通过 dotenv-cli 加载，不在脚本内硬编码

### 环境变量管理

- **开发库**：`.env.development.local`
- **测试库**：`.env.test.local`
- **生产库**：`.env.production.local`
- **数据库创建**：`.env.create-db.local`

所有 `.env.*.local` 文件都应添加到 `.gitignore`，不提交到版本控制。

---

## 📚 相关文档

- [CLAUDE.md](../../CLAUDE.md) - AI 开发指南
- [package.json](../package.json) - 所有可用的脚本命令
- [prisma/db-utils.ts](../prisma/db-utils.ts) - 数据库工具函数
