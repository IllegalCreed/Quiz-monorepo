# Skills 章批 15 三件套生产计划（文档、办公与业务工作流）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-18。**Skills 章最后一大区，此区完结后 13 大区收官。**
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 15 批）。
> 前置：批 1~14 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。

## 本批范围（4 技术叶）

完成「文档、办公与业务工作流」组（categories.ts sort 10）4 叶。

| #   | 叶名                             | 规范仓库 / 锚定源                       | 官方性                                    | 许可   |
| --- | -------------------------------- | --------------------------------------- | ----------------------------------------- | ------ |
| 1   | Anthropic Knowledge Work Plugins | `anthropics/knowledge-work-plugins`     | **官方**                                  | (待核) |
| 2   | Google Workspace CLI Skills      | gogcli 社区 + Google Workspace API 生态 | **方法论/社区生态叶**（无 Google 官方仓） | (各异) |
| 3   | Lark / 飞书 CLI Skills           | `larksuite/cli`                         | **官方（飞书）**                          | MIT    |
| 4   | Marketing Skills                 | `coreyhaines31/marketingskills`         | **社区事实标准**（非官方）                | MIT    |

> **定源说明**：
>
> - 叶 1（Anthropic）= 官方 `anthropics/knowledge-work-plugins`，**212 SKILL.md / 10 业务领域**（bio-research/customer-support/data/design/engineering/enterprise-search/finance/human-resources/legal/cowork-plugin-management）。
> - 叶 2（Google Workspace CLI）= **方法论/社区生态叶**——`gh search` 确认无 Google 官方 SKILL.md 仓，社区以 gogcli（tivojn/gogcli-skill）等 CLI + Google Workspace API 生态（Gmail/Calendar/Drive/Docs/Sheets/Slides/Chat/Tasks/Contacts/Classroom）为代表。处理同批 10/13/14 泛化叶。
> - 叶 3（Lark/飞书 CLI）= 飞书官方 `larksuite/cli`（npm `@larksuite/cli`），**35 SKILL.md（~33 官方 + 工具类）/ 17 业务域**，MIT；装 `npx @larksuite/cli@latest install`；OpenClaw 飞书官方插件底层基于它；支持国际版 Lark。
> - 叶 4（Marketing）= `coreyhaines31/marketingskills`，**47 SKILL.md**，MIT，社区事实标准（Corey Haines），**如实标社区非官方但最流行**。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Anthropic Knowledge Work Plugins（官方）

- anthropics/knowledge-work-plugins，**212 SKILL.md / 10 领域**：bio-research（instrument-data-to-allotrope/nextflow-development/scientific-problem-selection/scvi-tools/single-cell-rna-qc）、customer-support（customer-escalation/customer-research/draft-response/kb-article/ticket-triage）、data（analyze/build-dashboard/create-viz/data-visualization/explore-data/sql-queries）、design/engineering/enterprise-search/finance/human-resources/legal/cowork-plugin-management（cowork-plugin-customizer/create-cowork-plugin）。Anthropic 官方知识工作插件集市。

### 叶 2 · Google Workspace CLI Skills（方法论/社区生态叶）

- **无 Google 官方 SKILL.md 仓**（gh search 仅 tivojn/gogcli-skill ★1、evgyur/google-workspace-cli-skill ★0 社区）。
- 以 **gogcli 社区 CLI + Google Workspace API 生态**为代表：Gmail（搜索/读取/发送）、Calendar（日程/忙闲/约会议）、Drive（文件/权限）、Docs/Sheets/Slides（文档读写）、Chat/Tasks/Contacts/Classroom。
- **如实标**：方法论/社区生态叶，无 Google 官方仓，以 gogcli + Workspace API 生态为代表。

### 叶 3 · Lark / 飞书 CLI Skills（官方，MIT）

- `larksuite/cli`，**35 SKILL.md（~33 官方）**：lark-doc/base/sheets/calendar/im/mail/task/wiki/okr/approval/vc/vc-agent/minutes/slides/whiteboard/drive/contact/event/attendance/apps/shared/markdown/note/openapi-explorer/skill-maker/workflow-meeting-summary/workflow-standup-report。
- **17 业务域**：消息群组/云文档/云空间/电子表格/多维表格/日历/视频会议/妙记/邮箱/任务/知识库/通讯录/幻灯片/画板/OKR/审批/考勤。
- 定位「给 Agent 操作飞书的双手」；认证 `lark-cli auth login`（用户身份）/不授权用应用身份；多 Profile（`lark-cli profile`，`--profile` 并发安全）；`lark-cli config init`/`schema`；OpenClaw 飞书插件底层基于它；支持国际版 Lark。

### 叶 4 · Marketing Skills（社区事实标准，MIT）

- `coreyhaines31/marketingskills`（Corey Haines），**47 SKILL.md**：ab-testing/ad-creative/ads/ai-seo/analytics/aso/churn-prevention/co-marketing/cold-email/community-marketing 等。覆盖 CRO/copywriting/SEO/analytics/paid ads/lifecycle email/growth engineering。社区最流行，marketing-skills.com 站点。**如实标社区非官方**。

## 文件映射

| #   | slug                       | 幻灯片包                         | 题库 JSON                       | 叶名                             |
| --- | -------------------------- | -------------------------------- | ------------------------------- | -------------------------------- |
| 1   | `anthropic-knowledge-work` | `anthropic-knowledge-work-slide` | `anthropic-knowledge-work.json` | Anthropic Knowledge Work Plugins |
| 2   | `google-workspace-cli`     | `google-workspace-cli-slide`     | `google-workspace-cli.json`     | Google Workspace CLI Skills      |
| 3   | `lark-feishu-cli`          | `lark-feishu-cli-slide`          | `lark-feishu-cli.json`          | Lark / 飞书 CLI Skills           |
| 4   | `marketing-skills`         | `marketing-skills-slide`         | `marketing-skills.json`         | Marketing Skills                 |

## sidebar 变更

- **文档、办公与业务工作流**（新增顶层组）：Anthropic Knowledge Work / Google Workspace CLI / Lark·飞书 CLI / Marketing（插在「AI/ML 与科研工作流」组之后）

## 逐叶状态

| 叶                                 | VitePress | Slidev（页/溢出） | Quiz     | 状态     |
| ---------------------------------- | --------- | ----------------- | -------- | -------- |
| 1 Anthropic Knowledge Work Plugins | ✅ 4 页   | ✅ 10 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 2 Google Workspace CLI Skills      | ✅ 4 页   | ✅ 10 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 3 Lark / 飞书 CLI Skills           | ✅ 4 页   | ✅ 12 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 4 Marketing Skills                 | ✅ 4 页   | ✅ 11 页 / 0 溢出 | ✅ 20 题 | 内容完成 |

> 合计 **80 题** / 16 页笔记 / 43 页幻灯片（0 溢出）。产出：4 叶全子代理成功（0 flaky）。
> **源核验纠正**：anthropics/knowledge-work-plugins 实为 **18 顶层目录 / 212 SKILL.md / 11 主推官方插件**（非 10 领域），Apache-2.0，partner-built(71)/small-business(31) 扩展层非官方背书；larksuite/cli 实测 **27 skill**（非预估 33）+ README 自述 **18 业务域**，MIT，OpenClaw 飞书插件底层基于它；coreyhaines31/marketingskills **47 skill** MIT（Corey Haines 个人社区事实标准）；Google Workspace CLI = 方法论叶（无 Google 官方仓，gogcli 社区 + Workspace API 生态）。
> **溢出修复**：lark #5（18 业务域 grid 反复调，最终 text-xs leading-tight grid-cols-3）、marketing #4（grid text-xs leading-tight）。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（0 mustache / 0 裸标签 / 围栏语言全 Shiki 认识）+ 4 Slidev 0 溢出 + Quiz audit **0 errors**（20020 题 / 0 重复 stem）
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar 新建组 → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
