# Skills 章节分类与三件套生产计划

> 状态：分类定义已落地，生产库尚未迁移或导入。最后核查：2026-07-15。

## 目标

将「大语言模型与生成式 AI > Skills」从两个直属叶子扩展为可持续生产的完整章节，并把调研结论固定在仓库中，避免后续上下文压缩造成目录、边界或迁移顺序丢失。

本计划只收录具备工程决策、反模式、迁移流程、验证脚本、评测或工具闭环的 Skill。纯 API/官方文档离线封装不单独立叶。

## 最终规模

| 层级                   | 数量 |
| ---------------------- | ---: |
| Skills 一级子类        |   10 |
| 框架与应用开发二级子类 |    7 |
| 技术叶                 |   69 |
| 已有三件套叶           |    2 |
| 待生产叶               |   67 |

## 最终目录

```text
Skills
├── 规范、发现与创作
│   ├── Agent Skills 规范与生态
│   ├── Skills CLI 与 find-skills
│   ├── Anthropic Skills
│   └── Skill Creator 与 Skill 评测
│
├── 工程方法与上下文管理
│   ├── Superpowers
│   ├── Everything Claude Code
│   ├── Grill Me
│   ├── Grill With Docs
│   ├── gstack
│   ├── Compound Engineering
│   ├── GSD Core
│   ├── Addy Osmani Agent Skills
│   ├── BMAD Method
│   └── Caveman
│
├── 框架与应用开发
│   ├── Web 框架与元框架
│   │   ├── Vercel Agent Skills
│   │   ├── Next.js Workflow Skills
│   │   ├── Vue Skills
│   │   ├── Antfu Skills
│   │   ├── Nuxt Skills
│   │   ├── Angular Developer Skill
│   │   └── Svelte AI Tools
│   ├── 路由、状态与数据流
│   │   ├── React Router Skill
│   │   ├── TanStack Router & Start Skills
│   │   └── Redux Toolkit Skills
│   ├── 组件系统
│   │   ├── shadcn Skill
│   │   └── Nuxt UI Skill
│   ├── 应用服务集成
│   │   ├── Better Auth Skills
│   │   └── Stripe Skills
│   ├── 移动与跨端
│   │   ├── Expo Skills
│   │   ├── Callstack React Native Skills
│   │   ├── Software Mansion Skills
│   │   └── Flutter Agent Plugins
│   ├── 后端框架与运行时
│   │   ├── Matteo Collina Node.js Skills
│   │   ├── NestJS Best Practices
│   │   └── Deno Skills
│   └── AI 应用开发
│       ├── Vercel AI SDK Skills
│       ├── Mastra Skills
│       ├── LangChain & LangGraph Skills
│       ├── CopilotKit Skills
│       └── assistant-ui Skills
│
├── 数据库与数据工程
│   ├── Supabase Agent Skills
│   ├── Firebase Agent Skills
│   ├── Prisma Skills
│   ├── dbt Agent Skills
│   ├── ClickHouse Agent Skills
│   └── DuckDB Skills
│
├── 云原生、DevOps 与可观测性
│   ├── Azure Skills Plugin
│   ├── AWS Agent Toolkit
│   ├── Cloudflare Skills
│   ├── HashiCorp Agent Skills
│   └── 可观测性 Skills
│
├── 设计、Web 质量与多媒体
│   ├── Impeccable
│   ├── Web Quality Skills
│   ├── Remotion Skills
│   └── HyperFrames
│
├── 浏览器、测试与检索自动化
│   ├── Agent Browser
│   ├── Playwright CLI
│   ├── Browser Use
│   └── Firecrawl CLI
│
├── 安全审计与供应链治理
│   ├── Skill 安全与供应链治理
│   └── Trail of Bits Skills
│
├── AI / ML 与科研工作流
│   ├── Hugging Face Skills
│   ├── Gemini Skills
│   ├── Google DeepMind Science Skills
│   └── AI 论文复现 Skills
│
└── 文档、办公与业务工作流
    ├── Anthropic Knowledge Work Plugins
    ├── Google Workspace CLI Skills
    ├── Lark / 飞书 CLI Skills
    └── Marketing Skills
```

## 分类边界

- Supabase、Firebase、Prisma 只归「数据库与数据工程」，不在框架类重复建叶。
- Cloudflare 只归「云原生、DevOps 与可观测性」，即使其 Workers Skills 也涉及应用运行时。
- Vercel AI SDK、Mastra、LangChain/LangGraph、CopilotKit、assistant-ui 归「AI 应用开发」；Hugging Face、Gemini、DeepMind 与论文复现归「AI / ML 与科研工作流」。
- Frontend Design、Web Design Guidelines、React 最佳实践等作为 Anthropic/Vercel 节点的深度内容，不重复立叶。
- Sentry、Datadog、Grafana、Elastic、OpenTelemetry 先合并为「可观测性 Skills」，生态稳定后再评估拆叶。
- Astro 当前官方 Skill 面向 Astro 仓库维护，不是应用开发指南；VueUse 独立 Skill 主要是 API 检索；Element Plus、Storybook、Hono、Electron、Tauri、Ionic、Capacitor 暂不立叶。
- Firebase、tRPC 等新官方候选可继续观察；新增正式叶前先更新本计划和 `categories.ts`，不得只改一处。

## 生产库只读核查

2026-07-15 已使用 `PrismaMariaDb` 对生产库「技术方向」组完成只读核查：

| 节点                   |  ID | 当前父节点                   | 题目关联 | 子节点 | 用户偏好 |
| ---------------------- | --: | ---------------------------- | -------: | -----: | -------: |
| Skills                 | 331 | 大语言模型与生成式 AI（301） |        0 |      2 |        0 |
| Superpowers            | 332 | Skills（331）                |       22 |      0 |        0 |
| Everything Claude Code | 333 | Skills（331）                |       21 |      0 |        0 |

生产库中的 `Skills.sort` 仍为 7，本地最终定义为 8。`import-content.ts` 对已存在节点不会更新 `parentId` 或 `sort`，因此不能直接依赖 import 完成这次迁移。

## 生产迁移顺序

以下步骤涉及生产写操作，执行前必须重新取得用户明确确认：

1. 再次只读核查 ID、父节点、题目数、子节点数、用户偏好数，确认仍与上表一致。
2. 在一个事务中创建或确认 `工程方法与上下文管理`，父节点必须是 Skills（331），sort=2。
3. 原地更新 Superpowers（332）和 Everything Claude Code（333）的 `parentId`；不得删除重建，以保留现有 43 条题目关联。
4. 把 Skills（331）的 sort 更新为 8，并复核新父节点下没有同名重复叶。
5. 验证 Skills 下不再直属存在 Superpowers / Everything Claude Code，且两个原 ID 的题目关联仍分别为 22 / 21。
6. 经用户再次确认后运行唯一正式导入命令：

   ```bash
   pnpm -C apps/quiz-backend run import:content:prod
   ```

7. 只读验收：Skills 下 10 个一级子类、69 个技术叶；全树无同父同名节点；已有两叶仍保留 43 道题。

严禁先运行 import 再移动旧叶，否则会在新父节点下创建空的同名节点，留下旧节点与题目关联。

## 三件套生产顺序

每批控制在 3-5 叶，完成 VitePress、Slidev、Quiz 三路门禁后再进入下一批。

1. **规范与首批工程方法**：Agent Skills 规范、Skills CLI、Grill Me、Grill With Docs、gstack。
2. **工程方法扩展**：Compound Engineering、GSD Core、Addy Osmani、BMAD、Caveman、Anthropic Skills、Skill Creator。
3. **Web 框架核心**：Vercel、Next.js Workflow、Vue、Antfu、Angular。
4. **框架扩展**：Nuxt、Svelte、React Router、TanStack、Redux、shadcn、Nuxt UI。
5. **应用与跨端**：Better Auth、Stripe、Expo、Callstack、Software Mansion、Flutter。
6. **后端与 AI 应用**：Matteo Collina、NestJS、Deno、AI SDK、Mastra、LangChain/LangGraph、CopilotKit、assistant-ui。
7. **数据与云原生**：Supabase、Firebase、Prisma、dbt、ClickHouse、DuckDB、Azure、AWS、Cloudflare、HashiCorp、可观测性。
8. **设计、浏览器与安全**：Impeccable、Web Quality、Remotion、HyperFrames、Agent Browser、Playwright、Browser Use、Firecrawl、Skill 安全、Trail of Bits。
9. **AI/科研与业务工作流**：Hugging Face、Gemini、DeepMind、论文复现、Knowledge Work、Google Workspace、Lark、Marketing。

## 三件套门禁

- VitePress：除 `index.md` 外，每个内容页必须在标题与版本说明后紧跟 `## 速查`。
- Slidev：参考 Prettier 的教学密度，避免逐页单一列表；必须包含与内容匹配的代码演进、表格、分步显示、图解或交互。build 后运行 `node scripts/check-slidev-overflow.mjs {pkg}`，结果必须为 0。
- Quiz：题干含技术名前缀，解析与选项解析有信息量，叶子分类名与本文件完全一致。
- 正式题目只导入 prod；任何 prod 导入、分类迁移、清理或部署前都必须重新获得用户明确确认。

## 当前实施状态

- [x] 完成第二轮候选调研与框架类扩展。
- [x] 在 `categories.ts` 固化 10 类、69 叶最终目录。
- [x] 只读核查生产库现有 Skills 子树。
- [ ] 执行生产分类迁移。
- [ ] 导入新增分类到生产库。
- [ ] 分批生产剩余 67 叶三件套。
