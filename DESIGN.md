# Quiz 项目设计文档（DESIGN.md）

## 一、项目与目标概述 ✅
这是一个用于复习技术知识的选择题网站（单题练习为主）。核心体验：页面中间显示一道选择题，用户选项后立即显示正确或错误反馈；答对后 1s 自动进入下一题；答错则高亮正确答案并显示解析，用户也可以手动点击“下一题”。

MVP 目标：
- 后端（NestJS + Prisma + MySQL）提供题目读取与答题判定接口
- 前端（Vue 3 + Vite + TypeScript setup 语法 + SCSS + UnoCSS）实现答题页面、选项交互、反馈逻辑与自动/手动翻题
- 简洁可复用的组件库放在 `packages/ui`（Shadcn 风格、UnoCSS + SCSS）
- 使用 `fetch` 作为 HTTP 客户端；页面业务逻辑提取到页面内 `composables/`，通用放 `src/composables/`
- 测试：后端用 Jest；前端用 Vitest + Cypress E2E
- 代码质量：Husky + lint-staged + Prettier + ESLint

---

## 二、MVP 功能清单（优先级）
1. GET /api/questions?limit=1（返回一道题）
2. POST /api/answers（提交答案，返回是否正确与解析）
3. 前端 Quiz 页面：展示题干、选项、选择后反馈，高亮正确答案；答对 1s 自动下题；手动下一题按钮
4. 本地 seed 的题库（约 20 道）用于开发与 E2E
5. 基础样式组件库（Button、Card、RadioList、Badge）与文档示例

---

## 三、后端设计（NestJS + Prisma + MySQL） 🔧
- 项目目录：`apps/backend`
- 技术：NestJS、Prisma（schema 与 migrate）、MySQL（docker-compose）、Jest（测试）

### 数据模型（草案，Prisma schema）
```prisma
model Question {
  id          Int      @id @default(autoincrement())
  stem        String
  explanation String?  // 答题解析
  tags        String[] @default([])
  options     Option[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Option {
  id         Int      @id @default(autoincrement())
  question   Question @relation(fields: [questionId], references: [id])
  questionId Int
  text       String
  isCorrect  Boolean  @default(false)
}

// 可选：后续用于记录用户答题历史
model AnswerAttempt {
  id              Int      @id @default(autoincrement())
  questionId      Int
  selectedOption  Int
  correct         Boolean
  elapsedMs       Int?
  createdAt       DateTime @default(now())
}
```

> 说明：MVP 不强制持久化用户做题记录，`AnswerAttempt` 暂时可不启用，但 schema 中保留草案便于后续扩展。

### API 设计
- GET /api/questions?limit=1
  - Response example:
  ```json
  {
    "id": 1,
    "stem": "下面哪个是 JavaScript 的原始类型？",
    "options": [
      {"id": 1, "text": "Object"},
      {"id": 2, "text": "Number"},
      {"id": 3, "text": "Array"}
    ],
    "explanation": "Number 是原始类型之一...",
    "tags": ["javascript","基础"]
  }
  ```

- POST /api/answers
  - Request body:
  ```json
  {"questionId": 1, "selectedOptionId": 2, "elapsedMs": 1234}
  ```
  - Response example:
  ```json
  {"correct": true, "correctOptionId": 2, "explanation": "Number 是原始类型之一..."}
  ```

> 业务规则：后端根据 `questionId` 查出对应题目与选项，判断选中选项对应的 `isCorrect` 字段并返回结果。

---

## 四、前端设计（Vue 3 + Pinia 可选 + fetch） 🎨
- 项目位置：`apps/quiz-app`
- 组件库：`packages/ui`（极简 shadcn 风格）；使用 UnoCSS + SCSS
- 页面结构建议：
  - `src/pages/QuizPage.vue`（使用 `<script setup lang="ts">`）
  - `src/pages/composables/useQuiz.ts`（页面级 composable）
  - `src/composables/useFetch.ts`（通用 fetch 封装）
  - `src/components/QuizCard.vue`, `RadioList.vue`, `NextButton.vue`

交互与行为：
- 用户选择选项后立即禁用选项并显示正确/错误状态
- 答对时显示成功动画/样式，1s 后自动请求下一题
- 答错时高亮正确答案并显示解析，显示 `下一题` 按钮供用户手动翻题
- 错误与正确的视觉状态应可区分且可由主题控制（CSS 变量或 Unocss 主题）

网络层：使用 `fetch` 与后端 API 通信，并在开发时支持 mock 本地 `data/questions.json`（用于没有后端时本地开发）。

测试：前端应包含单元测试（Vitest）覆盖关键逻辑，Cypress E2E 测试覆盖完整答题流程（加载题目、答题、自动/手动翻题）。

---

## 五、开发 & 部署细节
- Database: 使用 `docker-compose` 启动 MySQL（开发默认：user=root, password=password, db=quiz_dev）。
- Prisma: 使用 `prisma migrate` 管理迁移；提供 seed 脚本从 JSON 导入题库
- Nest: 采用模块化结构（QuestionsModule、AnswersModule），控制器、服务、DTO 与管道（ValidationPipe）
- Lint/Format: ESLint + Prettier，提交钩子 Husky + lint-staged（执行 Prettier 与 ESLint --fix）
- CI: 在后续阶段添加（lint、test、build）

### 环境与配置（Environment & Secrets 管理）
为了避免将秘密直接提交仓库，并方便开发与生产环境的区分，建议采用以下 `.env` 策略：

- `.env` — 存放通用默认配置，仓库中提交为 `.env.example`（不要提交真实凭据）。
- `.env.development` / `.env.production` — 环境专项的配置，仓库中提交为 `.env.development.example` / `.env.production.example`（示例文件，不含真实 secrets）。
- `.env.local` / `.env.development.local` / `.env.production.local` — 本地开发或临时覆盖的 secrets（**绝对不提交**，应加入 `.gitignore`）。

实现细节：
- 在每个包（`apps/quiz-backend`, `apps/quiz-app`）放置对应的 `.env.example`，说明必须的变量（例如 `DATABASE_*`，`VITE_API_BASE` 等）。前端仅使用 `VITE_` 前缀的变量，不要在前端暴露数据库凭据。
- 后端使用配置模块（例如 `@nestjs/config` + Dotenv）加载环境变量并在生产环境建议使用云端 Secret Manager 存储真实凭据。
- 我会在仓库根目录和后端、前端的 `README` 中写明如何准备 `.env` 文件与运行迁移/seed 的步骤。

如果你有其他偏好（例如使用 HashiCorp Vault、阿里云 KMS、或将 secrets 存在环境变量管理系统），告诉我我会把其加入到文档与部署脚本中。

---

## 六、示例数据（用于 seed 或本地 mock）
```json
[
  {
    "id": 1,
    "stem": "下面哪个是 JavaScript 的原始类型？",
    "options": [
      {"id": 11, "text": "Object"},
      {"id": 12, "text": "Number", "isCorrect": true},
      {"id": 13, "text": "Array"}
    ],
    "explanation": "Number 是 JS 的原始类型之一",
    "tags": ["javascript"]
  }
]
```

---

## 七、验收标准（MVP）✅
- 后端：实现 `GET /api/questions` 与 `POST /api/answers`，并通过 Jest 单元测试验证核心判定逻辑
- 前端：实现 Quiz 页面并与后端通信，完成自动 1s 下题与手动下一题的 UX；包含 Vitest 与 Cypress 覆盖主要交互
- 项目可通过 `pnpm install` 后使用 `pnpm --filter apps/backend dev`、`pnpm --filter apps/quiz-app dev` 启动（或通过 docker-compose 启动 DB）并能进行完整的答题流程

---

## 八、下一步计划（我将要做的事）
1. 在 `apps/backend` 初始化 NestJS 项目并添加 Prisma schema 与 migration
2. 写好 `GET /questions` 与 `POST /answers` 的实现与 Jest 测试
3. 在 `apps/quiz-app` 实现基础 `Quiz` 页面与 `packages/ui` 的基本组件

---

## 九、长期愿景（Roadmap） 🌱
为防止遗忘，我把你提到的后续畅想集中记录在这里，按主题分组以便后续拆分为可交付的任务：

- 核心功能扩展
  - 题库管理：构建管理后台（CMS），支持导入/导出（CSV/JSON/XLSX）、批量编辑、题目审核与版本化
  - 多种题型：多选题、判断题、填空题、代码运行题（需要沙箱）、主观题（人工评阅）
  - 分类与标签：多维标签、难度、技能点、题目元信息与过滤
  - 用户系统：用户注册/登录、角色（普通用户/管理员）、做题记录与错题本
  - 答题统计：用户或题目维度的正确率、用时分布与趋势分析

- 学习与推荐
  - 错题复习功能：自动收录错题并构建复习计划
  - 推荐算法：基于错题、做题历史与间隔重复（SRS）的推荐，后续可接入 ML 模型
  - 多种练习模式：按标签练习、随机练习、限时/计时模式与模拟测验

- 平台与体验
  - 管理端权限与审计日志、题目审核流程、题目历史版本回滚
  - PWA 与离线支持：允许离线做题并在恢复网络时同步
  - 国际化（i18n）和主题（暗黑模式）支持
  - 可视化仪表盘：关键指标展示（活跃用户、题目通过率、TOP 错题）

- 技术架构与扩展
  - 性能与缓存：Redis 缓存热点题目与统计，优化查询（分页/游标）
  - 异步任务：使用队列（BullMQ）处理导入、导出、模型训练等后台任务
  - 搜索与语义：向量数据库支持相似题搜索与语义检索（Milvus/Weaviate）
  - 可观测性：Prometheus、Grafana、结构化日志与告警配置
  - CI/CD：自动化测试、构建、镜像发布与部署策略（蓝绿/滚动）

- 数据安全与合规
  - RBAC 权限、输入验证、防刷与限流、隐私与数据保留策略
  - 备份与迁移策略、生产环境监控与恢复流程

- 研究与实验性功能（可选）
  - LLM/NLP 协助生成题干与解析（需人工复核）
  - 个性化学习路径建模、A/B 测试不同学习策略的效果

> 注：以上功能会根据用户需求和项目优先级逐步实现，我会把高优先级项拆成小任务并加入 TODO 与 milestone，以便逐步交付并快速获取反馈。

---

如果你希望调整或补充任何愿景条目，告诉我我会把它们合并进来并更新 `DESIGN.md`。