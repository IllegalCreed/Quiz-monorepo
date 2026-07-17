# Skills 章批 10 三件套生产计划（云原生、DevOps 与可观测性）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 10 批）。
> 前置：批 1~9 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**（见 [[content-deploy-workflow]]）。

## 本批范围（5 技术叶）

完成「云原生、DevOps 与可观测性」组 5 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                    | 官方性   | 星数 | 许可       |
| --- | ------------------------------- | --------------------------- | -------- | ---- | ---------- |
| 1   | Azure Skills Plugin             | `microsoft/azure-skills`    | **官方** | 1.3k | MIT        |
| 2   | AWS Agent Toolkit               | `aws/agent-toolkit-for-aws` | **官方** | 1.9k | Apache-2.0 |
| 3   | Cloudflare Skills               | `cloudflare/skills`         | **官方** | 2.2k | Apache-2.0 |
| 4   | HashiCorp Agent Skills          | `hashicorp/agent-skills`    | **官方** | 739  | MPL-2.0    |
| 5   | 可观测性 Skills                 | `grafana/skills`            | **官方** | 194  | Apache-2.0 |

> **官方状态核验**：5 叶均官方 org。AWS=`aws/agent-toolkit-for-aws`（GA 2026-05，官方替代社区 awslabs/agent-plugins）。**可观测性 Skills** 是**泛化叶名**，以 **Grafana 官方 `grafana/skills`**（LGTM 可观测栈 + Grafana app SDK/Cloud）为代表锚定，如实标「以 Grafana 官方为代表，观测生态另有 OpenTelemetry/Sentry/Elastic 等」。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Azure Skills Plugin（官方，MIT）

- microsoft/azure-skills，★1.3k；官方 agent plugin，捆绑 curated Azure skills + Azure MCP Server + Foundry MCP Server（一装即可推理+执行 Azure 工作流）；**21 SKILL.md**，分类 Troubleshooting/Best Practices/Architecture/Security/Configuration；多 host（Copilot/Claude Code 等）；aka.ms/azure-plugin；自 microsoft/GitHub-Copilot-for-Azure 同步。

### 叶 2 · AWS Agent Toolkit（官方，Apache-2.0）

- aws/agent-toolkit-for-aws，★1.9k；GA 2026-05-06，官方 AWS-supported MCP + skills + plugins；**43 SKILL.md / 13 顶层组**；按需加载；含架构决策表/服务对比矩阵/部署工作流/排障；跨 Claude Code/Codex/Cursor/Kiro。

### 叶 3 · Cloudflare Skills（官方，Apache-2.0）

- cloudflare/skills，★2.2k；「Skills for teaching agents how to build on Cloudflare」；skills：cloudflare、workers-best-practices、agents-sdk、durable-objects、sandbox-sdk、web-perf、cloudflare-email-service、cloudflare-one(+migrations)、turnstile-spin；覆盖 Workers/Pages/KV/D1/R2/Workers AI/Vectorize/Agents SDK/WAF/Terraform/Pulumi；上下文自动加载。

### 叶 4 · HashiCorp Agent Skills（官方，MPL-2.0）

- hashicorp/agent-skills，★739；Agent Skills + Claude Code 插件 for HashiCorp 产品；**Terraform**（code-generation：terraform-style-guide/terraform-test/terraform-search-import/azure-verified-modules；module-generation：refactor-module/terraform-stacks）+ **Packer**（aws-ami/azure-image/windows builders、hcp push-to-registry）；装 `claude plugin install terraform-code-generation@hashicorp`。

### 叶 5 · 可观测性 Skills（官方，Apache-2.0 · Grafana 锚定）

- grafana/skills，★194；Grafana Labs 官方；skills：grafana-app-sdk（admission-control/app-sdk-concepts/cue-kind-definition/reconciler-logic）、grafana-cloud（adaptive-metrics/admin/app-observability/assistant-mcp/cloud-integrations/cost-management…）；Grafana LGTM 可观测栈（Loki/Grafana/Tempo/Mimir + Prometheus/Pyroscope/k6）。**观测生态**另有 OpenTelemetry（dash0hq）/Sentry/Elastic，笔记会点明。

## 文件映射

| #   | slug                     | 幻灯片包                       | 题库 JSON                     | 叶名                   |
| --- | ------------------------ | ------------------------------ | ----------------------------- | ---------------------- |
| 1   | `azure-skills-plugin`    | `azure-skills-plugin-slide`    | `azure-skills-plugin.json`    | Azure Skills Plugin    |
| 2   | `aws-agent-toolkit`      | `aws-agent-toolkit-slide`      | `aws-agent-toolkit.json`      | AWS Agent Toolkit      |
| 3   | `cloudflare-skills`      | `cloudflare-skills-slide`      | `cloudflare-skills.json`      | Cloudflare Skills      |
| 4   | `hashicorp-agent-skills` | `hashicorp-agent-skills-slide` | `hashicorp-agent-skills.json` | HashiCorp Agent Skills |
| 5   | `observability-skills`   | `observability-skills-slide`   | `observability-skills.json`   | 可观测性 Skills        |

## sidebar 变更

- **云原生、DevOps 与可观测性**（新增顶层组）：Azure / AWS / Cloudflare / HashiCorp / 可观测性（插在「数据库与数据工程」组之后）

## 逐叶状态

| 叶                       | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------ | --------- | --------------------- | ------------ | -------- |
| 1 Azure Skills Plugin    | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 AWS Agent Toolkit      | ✅ 4 页   | ✅ 13 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 3 Cloudflare Skills      | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 4 HashiCorp Agent Skills | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 5 可观测性 Skills        | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 20 题     | 内容完成 |

> 合计 **100 题** / 20 页笔记 / 73 页幻灯片（0 溢出）。产出：5 叶全子代理（flaky：Cloudflare×1、HashiCorp×1，重派补齐）。**observability 幻灯片曾因 `logql/promql/traceql 未知 Shiki 语言 build 崩，改 `text 修复**（Slidev 对未知语言硬报错，VitePress 是软回退）。
> **源核验纠正**（子代理逐字读源）：Azure 实为 **27 skill**（非 21），Claude Code 装 `azure@claude-plugins-official`；AWS 实为 **~83 canonical skill/12 组 + 4 plugin**（非 43/13），从 `aws-core@claude-plugins-official` 起；HashiCorp 实为 **17 skill**（Terraform 13+Packer 4），装需 marketplace add + 6 插件，MPL-2.0/现属 IBM；Cloudflare build-agent/build-mcp 2 命令 + 5 MCP；可观测性泛化叶以 Grafana 官方锚定（生态另有 OTel/Sentry/Elastic）。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（0）+ 5 Slidev 0 溢出（observability logql/promql/traceql→text 修 Shiki 硬崩）+ Quiz audit 0 errors（19663 题）
- [x] 提交推送 quiz JSON + 幻灯片（quiz `be5e1f3` / slide `5c552ec`）
- [x] **生产完成（build 一次流程，无需迁移）**：import 100 题 → 查真实 ID（Azure 637 / AWS 638 / Cloudflare 639 / HashiCorp 640 / 可观测性 641；云原生组 636 由 import 自动建）回填 + sidebar 新建组 → **VitePress build 唯一一次**（851s 真实成功）→ 提交推送 VitePress `8a7e57c`（单 commit）→ rsync 部署笔记（0 误删 SlideStack）+ 5 幻灯片 → **全 10 页 HTTP 200 上线**（2026-07-18）
