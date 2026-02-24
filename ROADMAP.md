# 项目规划

本文档记录 Quiz Monorepo 的功能规划和开发路线图。

## 当前状态

- [x] 基础问答功能（随机题目、单次作答、对错判定）
- [x] 选项解析描述（答题后展示每个选项的详细解释）
- [x] 前后端分离架构（Vue 3 + NestJS）
- [x] 共享 UI 组件库（CheckRadio/CheckRadioGroup）
- [x] 单元测试 + E2E 测试（56 个单元测试，Cypress E2E）
- [x] CI/CD 流程（lint-staged + pre-push hooks）

---

## Phase 0: 工程优化（当前优先）

新功能开发前，需要先优化现有项目基础设施。

### 脚本优化

- [x] 简化 `scripts/preview-test.sh`（已优化：220 行，添加详细中文注释）
- [x] 简化 `scripts/regenerate-test-secret.sh`（已优化：94 行）
- [x] 简化 `apps/quiz-app/scripts/run-e2e.sh`（已优化：从 102 行减少到 77 行）
- [ ] 考虑用 Node.js 脚本替代复杂的 shell 脚本（暂不优先）

### 测试优化

- [x] 完善 quiz-app 单元测试覆盖率（useQuiz composable 已补充测试）
- [x] 将 E2E 测试从 `test` 命令中分离（新增 `test:unit` 命令）
- [x] 修改 git pre-push 钩子：仅运行单元测试，E2E 在 CI 中运行（~1-2 分钟）
- [x] 加快本地开发反馈循环（后端新增 `check` 命令，~5 秒）

### 代码风格与工具链

- [x] 统一 Prettier 配置到 monorepo 根目录（2026-02-11）
- [x] 确定 Lint 策略：前端 oxlint + ESLint，后端 ESLint + Prettier（2026-02-11）
- [ ] 统一 ESLint 基础配置（可选，如果发现各包有大量重复规则）

### 前端重构 (quiz-app)

- [x] 代码结构优化（清晰的 pages/composables/api/stores 目录结构）
- [x] 组件拆分与复用（7 个 UI 库组件，composables 封装逻辑）
- [x] 状态管理优化（Pinia + useQuiz/useTheme composables）
- [ ] 性能优化（当前规模不需要，未来可考虑路由懒加载）

### UI 美化

- [x] 整体视觉风格统一（多彩渐变标题、现代化卡片设计、统一 CSS 变量）
- [x] 响应式布局优化（clamp() 响应式字体、移动端适配）
- [x] 动画与过渡效果（选项描述展开动画、按钮悬停效果）
- [x] 暗色主题完善（ThemeToggle 组件、系统主题检测、防闪烁）
- [x] QuizPage CSS 重构（@apply 风格、Grid 布局、泛光效果）
- [x] App 布局优化（全屏高度、Footer 个性化）

### 后端重构 (quiz-backend)

- [ ] API 结构优化
- [ ] 数据库 schema 优化
- [ ] 错误处理统一
- [ ] 日志系统完善

---

## Phase 1: 管理后台

新增独立的管理后台应用 (`apps/quiz-admin`)，用于内容和系统管理。

### 管理后台基础框架 ✅

- [x] 项目搭建（Vue 3 + Vite + Element Plus + UnoCSS + 紫色主题）
- [x] Mock 登录 + Token 持久化（刷新不丢失）
- [x] 权限系统（菜单权限 + API 权限 + 动态路由）
- [x] 主布局（Header + Sidebar 折叠 + Tab 历史 + keep-alive）
- [x] 深色模式（Element Plus CSS 变量覆盖 + slate 系配色）
- [x] 用户/管理员模块分离（App 用户 vs Admin 管理员）
- [x] 超级管理员保护（不可删除、不可修改权限）
- [x] 样式优化（移除 Tailwind reset，统一 hover 颜色，优化 Tab 历史）✅ 2026-02-11
- [x] 环境配置（.env.example/.env.\*.local 文件 + 单元测试覆盖）✅ 2026-02-11

### 题目管理

- [x] 题目列表（分页、按关键词/标签搜索筛选）✅ 2026-02-24
- [x] 创建/编辑/删除题目（软删除，详情页新建/编辑复用）✅ 2026-02-24
- [ ] 批量导入题目（Excel/JSON）
- [ ] 题目预览

### 分类管理

- [ ] 分类列表（树形结构）
- [ ] 创建/编辑/删除分类
- [ ] 分类排序
- [ ] 分类关联题目统计

### 系统管理

- [ ] 访问日志查看
- [ ] 访问量统计（日/周/月）
- [ ] 系统配置管理

---

## Phase 2: 用户系统

为 App 端添加用户相关功能。

### 用户认证

- [ ] 用户注册/登录
- [ ] 第三方登录（微信/Google 可选）
- [ ] 密码找回
- [ ] JWT Token 管理

### 用户偏好

- [ ] 选择喜好的题目分类
- [ ] 设置偏好难度
- [ ] 每日目标设置
- [ ] 主题/显示偏好

### 做题记录

- [ ] 做题历史列表
- [ ] 正确率统计
- [ ] 错题本
- [ ] 收藏题目

### 学习进度

- [ ] 分类掌握度
- [ ] 学习时长统计
- [ ] 连续打卡记录
- [ ] 成就系统（可选）

---

## Phase 3: 数据分析

### 用户端

- [ ] 个人学习报告
- [ ] 弱项分析
- [ ] 学习建议

### 管理端

- [ ] 用户活跃度分析
- [ ] 题目难度分析（基于答题数据）
- [ ] 热门分类/题目统计

---

## 技术规划

### 管理后台技术选型

- 框架: Vue 3 + Vite（与主 App 保持一致）
- UI: Element Plus（已集成）
- 样式: UnoCSS + SCSS（与 quiz-app 一致）
- 图表: ECharts 或 Chart.js（待选）

### 数据库扩展

新增表（预计）：

- `User` - 用户信息
- `UserPreference` - 用户偏好设置
- `AnswerRecord` - 答题记录
- `Favorite` - 收藏
- `AccessLog` - 访问日志

### API 扩展

- 用户认证相关接口
- 管理后台 CRUD 接口
- 统计分析接口

---

## 优先级说明

| 优先级 | 功能                | 原因                     |
| ------ | ------------------- | ------------------------ |
| P0     | 工程优化（Phase 0） | 提高开发效率，减少技术债 |
| P1     | 题目管理、分类管理  | 内容管理是核心需求       |
| P1     | 访问日志、统计      | 了解使用情况             |
| P2     | 用户登录            | 个性化功能的基础         |
| P2     | 做题历史、错题本    | 用户核心诉求             |
| P3     | 偏好设置            | 提升体验                 |
| P3     | 数据分析            | 增值功能                 |

---

## 里程碑

- [x] **M0**: 工程优化完成（脚本精简 ✅ + 测试优化 ✅ + 代码风格统一 ✅ + 前端重构 ✅ + UI 美化 ✅ + 后端重构 ⚠️）
  - ✅ 脚本优化（3/4 完成，Node.js 替代可暂缓）
  - ✅ 测试优化（单元测试分离 + pre-push 优化）
  - ✅ 代码风格统一（Prettier + Lint 策略确定）
  - ✅ 前端重构（100% 完成，QuizPage CSS 重构完成）
  - ✅ UI 美化（100% 完成，标题泛光效果 + Grid 布局优化）
  - ⚠️ 后端重构（0% 完成，可与新功能并行）
- [ ] **M1**: 管理后台 MVP（~~基础框架~~ ✅ + ~~题目管理~~ ✅ + 分类管理 + 基础统计）
- [ ] **M2**: 用户系统 MVP（登录 + 做题历史）
- [ ] **M3**: 完整用户功能（偏好 + 错题本 + 收藏）
- [ ] **M4**: 数据分析功能

---

## 最近完成

### 2026-02-24: 题目管理模块

完成管理后台核心功能——题目管理，前后端全栈实现：

**后端**：

- ✅ Schema 变更：`Question` 新增 `type`（题型预留）和 `deletedAt`（软删除）字段
- ✅ 迁移 SQL + `prisma:generate`，公开 API 软删除过滤修复
- ✅ `AdminQuestionsModule` 独立模块（5 个 CRUD 端点，与公开 API 严格分离）
- ✅ 创建时验证恰好 1 个正确答案；更新时 replace-all 策略（`$transaction`）
- ✅ 软删除：设置 `deletedAt` 时间戳而非真实删除

**前端**：

- ✅ `src/types/question.ts`：完整类型定义（`QuestionItem`/`QuestionDetail`/`OptionForm`/...）
- ✅ Mock API（5 条测试数据，含关键词/标签筛选）+ 真实 API
- ✅ 列表页：关键词搜索、标签筛选、分页、软删除确认弹窗
- ✅ 详情页：新建/编辑复用，选项动态增删，Radio 单选正确答案
- ✅ 超级管理员 `["*"]` 通配符：JWT 策略、菜单 Store、动态路由全链路支持

**Next**：题目管理全套测试用例（后端单元测试 + 前端 E2E）

### 2026-02-11: Quiz Admin 样式优化 + 环境配置

完成管理后台的样式修复和环境配置完善：

**样式优化**：

- ✅ **Element Plus 样式修复**：移除 Tailwind reset，使用 Wind4 内置 reset
- ✅ **CSS 导入顺序优化**：参考 beitou-survey-admin，调整为正确顺序（Element Plus → 全局样式 → UnoCSS）
- ✅ **菜单 hover 统一**：与 Header 按钮一致，使用 slate 灰色系（`bg-slate-100` / `bg-slate-700`）
- ✅ **Tab 历史优化**：关闭所有 Tab 后停留在 `/home` 空白状态，移除自动重定向到 dashboard
- ✅ **登录跳转优化**：登录成功后默认跳转 `/home/dashboard` 而不是空白的 `/home`

**环境配置**：

- ✅ **环境变量文件**：新增 `.env.example`（模板）、`.env.test.local`（测试）、`.env.production.local`（生产）
- ✅ **配置项**：`VITE_API_BASE`（API 地址）、`VITE_MOCK`（Mock 开关）、`VITE_PORT`（端口）
- ✅ **单元测试**：移除 `passWithNoTests` 配置，添加 `use-token` composable 单元测试（4 个测试用例）

**技术细节**：

- Element Plus 深色模式通过 `@use` 导入，确保 SCSS 变量正确传递
- 按需引入机制自动处理组件 SCSS，无需手动导入 base.scss
- Tab 历史关闭逻辑通过调试日志发现路由重定向问题，移除 `dynamic-routes.ts` 中的自动重定向

### 2026-02-11: QuizPage CSS 重构 + App 布局优化

完成前端页面样式的全面重构，实现统一的 @apply + SCSS 风格：

**QuizPage.vue 重构**：

- ✅ 采用 @apply + SCSS 风格（与 UI 库完全一致）
- ✅ CSS Grid 两行布局（1fr 标题居中 + 2fr 内容顶对齐）
- ✅ 增大标题字号至 `clamp(2.5rem, 6vw, 4rem)`（桌面最大 64px）
- ✅ 添加椭圆形泛光效果（radial-gradient + blur 40-50px）
- ✅ 浅色模式：柔和明亮渐变 `#a5b4fc → #d8b4fe → #f9a8d4`（Tailwind 300）
- ✅ 深色模式：深邃饱和渐变 `#6366f1 → #a855f7 → #ec4899`（Tailwind 500）
- ✅ 新增 `.quiz-content` 包裹层，精确控制内容对齐
- ✅ 完善响应式设计（移动端 clamp(2rem, 8vw, 3rem)）

**App.vue 优化**：

- ✅ 统一使用 @apply 替代传统 CSS 属性
- ✅ 修复全屏高度：`main` 使用 `flex-col` + `:deep(> *)` 让 router-view 撑满
- ✅ 个性化 Footer：添加作者信息和个人网站链接
- ✅ Footer 链接悬停效果（颜色过渡 + 下划线）

**技术亮点**：

- 泛光效果使用伪元素 + `radial-gradient` + `filter: blur()`（GPU 加速）
- 渐变文字通过 `-webkit-background-clip: text` 实现
- 浅色/深色模式使用不同色阶（300 vs 500）提供最佳对比度
- Grid 布局精确控制空间分配（1:2 比例）

### 2026-02-11: 代码风格统一

统一 Prettier 配置，规范代码格式：

- ✅ 将后端的最小化 Prettier 配置提升到 monorepo 根目录
- ✅ 删除各包的独立配置，避免冲突
- ✅ 新增 .prettierignore 文件
- ✅ 确定 Lint 策略：前端保持 oxlint + ESLint 混合方案，后端保持 ESLint + Prettier
- ✅ 讨论并决定暂不迁移到 oxfmt（还不成熟，Prettier 已是最佳选择）

**配置原则**：

- 遵循 Prettier "固执己见" 哲学，只修改 2 个必要选项（`trailingComma`, `endOfLine`）
- 其他全用默认值（分号、双引号、2 空格、80 字符）
- 减少团队争论，专注代码逻辑

### 2026-02-06: 测试优化完成

优化测试流程，加快本地开发反馈循环：

- ✅ 新增 `test:unit` 命令，分离 E2E 测试（根目录 + 各包）
- ✅ 根目录新增 `check` 和 `check:e2e` 命令，快速验证代码质量
- ✅ 优化 git pre-push 钩子，仅运行 type-check + test:unit（~1-2 分钟）
- ✅ 日常开发使用单元测试（~5 秒），E2E 测试在 CI 或手动运行

### 2026-02-06: 选项解析描述功能

实现答题后展示每个选项的解析，帮助用户理解"为什么对/为什么错"：

- ✅ 后端 Option 模型增加 `description` 字段
- ✅ Prisma 7 迁移配置（`prisma.config.ts`）
- ✅ 10 道测试题 30 个选项全部添加详细解析
- ✅ 答对 1 秒自动跳转，答错需手动点击下一题
- ✅ 完整测试覆盖（useQuiz 单元测试 + Cypress E2E）
- ✅ 整体产品需求文档（`docs/quiz-app-requirements.md`）

---

_最后更新: 2026-02-24_
