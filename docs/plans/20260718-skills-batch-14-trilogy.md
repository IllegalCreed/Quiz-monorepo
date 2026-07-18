# Skills 章批 14 三件套生产计划（AI / ML 与科研工作流）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-18。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 14 批）。
> 前置：批 1~13 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**；**Slidev 崩点已知**；**子代理 flaky 高发，重派/自产**。

## 本批范围（4 技术叶）

完成「AI / ML 与科研工作流」组（categories.ts sort 9）4 叶。

| #   | 叶名                           | 规范仓库 / 锚定源                                                     | 官方性                                        | 许可       |
| --- | ------------------------------ | --------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| 1   | Hugging Face Skills            | `huggingface/skills`                                                  | **官方**                                      | Apache-2.0 |
| 2   | Gemini Skills                  | `google-gemini/gemini-skills`                                         | **官方**                                      | Apache-2.0 |
| 3   | Google DeepMind Science Skills | `google-deepmind/science-skills`                                      | **官方**                                      | Apache-2.0 |
| 4   | AI 论文复现 Skills             | PaperBench(OpenAI)/DeepCode(港大)/AutoReproduce/paper-replicate-agent | **方法论/主题叶**（生态为代表，无单一官方仓） | (各工具异) |

> **定源说明**：叶 1~3 均官方 org（huggingface / google-gemini / google-deepmind），全 Apache-2.0。**叶 4「AI 论文复现 Skills」是方法论/主题叶**——`gh search` 确认无单一官方论文复现 SKILL.md 仓，社区实践以 PaperBench（OpenAI 复现基准，Claude 第一）/ DeepCode（港大开源，PaperBench 84.8%）/ AutoReproduce（多 agent 端到端，Paper Lineage）/ paper-replicate-agent（社区 Claude Code 方案）为代表。处理同批 10/13 泛化叶。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Hugging Face Skills（官方，Apache-2.0）

- huggingface/skills；**20+ skill**：`hf-cli`（HF CLI）、`hf-mcp`（MCP）、`hf-cloud-*`（aws-context-discovery/python-env-setup/sagemaker-deployment-planner/sagemaker-iam-preflight/sagemaker-production-defaults/serving-image-selection）、`hf-mem`、`huggingface-best`/`community-evals`/`datasets`/`gradio`/`llm-trainer`/`local-models`/`lora-space-builder`/`paper-publisher`/`papers`/`spaces`/`tool-builder`。覆盖 HF 全生态：模型/数据集/Spaces/训练/部署/论文。

### 叶 2 · Gemini Skills（官方，Apache-2.0）

- google-gemini/gemini-skills；**4 skill**：`gemini-api-dev`（Gemini API 开发）、`gemini-interactions-api`（交互）、`gemini-live-api-dev`（实时/流式）、`gemini-omni-flash-api`（Omni/Flash 多模态）。教 agent 用 Gemini 各 API。

### 叶 3 · Google DeepMind Science Skills（官方，Apache-2.0）

- google-deepmind/science-skills；**30+ skill**，科研任务：`alphafold_database_fetch_and_analyze`（蛋白质结构）、`alphagenome_single_variant_analysis`（基因组变异）、多数据库（chembl/clinical_trials/clinvar/dbsnp/embl_ebi_ols/encode_ccres/ensembl/gnomad/gtex/human_protein_atlas/interpro/jaspar/openfda/opentargets/pdb/pubchem/pubmed）、文献检索（literature_search_arxiv/biorxiv/europepmc/openalex）、序列分析（ncbi_sequence_fetch/protein_sequence_msa/protein_sequence_similarity_search）、foldseek_structural_search、pymol（分子可视化）、predictingthepast。含 SKILL_LICENSES.md（各数据库许可异）。

### 叶 4 · AI 论文复现 Skills（方法论/主题叶）

- **无单一官方 SKILL.md 仓**（gh search 确认）。以生态为代表：
  - **PaperBench**（OpenAI 复现基准）：论文理解→代码库开发→实验执行→调试完整流程，**Claude 第一**（人类专家需数天）
  - **DeepCode**（港大开源）：PaperBench **84.8%**，领先 Claude Code（58.7%），GitHub 8k+ 星
  - **AutoReproduce**：多 agent 端到端框架，**Paper Lineage**（论文谱系）追踪复现过程
  - **PaperCoder**：科学代码复现框架，~51.1%
  - **paper-replicate-agent**：社区 Claude Code 方案（读论文→用数据复现→输出可重复 R/Python 代码 + 质量报告）
- **如实标**：方法论叶，以 PaperBench 基准 + DeepCode/AutoReproduce/paper-replicate-agent 生态为代表，无单一官方仓。

## 文件映射

| #   | slug                           | 幻灯片包                             | 题库 JSON                           | 叶名                           |
| --- | ------------------------------ | ------------------------------------ | ----------------------------------- | ------------------------------ |
| 1   | `huggingface-skills`           | `huggingface-skills-slide`           | `huggingface-skills.json`           | Hugging Face Skills            |
| 2   | `gemini-skills`                | `gemini-skills-slide`                | `gemini-skills.json`                | Gemini Skills                  |
| 3   | `deepmind-science-skills`      | `deepmind-science-skills-slide`      | `deepmind-science-skills.json`      | Google DeepMind Science Skills |
| 4   | `ai-paper-reproduction-skills` | `ai-paper-reproduction-skills-slide` | `ai-paper-reproduction-skills.json` | AI 论文复现 Skills             |

## sidebar 变更

- **AI / ML 与科研工作流**（新增顶层组）：Hugging Face / Gemini / DeepMind Science / AI 论文复现（插在「安全审计与供应链治理」组之后）

## 逐叶状态

| 叶                               | VitePress | Slidev（页/溢出） | Quiz     | 状态     |
| -------------------------------- | --------- | ----------------- | -------- | -------- |
| 1 Hugging Face Skills            | ✅ 4 页   | ✅ 10 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 2 Gemini Skills                  | ✅ 4 页   | ✅ 12 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 3 Google DeepMind Science Skills | ✅ 4 页   | ✅ 14 页 / 0 溢出 | ✅ 20 题 | 内容完成 |
| 4 AI 论文复现 Skills             | ✅ 4 页   | ✅ 13 页 / 0 溢出 | ✅ 19 题 | 内容完成 |

> 合计 **79 题** / 16 页笔记 / 49 页幻灯片（0 溢出）。产出：4 叶全子代理成功（0 flaky）。
> **源核验纠正**：huggingface/skills 实为 **25 skill**（非 20+，含 trl-training/trackio/zerogpu/sentence-transformers/vision-trainer；hf-mcp 在根 `.mcp.json` 非 skills/）；google-gemini/gemini-skills **4 API skill**（gemini-api-dev/interactions/live-api-dev/omni-flash-api，模型版本逐字取自源 gemini-3.5-flash 等）；google-deepmind/science-skills 实为 **38 skill**（非 30+，补齐 quickgo/reactome/string/unibind/ucsc/uniprot/workflow_skill_creator 等）；全 Apache-2.0。AI 论文复现 = 方法论叶（无单一官方仓，PaperBench/DeepCode 84.8% vs Claude 58.7%/AutoReproduce Paper Lineage/PaperCoder 51.1%/paper-replicate-agent）。
> **修正**：DeepMind 子代理把 `predictingthepast` 误译「时序预测」→ 实为**古文本修复/断代/归属（Aeneas 拉丁 · Ithaca 古希腊）**，已改正 reference/getting-started 2 处。**溢出修复**：huggingface #2（+17px 删副标题）。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（0 mustache / 0 裸标签 / 围栏语言全 Shiki 认识）+ 4 Slidev 0 溢出 + Quiz audit **0 errors**（19940 题 / 0 重复 stem）+ predictingthepast 误译已修正
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar 新建组 → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
