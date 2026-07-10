# AI 开发指南

本文档为 AI 助手提供项目核心开发规范。

## 项目概述

Quiz Monorepo - 开发者技术问答应用，前后端分离架构：

- **前端** (`apps/quiz-app`): Vue 3 + Vite + TypeScript
- **管理后台** (`apps/quiz-admin`): Vue 3 + Element Plus + UnoCSS
- **后端** (`apps/quiz-backend`): NestJS + Prisma 7 + MySQL
- **UI 库** (`packages/ui`): 共享组件 + Storybook

| 层级     | 技术                                        |
| -------- | ------------------------------------------- |
| 前端     | Vue 3 Composition API + Vite + Pinia        |
| 管理后台 | Vue 3 + Element Plus + UnoCSS + Pinia       |
| 后端     | NestJS + Prisma 7 + MySQL (MariaDB adapter) |
| 样式     | SCSS + UnoCSS (Tailwind 4)                  |
| 测试     | Vitest/Jest (单元) + Cypress (E2E)          |
| 包管理   | pnpm workspace + Turborepo                  |

## 核心规范

### 代码风格

- **注释**：所有代码必须添加**中文注释**（函数用 JSDoc，复杂逻辑加行内说明）
- **TypeScript**：完善类型声明，避免 `any`（必要时需注释说明）
- **Vue 组件**：使用 `<script setup lang="ts">`，Props/Emits 必须声明类型
- **命名**：组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE_CASE，CSS BEM 或 kebab-case

### 样式规范

偏好 SCSS + UnoCSS `@apply` 指令，BEM 命名：

```scss
.button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg;
  &--disabled {
    @apply cursor-not-allowed opacity-50;
  }
}
```

布局要点：全屏高度用 flex 链式传递（`min-h-screen flex flex-col` → `flex-1`）；深浅模式色阶区分（浅色 300 级，深色 500 级）。

## 常用命令

```bash
# 开发
pnpm dev              # 启动全部 (前端 10000, 后端 10020, UI 10030)
pnpm dev:frontend     # 仅前端
pnpm dev:backend      # 仅后端
pnpm -C apps/quiz-admin dev  # 管理后台 (10050)

# 代码质量检查
pnpm run check        # 快速检查：lint + type-check + test:unit (~5s)
pnpm run check:e2e    # 完整检查：包含 E2E 测试 (~5min)
pnpm lint:fix         # 自动修复代码格式问题

# 数据库管理（后端目录下）
pnpm -C apps/quiz-backend run migrate:deploy:dev   # 应用迁移到开发库
pnpm -C apps/quiz-backend run migrate:status       # 查看所有环境迁移状态
pnpm -C apps/quiz-backend run db:studio            # 数据库可视化
pnpm -C apps/quiz-backend run db:seed:dev          # 插入开发数据
pnpm -C apps/quiz-backend run db:reset:test        # 重置测试数据

# 测试
pnpm test:unit              # 单元测试 (~885 tests, ~10s)
pnpm test:unit:coverage     # 单元测试 + 覆盖率报告
pnpm test                   # 完整测试（包括 E2E，~5 分钟）
```

更多脚本说明见 [apps/quiz-backend/scripts/README.md](apps/quiz-backend/scripts/README.md)

## Prisma 7 特殊说明

- **配置文件**：`apps/quiz-backend/prisma.config.ts`（不在 schema.prisma 中配置 url）
- **Placeholder URL**：`process.env.DATABASE_URL ?? "placeholder"` 确保 generate 不依赖真实数据库
- **迁移限制**：`prisma migrate dev` 需 shadow DB 权限（RDS 无），手动写 SQL + `prisma migrate deploy`
- **环境变量**：两层策略 — `.env.{env}` 提交到仓库（端口等），`.env.{env}.local` 不提交（数据库密码等）
- **新成员上手**：clone → 复制 `.env.{env}.example` 到 `.env.{env}.local` → 填密码 → `pnpm dev`

## Git 规范

- **Commit**：Conventional Commits（feat / fix / docs / refactor / test / chore）
- **Hooks**：pre-commit lint-staged；pre-push type-check + test:unit
- **分支**：简单修改直接 main，功能/Bug 创建 feature 分支 → PR

## 测试策略

| 包           | 单元测试                         | E2E 测试                                |
| ------------ | -------------------------------- | --------------------------------------- |
| quiz-app     | Vitest (~122 tests)              | Cypress (6 spec, Mock API, ~33 tests)   |
| quiz-admin   | Vitest (~247 tests)              | Cypress (11 spec, 真实后端, ~129 tests) |
| quiz-backend | Jest (~370 tests, 86~95% 覆盖率) | -                                       |
| ui           | Vitest (~224 tests)              | Playwright (Storybook, 10 story)        |

日常：`pnpm test:unit`（~5 秒）| PR 前：`pnpm test`（~5 分钟，含 E2E）

## 常见问题

```bash
pnpm clean:ports                              # 端口占用
pnpm -C apps/quiz-backend run prisma:generate # Prisma Client 缺失
pnpm install && pnpm -C apps/quiz-backend run build  # 依赖问题
```

### UnoCSS 图标生产构建不加载

**现象**：开发环境图标正常，生产构建后所有 `i-carbon-*` 图标不显示，构建日志出现 `[unocss] failed to load icon "carbon-*"`。

**原因**：pnpm 严格依赖隔离下，UnoCSS `presetIcons` 的自动发现机制无法找到 `@iconify-json/carbon` 包（即使已安装）。这是 pnpm monorepo 的已知问题（[unocss#2905](https://github.com/unocss/unocss/issues/2905)）。

**解决方案**：在 `uno.config.ts` 中显式导入并传入图标集合，不依赖自动发现：

```ts
import { icons as carbonIcons } from "@iconify-json/carbon";

presetIcons({
  scale: 1.2,
  warn: true,
  collections: {
    carbon: () => carbonIcons,
  },
}),
```

> **注意**：`.npmrc` 中的 `public-hoist-pattern[]=@iconify-json/*` 不足以解决此问题，必须显式导入。

## 内容审查规范

本项目涉及跨仓库内容生产（VitePress 笔记、Slidev 幻灯片、Quiz 题目），审查/对比第三方库官方文档时必须遵循以下流程：

### 审查流程

1. **WebFetch 首页** → 获取官方文档的完整站点导航（所有页面链接）
2. **逐页 WebFetch** → 全部页面过一遍（通常 3-8 页），获取完整的一手信息
3. **context7 补充** → 适合快速查核心用法，但边缘页面（troubleshoot、migration）可能缺失，不能替代逐页浏览
4. **本地验证** → 在项目中实际检查（`ls`、`cat` 关键文件），确认当前版本的真实行为
5. **交叉比对后再动手** → 只有一手文档 + 本地验证都支持的情况下，才能判定现有内容有误

### 禁止事项

- **禁止把"文档摘要未提及"等同于"该特性已废弃"**
- **禁止在未经本地验证的情况下修改用户已有的正确内容**
- **禁止仅凭 context7 或 AI 总结就下"过时"结论**

### 跨仓库工作目录

统一在本仓库（quiz-monorepo）对话，跨目录操作其他项目：

| 项目           | 路径                                            |
| -------------- | ----------------------------------------------- |
| VitePress 笔记 | `/Users/zhangxu/workspace/IllegalCreedWebsite/` |
| Slidev 幻灯片  | `/Users/zhangxu/workspace/SlideStack/`          |
| Quiz 题目      | 本仓库 `apps/quiz-backend/prisma/content/`      |

### 内容生产质量门禁（三件套产出标准）

产出"三件套"（VitePress 笔记 + Slidev 幻灯片 + Quiz 题目）时，每件都有**强制门禁，未过不算完成**：

- **Quiz 题目**：**重质不限量**——题量按内容深度给足（宁多勿少，不设上限），但每题的题干、解析、选项解析都必须准确、有信息量，杜绝凑数与模板化重复。每道 `stem` 须含技术名前缀；`categories` 叶子名须与 `content/categories.ts` 完全一致。
- **Slidev 幻灯片**：**必须过每页高度校验防溢出**。`pnpm -C packages/{x}-slide run build` 后跑 `node scripts/check-slidev-overflow.mjs {x}-slide`，**0 溢出**才算完成；有溢出按报告逐页精简（代码行≈22px / 表格行≈33px / 正文行≈26px）。"build 通过 ≠ 不溢出"。
- **VitePress 笔记**：①**速查表强制**——除 `index.md` 概览页（一句话定义 + 评价 + 链接）外，**每个内容页**（`getting-started.md` 及**每个** `guide-line/*.md` 深度页）都必须在 `# 标题` + `> 基于X版本` 之后紧跟 `## 速查` 段，要点式浓缩本页核心 API/命令/配置/版本/链接（用户常只读速查表，漏掉即不算完成）。②**context7 + 网页浏览双重校验**：两路独立信源都支持才能下笔；不一致时以"官方网页 + 本地验证"为准。context7 未接入时，用等效的库文档源（如 zread 直读 GitHub 仓库的文档/源码/issue）替代。

## 题目入库规范（强制 · 不可擅自变更）

三件套中的 **Quiz 题目**写好 JSON 后，入库**只更新生产库、增量更新**：

- **目标库 = 生产库**：`pnpm -C apps/quiz-backend run import:content:prod`。**所有题目更新都直接增量更新到 prod 库**，这是唯一的题目入库目标。
- **增量更新**：`import-content.ts` 幂等设计——**只增不删、按 stem 去重、已存在则更新、已完整则跳过**，可安全重跑，不会破坏库里已有题目。
- **dev / test 库禁放正式题目**：dev 库只用测试数据（`db:seed:dev` 的用户/角色/权限），**严禁 `import:content:dev` 灌入正式题目**；dev 库需还原时用测试数据 seed 还原。
- **执行前必须经用户确认**：导入生产库前先报用户、得到明确同意才执行，**绝不擅自跑任何 `import:content:*`**。
- **分类「移动」坑**：import 按 key=`groupId:parentId:name` 只增不删——改叶子名 / 把叶子移到新父节点会留旧节点 + 建新节点 = **重复**。改结构前**先连 prod 只读核查**（复用 import 的 `PrismaMariaDb` adapter + `dotenv -e .env.production -e .env.production.local -- node -r ts-node/register`），再用一次性 ts 脚本删旧孤儿（**校验 0 题 0 子才删**）后再 import。prod 分类是「技术方向 / 难度」两大**扁平组**，章节（如「工程化与自动化」）是**技术方向组下的分类树节点**，不是独立 group。

## 内容部署规范（部署三件套到生产）

三件套内容部署到 illegalscreed.cn（ECS `47.120.26.143` + 阿里云 RDS），**三路独立、prod 推送前必经用户确认**：

- **题库 → RDS**：`import:content:prod`（见上「题目入库规范」）。跨区易掉线，给 DATABASE_URL 追加 `?connectTimeout=30000&acquireTimeout=60000&connection_limit=3`；幂等可从失败点重跑。
- **笔记 → ECS**：dist 已 build 时直接 `rsync -az --delete --exclude 'SlideStack' .vitepress/dist/ root@47.120.26.143:/var/www/illegal-site/`。**`--exclude 'SlideStack'` 必须有**（否则 `--delete` 误删线上幻灯片）；实跑前先 `rsync -azvn`（带 **-v** 才列文件）dry-run 确认「传新页 + 0 误删 SlideStack」。
- **幻灯片 → ECS**：**逐包 rsync，别用 `deploy.sh all` / 无参 `pnpm run deploy`**（会重建 + 重推全部 200+ 包，且无参 `pnpm run deploy` 被 pnpm 内置命令拦截需 `pnpm run` 显式）。dist 已 build 时：`PKGS=(a-slide b-slide …); for p in "${PKGS[@]}"; do rsync -az --delete "packages/$p/dist/" "root@47.120.26.143:/var/www/illegal-site/SlideStack/$p/"; done`。
- **别并发**：VitePress 与 SlideStack 部署顺序来；**绝不同时跑两个 `docs:build`**（抢同一 dist 互踩、OOM）。
- **认真实 exit code**：`cmd > log 2>&1; echo EXIT=$?` 的后台任务报的「exit 0」是末尾 `echo` 的码、**非 build 的**；判断成败看日志里真实 `EXIT=` + `build complete in Xs` + `ls dist/<新页>` 有产物，别只信 exit 0。
- 部署后**必 HTTP 200 抽样验证**新页（笔记 `/zh/.../`、幻灯片 `/SlideStack/{x}-slide/`）。

## 内容 build 常见崩点 + 工具坑（团队共性）

- **mustache 插值崩 build**：VitePress/Slidev 底层都是 Vue，正文 / 行内 code / bullet 里的 `{{ }}`（Faker、Ansible Jinja2、GitHub Actions `${{ }}` 等）会被当插值致 build 崩——用 `<code v-pre>{{ }}</code>` 包裹，或放进**围栏代码块**（围栏内安全）。
- **裸角括号当 HTML 标签**：正文 / 表格里的 `<dur>`、`<name>`、`Output<T>` 等被 Vue 编译器当未闭合标签 → 「Element is missing end tag」→ build 崩。用反引号包裹或写 `&lt;&gt;` 实体。
- **围栏 language 警告无害**：`The language 'xxx' is not loaded, falling back to txt` 只是 Shiki 高亮回退，不影响 build。
- **Bash 工具实为 zsh**：`for x in $VAR` **不分词**（整串当一个），批量循环必须用数组 `PKGS=(a b c)` + `"${PKGS[@]}"`。
- **`.gitignore` 的 `docker-compose*` 通配**会误伤 `content/docker-compose.json` 题库——仓库已加 negation `!apps/quiz-backend/prisma/content/docker-compose.json` 放行（新增同类被通配误伤的 content 文件时照此处理）。

## 相关文档

- [docs/product.md](./docs/product.md) - 产品需求 + 路线图
- [docs/dev.md](./docs/dev.md) - 技术架构 + 待实现功能详细计划
- [docs/plans/](./docs/plans/) - 方案设计文档（实施前先写方案，规则详见 dev.md "计划文档" 章节）；**文件名必须以 `YYYYMMDD-` 开头**（如 `20260331-xxx.md`），便于按时间排序
