# quiz-backend

Quiz 应用后端 API 服务。

**技术栈**：NestJS + Prisma 7 + MySQL (MariaDB adapter)
**端口**：开发 `10020`，测试 `10020`（独立测试数据库）

---

## 快速开始

1. 复制 `.env.example` 为 `.env.development.local` 并填入数据库连接信息

2. 应用数据库迁移：

   ```bash
   pnpm run migrate:deploy:dev
   ```

3. 生成 Prisma Client：

   ```bash
   pnpm run prisma:generate
   ```

4. 插入开发种子数据：

   ```bash
   pnpm run db:seed:dev
   ```

5. 启动开发服务器：
   ```bash
   pnpm dev
   ```

---

## 常用命令

```bash
pnpm dev                       # 开发服务器 (port 10020, 热重载)
pnpm run build                 # 生产构建
pnpm run test:unit             # 单元测试 (Jest, ~188 tests, 86~95% 覆盖率)
pnpm run check                 # lint + type-check + test:unit (~5s)
pnpm run type-check            # TypeScript 类型检查

# 数据库
pnpm run migrate:deploy:dev    # 应用迁移到开发数据库
pnpm run migrate:status        # 查看所有环境迁移状态
pnpm run db:studio             # 打开 Prisma Studio（可视化查看数据）
pnpm run db:seed:dev           # 插入开发种子数据
pnpm run db:reset:test         # 重置测试数据库（E2E 前使用）
```

---

## API 端点（27 个）

| 模块            | 前缀                 | 端点数                         |
| --------------- | -------------------- | ------------------------------ |
| Auth            | `/admin/auth`        | 3（login / refresh / logout）  |
| Admins          | `/admin/admins`      | 5（CRUD + 状态切换）           |
| Roles           | `/admin/roles`       | 5（CRUD）                      |
| Permissions     | `/admin/permissions` | 2（菜单列表 + API 列表）       |
| AdminQuestions  | `/admin/questions`   | 5（CRUD，软删除）              |
| AdminCategories | `/admin/categories`  | 7（维度 CRUD + 树形节点 CRUD） |
| Questions       | `/api/questions`     | 2（随机题目）                  |
| Answers         | `/api/answers`       | 1（提交答案）                  |
| Test            | `/test/reset`        | 1（E2E 数据重置，仅测试环境）  |

---

## 全局机制

- **JWT 认证**：`JwtAuthGuard` 全局启用，`@Public()` 装饰器跳过
- **权限检查**：`PermissionGuard` 读取 JWT payload 中的 `role.apiPermissions`
- **超级管理员**：通配符权限 `["*"]`，自动放行所有接口
- **响应格式**：`TransformInterceptor` 统一包装为 `{ code: 0, data, message }`
- **异常格式**：`HttpExceptionFilter` 统一返回 `{ statusCode, message, error }`

---

## Prisma 迁移说明

- Prisma 7 配置文件：`prisma.config.ts`（DB URL 不在 `schema.prisma` 中）
- `prisma migrate dev` 需要 shadow DB 权限（RDS 通常无此权限）
- 变通方案：手动写 migration SQL → `prisma migrate deploy`
- 详见 [scripts/README.md](./scripts/README.md)

---

## 相关文档

- [docs/dev.md](../../docs/dev.md) — 技术架构 + DB Schema
- [scripts/README.md](./scripts/README.md) — 数据库脚本说明
