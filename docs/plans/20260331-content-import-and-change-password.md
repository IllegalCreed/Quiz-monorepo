# 内容导入基础设施 + 管理员修改密码

**完成时间：** 2026-03-31
**涉及仓库：** quiz-monorepo

---

## 一、内容生产基础设施

### 新增文件

| 文件                                             | 说明                                                  |
| ------------------------------------------------ | ----------------------------------------------------- |
| `apps/quiz-backend/prisma/content/categories.ts` | 完整分类体系定义，对齐 IllegalCreedWebsite sidebar    |
| `apps/quiz-backend/scripts/import-content.ts`    | 生产内容导入脚本（幂等，只增不删）                    |
| `apps/quiz-backend/scripts/seed-prod.ts`         | 生产专用种子脚本（只调 `seedSystem()`，不含测试数据） |
| `apps/quiz-backend/scripts/cleanup-prod.ts`      | 生产库内容清理脚本（保留 Admin/Role）                 |

### package.json 新增命令

```bash
pnpm run import:content:dev    # 导入内容到开发库
pnpm run import:content:test   # 导入内容到测试库
pnpm run import:content:prod   # 导入内容到生产库
pnpm run db:cleanup:prod       # 清理生产库内容数据（需设 QUIZ_ALLOW_PROD_CLEANUP=true）
pnpm run db:seed:prod          # 生产库种子（现指向 seed-prod.ts，不再混入测试数据）
```

### 分类体系结构

两个 `CategoryGroup`：

1. **技术方向**（sort:1）— 17 个一级分类，深度最多 4 层（如：Web基础知识 → 计算机网络基础 → 网络协议 → HTTP/HTTPS...）
2. **难度**（sort:2）— 4 个叶子节点：入门 / 初级 / 中级 / 高级

### 导入脚本规则（import-content.ts）

- **分类导入**：按 `name + groupId + parentId` 查找，已存在则跳过（幂等）
- **题目导入**：按 `stem` 去重；已存在 → 更新选项+解析；不存在 → 新建
- **分类关联**：读取同目录 `{techName}-categories.ts` 映射文件，`questionCategory.upsert` 幂等写入
- **禁止操作**：绝不调用 `deleteMany` / `resetAutoIncrements`
- 可在生产环境安全重复运行

### 生产库清理结果

执行 `db:cleanup:prod` 后成功清理：

- AnswerAttempt: 11 条
- UserPreference: 6 条
- User: 3 条
- SystemLog: 79 条
- QuestionCategory: 20 条（旧测试数据）
- Option: 32 条
- Question: 11 条
- Category: 16 条
- CategoryGroup: 2 条

保留：Admin（超管 + 普管）、Role（角色及权限）。

---

## 二、管理员修改密码功能

### 后端变更

**新增文件：**`src/admins/dto/change-password.dto.ts`

```typescript
class ChangePasswordDto {
  currentPassword: string; // @IsString @IsNotEmpty
  newPassword: string; // @IsString @IsNotEmpty @MinLength(6)
}
```

**admins.service.ts** 新增 `changeMyPassword(adminId, dto)`：

1. 查出管理员（含密码字段）
2. `bcrypt.compare` 验证当前密码
3. 校验新旧密码不相同
4. `bcrypt.hash` 加密 → `prisma.admin.update`

**admins.controller.ts** 新增端点：

```
PATCH /admin/admins/me/password
```

- 仅需 JWT 认证（无需额外权限），任何已登录管理员均可修改自己的密码
- 使用 `@CurrentAdmin()` 获取当前管理员 ID
- 成功返回 204 No Content

**单测**（`admins.service.spec.ts`）新增 4 个用例：

- ✅ 当前密码正确 → 更新密码
- ✅ 当前密码错误 → BadRequestException
- ✅ 新旧密码相同 → BadRequestException
- ✅ 管理员不存在 → NotFoundException

### 前端变更

| 文件                                    | 改动                                                            |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/types/account.ts`                  | 新增 `ChangePasswordForm` 接口                                  |
| `src/api/account.ts`                    | 新增 `changePassword(form)` → `PATCH /admin/admins/me/password` |
| `src/api/mock/account.ts`               | 新增 Mock `changePassword`（直接成功，无校验）                  |
| `src/stores/modules/account.ts`         | 新增 `changePassword` action（mock/real 切换）                  |
| `src/views/master/header/user-menu.vue` | 下拉菜单新增"修改密码"入口 + inline 对话框                      |

**对话框逻辑：**

- 三个字段：当前密码 / 新密码 / 确认密码
- 表单校验：当前密码非空；新密码 ≥ 6 位；两次输入一致
- 成功后：`ElMessage.success` 提示 → clearToken → clearAllViews → 跳转 `/login`（强制重新登录）

---

## 三、注意事项

- `cleanup-prod.ts` 为一次性脚本，已执行完毕，后续无需再运行（除非有新的测试数据污染）
- 导入内容前确保已运行 `migrate:deploy:prod`（表结构与 schema 一致）
- `import:content:prod` 可重复运行，不会造成数据重复
