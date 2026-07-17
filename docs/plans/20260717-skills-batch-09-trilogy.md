# Skills 章批 09 三件套生产计划（数据库与数据工程）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 9 批）。
> 前置：批 1~8 已上线（框架与应用开发章 7 子组全收官）；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**（见 [[content-deploy-workflow]]）：产出+静态扫→提交 quiz/slide→确认生产→import 拿 ID→回填+sidebar→**build 一次**→部署。

## 本批范围（6 技术叶）

完成「数据库与数据工程」组 6 叶（该组是「框架与应用开发」之后 Skills 章的下一大区）。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                    | 官方性   | 星数 | 许可       |
| --- | ------------------------------- | --------------------------- | -------- | ---- | ---------- |
| 1   | Supabase Agent Skills           | `supabase/agent-skills`     | **官方** | 2.3k | MIT        |
| 2   | Firebase Agent Skills           | `firebase/agent-skills`     | **官方** | 379  | Apache-2.0 |
| 3   | Prisma Skills                   | `prisma/skills`             | **官方** | 44   | MIT        |
| 4   | dbt Agent Skills                | `dbt-labs/dbt-agent-skills` | **官方** | 633  | Apache-2.0 |
| 5   | ClickHouse Agent Skills         | `ClickHouse/agent-skills`   | **官方** | 492  | Apache-2.0 |
| 6   | DuckDB Skills                   | `duckdb/duckdb-skills`      | **官方** | 516  | MIT        |

> **官方状态核验**：6 叶均在官方 org 仓内。DuckDB=`duckdb/duckdb-skills`（官方 duckdb org，**非** MotherDuck 社区仓 motherduckdb/agent-skills）。ClickHouse=`ClickHouse/agent-skills`（非 vybenetwork fork）。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Supabase Agent Skills（官方，MIT）

- supabase/agent-skills，★2.3k；skills：`supabase`、`supabase-postgres-best-practices`；4 域：文档访问/安全/工具工作流/schema 管理。安装 `npx skills add supabase/agent-skills` 或 `claude plugin install supabase@claude-plugins-official`。（supabase.com/docs/guides/ai-tools/ai-skills）

### 叶 2 · Firebase Agent Skills（官方，Apache-2.0）

- firebase/agent-skills，★379；**11 skills**：firebase-basics、firebase-auth-basics、firebase-firestore、firebase-hosting-basics、firebase-app-hosting-basics、firebase-ai-logic-basics、firebase-data-connect-basics、firebase-crashlytics、firebase-remote-config-basics、firebase-security-rules-auditor、xcode-project-setup。含 Genkit（dart/go/js）。（firebase.google.com/docs/ai-assistance/agent-skills）

### 叶 3 · Prisma Skills（官方，MIT）

- prisma/skills，★44；**9 skills**：prisma-cli、prisma-client-api、prisma-compute、prisma-database-setup、prisma-driver-adapter-implementation、prisma-mongodb-upgrade、prisma-postgres-setup、prisma-postgres、prisma-upgrade-v7。（prisma.io/docs/ai/tools/skills）

### 叶 4 · dbt Agent Skills（官方，Apache-2.0）

- dbt-labs/dbt-agent-skills，★633；skills 分组：`dbt/`（adding-dbt-unit-test、answering-natural-language-questions-with-dbt、building-dbt-semantic-layer、configuring-dbt-mcp-server、fetching-dbt-docs、running-dbt-commands）、`dbt-migration/`（migrating-dbt-core-to-fusion、migrating-across-platforms）、`dbt-extras/`（creating-mermaid-dbt-dag）。覆盖分析工程/语义层 MetricFlow/dbt Mesh/平台运维。

### 叶 5 · ClickHouse Agent Skills（官方，Apache-2.0）

- ClickHouse/agent-skills，★492；「官方 Agent Skills for ClickHouse and ClickHouse Cloud」；skills：clickhouse-best-practices（28 规则）、clickhouse-architecture-advisor、chdb-datastore/chdb-sql（in-process ClickHouse for Python）、clickhouse-js-node-coding/rowbinary/troubleshooting、clickhousectl-local-dev/cloud-deploy、clickhouse-managed-postgres-rca。覆盖 schema 设计/查询优化/数据摄取。

### 叶 6 · DuckDB Skills（官方，MIT）

- duckdb/duckdb-skills，★516（官方 duckdb org）；skills：attach-db（附加 DuckDB 库交互查询+自动 schema 探索）、query（跑 SQL）、read-file（读多格式数据文件）等；数据查询/文件读取/文档搜索。

## 文件映射

| #   | slug                      | 幻灯片包                        | 题库 JSON                      | 叶名                    |
| --- | ------------------------- | ------------------------------- | ------------------------------ | ----------------------- |
| 1   | `supabase-agent-skills`   | `supabase-agent-skills-slide`   | `supabase-agent-skills.json`   | Supabase Agent Skills   |
| 2   | `firebase-agent-skills`   | `firebase-agent-skills-slide`   | `firebase-agent-skills.json`   | Firebase Agent Skills   |
| 3   | `prisma-skills`           | `prisma-skills-slide`           | `prisma-skills.json`           | Prisma Skills           |
| 4   | `dbt-agent-skills`        | `dbt-agent-skills-slide`        | `dbt-agent-skills.json`        | dbt Agent Skills        |
| 5   | `clickhouse-agent-skills` | `clickhouse-agent-skills-slide` | `clickhouse-agent-skills.json` | ClickHouse Agent Skills |
| 6   | `duckdb-skills`           | `duckdb-skills-slide`           | `duckdb-skills.json`           | DuckDB Skills           |

## sidebar 变更

- **数据库与数据工程**（新增子组）：Supabase / Firebase / Prisma / dbt / ClickHouse / DuckDB（其父在 categories.ts 为独立组，非「框架与应用开发」下）

## 逐叶状态

| 叶                        | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Supabase Agent Skills   | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 Firebase Agent Skills   | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 3 Prisma Skills           | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 21 题     | 内容完成 |
| 4 dbt Agent Skills        | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 5 ClickHouse Agent Skills | ✅ 4 页   | ✅ 7 页 / 0 溢出      | ✅ 17 题     | 内容完成 |
| 6 DuckDB Skills           | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |

> 合计 **118 题** / 24 页笔记 / 79 页幻灯片（0 溢出，Supabase two-cols slot 误用主会话已修）。产出：ClickHouse 主上下文自产，其余 5 叶子代理（flaky：Firebase×1、ClickHouse×2→自产、DuckDB slot 待修）。
> **源核验纠正**（子代理逐字读源）：dbt 实为 **12 skill/3 组**（非 6，dbt 组 9 个），装 Claude Code 用 `/plugin install dbt@dbt-agent-marketplace`；DuckDB 实为 **9 skill**（attach-db/query/read-file/s3-explore/convert-file/spatial/duckdb-docs/read-memories/install-duckdb），**是 Claude Code 插件**（`/plugin install duckdb-skills@duckdb-skills`，非 npx skills add），DuckDB Foundation 官方非 MotherDuck；ClickHouse best-practices **31 规则/4 类**（源 header 31 vs 一处注记 28，取 31）；Supabase 插件装 `supabase@supabase-agent-skills`；Firebase README 用短名 `firebase/skills`（重定向 agent-skills）。

## 全批门禁 + 生产（build 一次）

- [ ] 静态扫崩点 + 6 Slidev 0 溢出 + Quiz audit 0 errors
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
