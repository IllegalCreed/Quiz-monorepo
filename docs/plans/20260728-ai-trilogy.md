# 20260728 AI 章节扩容三件套方案

> 本对话产物：调研定稿 + categories.ts 题库目录 + VitePress sidebar 笔记目录 + 本方案（含下个对话提示词）。
> **本对话不产实际三件套内容**（笔记正文/幻灯片/题库 JSON 留到下个对话）。

## 一、背景与决策

- VitePress sidebar「人工智能」顶级下 5 大块，quiz categories 只覆盖了「大语言模型与生成式 AI」一块；AI 基础 / AI 框架与库 / AI 开发工具与平台 / AI 在全栈中的应用 4 块 quiz 侧全缺。
- 用户决策：① 全三件套一口气做完；② 体量过大，**去掉「人工智能」伞级，5 大块各自顶级**（对齐前端多顶级结构）；③ 三件套产出顺序 = **笔记 → 幻灯片 → 题库**（纠正早期批次的题库先行）。
- 本对话先把目录骨架补全（categories + sidebar），写好下个对话提示词后停手。

## 二、调研结论：6 大块叶子定稿（约 60 叶）

### 17. AI 基础（12 叶）

- **机器学习基础**：监督学习 / 无监督学习 / 强化学习 / AutoML / **集成学习与树模型**（新）/ **特征工程**（新）
- **深度学习基础**：神经网络 / CNN / RNN / Transformer / **GAN**（新）/ **扩散模型**（新）
- 处理原则：概念型叶子讲"范式核心思想 + 共性考点 + 算法族选讲"，不为单一算法（SVM/KNN）立叶；RLHF 归强化学习叶、Transformer 架构归基础叶（vs 各 LLM 实例归第19章）。

### 18. AI 框架与库（21 叶）

- **通用机器学习框架（9）**：PyTorch 基础 / PyTorch 分布式训练 / TensorFlow / Keras / scikit-learn / JAX / PaddlePaddle / MindSpore / ONNX
- **计算机视觉（6）**：OpenCV / Ultralytics YOLO / MediaPipe / OpenMMLab / timm / Albumentations
- **自然语言处理（6）**：Hugging Face Transformers / HF PEFT 与 TRL / HF Datasets 与 Tokenizers / spaCy / NLTK / Gensim
- 子代理曾建议 PyTorch 拆 4 / HF 拆 6，已适度合并（控总量）；MediaPipe 归此块（端侧视觉全平台），不归前端智能。

### 19. 大语言模型与生成式 AI（第3块，扩容）

- **补缺（修正笔记/题库错位）**：GPT/Gemini/Claude（笔记已有补题库）、Agent 5（Pi/Claude Code/Codex/Gemini CLI/OpenCode）、AI 应用生成器 4（bolt.new/v0/Lovable/Replit Agent）、NotebookLM
- **其他工具（+7 新叶）**：向量数据库 / 嵌入模型 / AI 网关 / Vercel AI SDK（从⑤移入，与 LangChain 对照）/ AI 内容审核 / AI 搜索 API / Perplexity API
- **提示词工程（+2 新叶）**：LLM 可观测与评测 / LLM 测试与红队
- 已有结构不动：模型组（+Kimi/Llama）、编排工具（+n8n/ComfyUI）、MCP（已改 2 叶）、Skills（已完结）、AI 辅助开发工具、AI 设计

### 20. AI 开发工具与平台（14 叶）

- **开发环境与社区平台**：Jupyter Notebook / Google Colab / Hugging Face 平台
- **训练平台与实验追踪**：AWS SageMaker / MLflow / Weights & Biases / DVC
- **LLM 推理引擎**：vLLM / Ollama
- **模型服务化与托管**：FastAPI 模型服务化 / Gradio / NVIDIA Triton / BentoML / Serverless GPU 平台（Modal+Replicate 合并）
- Kubeflow 缓做；FastAPI 聚焦 AI 服务化（通用 FastAPI 归后端章）；Ollama/vLLM 是平台层（Dify/n8n 是应用编排层，不重叠）。

### 21. AI 在全栈中的应用（4 叶）

- **前端智能**：Web Speech API
- **后端智能**：推荐系统
- **自动化与优化**：代码生成（Copilot-like）/ AI 测试用例生成
- 删除：智能表单验证（已被 HTML 表单与约束校验叶覆盖）、日志异常检测（已被 ELK/Datadog 覆盖）、性能预测（Pythia/SCARIF 名称错误，学术无产品）；聊天机器人→Vercel AI SDK 移第19章。

## 三、categories.ts 改造记录（已完成 ✅）

文件：`apps/quiz-backend/prisma/content/categories.ts`

- 新建 4 个顶级分类，按认知递进编号：
  - `17. AI 基础`（机器学习基础 + 深度学习基础）
  - `18. AI 框架与库`（通用ML + CV + NLP）
  - `20. AI 开发工具与平台`（开发环境 + 训练平台 + LLM推理引擎 + 服务化托管）
  - `21. AI 在全栈中的应用`（前端智能 + 后端智能 + 自动化与优化）
- 调整 2 个已有 sort：`大语言模型与生成式 AI` 17→**19**，`软技能` 18→**22**（让 AI 五大块连续：17→18→19→20→21）。
- 第 19 章扩容：「其他工具」子组 +7 叶（sort 5-11）、「提示词工程」子组 +2 叶（sort 3-4）。
- 验证：22 章顺序正确，`ts-node` 加载通过，子组数全对。

## 四、VitePress sidebar 改造记录（已完成 ✅）

文件：`IllegalCreedWebsite/.vitepress/config.mts`

- **去掉「人工智能」伞级**：5 大块（AI基础/AI框架/大语言模型/AI开发工具/AI全栈）各自提升为顶级章节。
- 4 大块（17/18/20/21）全部按定稿挂叶子占位（`{ text: "X" }`，因笔记尚未产出，遵守"未产出叶用 text 标签"规范）。
- 第 19 章修正：模型组 +Kimi/Llama、编排工具 +n8n/ComfyUI、「其他」改名「其他工具」+7 新叶、提示词工程 +2 叶、MCP 从 10 个具体 server 占位改成 2 叶（对齐 categories）。
- 缩进说明：去伞级后 5 大块代码缩进暂保留原层级（不影响渲染），下个对话如需可统一美化。
- 验证：5 大块顺序 grep 正确、人工智能伞级 grep 0 命中。**config.mts 完整语法留待下个对话 `pnpm build` 时首次验证**（本机 esbuild/timeout 不可用，未跑成）。

## 五、import 生产库注意事项（下个对话产完题库后）

⚠️ 题目入库前必读（CLAUDE.md「题目入库规范」「分类移动坑」）：

1. **MCP 重组移动坑**：categories 里 MCP 已从旧 10 个具体 server（Brave Search/GitHub MCP/…）改成 2 叶（协议基础/Server 集成）。**import 前先连 prod 只读核查**——若 prod 仍有旧 10 server 节点，确认 **0 题 0 子** 后用一次性 ts 脚本删孤儿，再 import。复用 import 的 PrismaMariaDb adapter。
2. **sort 字段更新**：大语言模型 17→19、软技能 18→22 是改 sort 值（非改名/移动，父子关系不变）。import 前核 `import-content.ts` 是否同步更新 sort 字段；若只建不更，需额外脚本刷 sort。
3. **全新 4 大块（17/18/20/21）无移动坑**：0 题基线，import 时直接建树。
4. **命令**：`pnpm -C apps/quiz-backend run import:content:prod`（**执行前必须经用户确认**）。跨区易掉线，给 DATABASE_URL 追加 `?connectTimeout=30000&acquireTimeout=60000&connection_limit=3`；幂等可从失败点重跑。
5. **叶子名一致性**：题库 JSON 的 `categories:[["技术方向","叶子名"],["难度",X]]` 叶子名必须与 categories.ts **完全一致**（含全角括号、空格），否则建出重复节点。

## 六、下个对话提示词（复制以下内容到新对话）

```
继续 AI 章节扩容三件套的实际制作。方案文档：docs/plans/20260728-ai-trilogy.md（含完整叶子定稿+考点+信源+边界，务必先读）。

【任务】按"笔记 → 幻灯片 → 题库"顺序，产出 AI 章节扩容的三件套。本批共 5 大块约 60 叶（含第19章补缺+扩容）。

【已完成（本对话）】
- categories.ts：4 大块新顶级（17 AI基础 / 18 AI框架 / 20 AI开发工具 / 21 AI全栈）+ 第19章扩容（其他工具+7 / 提示词+2）+ sort 重编号（大语言模型17→19、软技能18→22）。已验证。
- VitePress sidebar：去「人工智能」伞级，5 大块各自顶级 + 叶子占位挂好。
- 题库目录、笔记目录骨架已补全，下个对话只产内容。

【产出顺序（强制）】
1. 笔记（VitePress）：每叶 index.md（概览）+ getting-started.md + guide-line/*.md + reference.md；除 index 外每页 # 标题 + > 基于X版本 后紧跟 ## 速查。逐页 WebFetch 官方文档 + context7 交叉比对，禁止凭常识下结论。
2. 幻灯片（Slidev）：cp -r 现有包脚手架，改 package.json name + build --base，每页密度参照 prettier-slide 防溢出。pnpm build 后跑 check-slidev-overflow.mjs，0 溢出才算完成。
3. 题库（quiz JSON）：每叶 20+ 题，stem 含技术名前缀、4 选项 1 正确且每项含 description、categories 叶子名与 categories.ts 完全一致（含全角括号）、中文内引号必须全角。

【分批策略（节流）】
- 按子组分批，每批 ≤3 路并行产内容（>3 路从零并行会烧穿会话额度）。
- 建议批次：① AI 基础 12 叶 → ② AI 框架·通用ML 9 叶 → ③ AI 框架·CV 6 叶 → ④ AI 框架·NLP 6 叶 → ⑤ 第19章补缺（模型3+Agent5+应用生成器4+NotebookLM）→ ⑥ 第19章扩容（其他工具7+提示词2）→ ⑦ AI 开发工具 14 叶 → ⑧ AI 全栈 4 叶。
- 每批：先精做 1 叶标杆（主 agent 亲做）→ 其余并行 → 批量验门禁。

【关键边界（勿重复造叶）】
- 概念（AI基础）vs 工具（AI框架）vs 应用（第19章）三层互斥。
- HF Transformers（本章训练侧）vs LangChain（第19章应用侧）。
- MediaPipe 归 AI框架·CV（不归前端智能）；Vercel AI SDK 归第19章·其他工具（不归后端智能）。
- 推荐系统 vs RAG（<10% 重叠）；向量库/嵌入是 RAG 的存储/编码组件（同级兄弟叶）。

【deprecation 坑（产题时标注）】
- Sourcegraph Cody 已 sunset（2025-07）：代码生成叶砍 Cody，只留 Copilot+Continue+Tabby。
- Qodo Cover 2025-06 起停维护：测试生成叶保留但每题标注"停维护，仅作学习样本"。
- Sonar Chat→Agent API 未正式 deprecated（并行可用）：Perplexity 叶考迁移路径非"已下线"。
- Azure Content Safety：每个新 GA 后 90 天旧 GA deprecated。

【每批只 build 一次 VitePress】2300 页无增量构建，每批：产出+静态扫崩点→提交 quiz/slide→确认生产→import 拿 ID→回填源 md→build 一次→提交部署。省冗余全量 build（~15-20min/批）。

【import 生产库】见方案文档第五节（MCP 移动坑、sort 更新、命令）。执行前必须经用户确认。
```

## 七、各叶核心考点 + 信源索引（供产内容参考，详见各调研报告）

> 以下为调研要点速查，完整考点/信源见本对话调研子代理报告（已归档）。产内容时务必逐叶重新 WebFetch 最新官方文档复核。

### AI 基础

- 监督/无监督/强化学习：scikit-learn 文档、OpenAI Spinning Up（RL）；RLHF 三阶段归强化学习叶。
- 神经网络/CNN/RNN/Transformer：cs231n；Transformer 讲 self-attention 公式 + 多头 + PE（sinusoidal/RoPE/ALiBi）。
- GAN/扩散模型：Wikipedia + DDPM 论文；扩散原理归基础，ComfyUI 使用归第19章。

### AI 框架与库

- PyTorch：docs.pytorch.org（v2.13）；基础叶 autograd/nn.Module/DataLoader，分布式叶 DDP/FSDP/torch.compile。
- HF 生态：Transformers v5.14（model-definition 枢纽）、PEFT/TRL v1（LoRA/DPO/GRPO）、Datasets（Arrow）、Tokenizers（Rust，BPE/WordPiece/Unigram）。
- CV：OpenCV 5.0、Ultralytics YOLO（v8/v11/v26）、MediaPipe（Tasks API）、OpenMMLab（registry/config）、timm（Wightman 已独立维护）、AlbumentationsX。
- 国产：PaddlePaddle 3.x（PaddleOCR）、MindSpore 2.x（昇腾 NPU）。

### AI 开发工具与平台

- vLLM（PagedAttention/Continuous Batching）、Ollama（Modelfile/GGUF/llama.cpp）。
- MLflow 8 组件 + LLM Eval、W&B（Weave）、DVC（dvc.yaml/repro）。
- FastAPI 模型服务化（lifespan 加载/async 陷阱/SSE 流）、Triton（Dynamic Batching）、BentoML（Bento 打包）、Modal/Replicate（Serverless GPU）。

### 第19章扩容

- 向量数据库：Pinecone/Milvus（索引矩阵）/Weaviate/Qdrant/pgvector（运算符）。
- 嵌入模型：OpenAI 3 / BGE-M3 / Nomic / Cohere / Voyage / Jina。
- AI 网关：LiteLLM（router 6 策略）/ Portkey / Helicone（vs OpenRouter：self-host vs SaaS）。
- LLMOps：Langfuse（MIT/OTel）/ LangSmith（Engine）/ Promptfoo（23+ assertion + redteam）。
- AI 内容审核：OpenAI Moderation（13 category）/ Perspective / Azure Content Safety / AWS Comprehend。
- AI 搜索：Tavily/Exa/SearXNG；Perplexity（sonar answer engine + Agent API）。

### AI 全栈应用

- Web Speech API：SpeechRecognition/SpeechSynthesis + 已废弃 SpeechGrammar 陷阱。
- 推荐系统：CF/MF/Two-Tower/向量检索/RL/生成式 + 评估指标。
- 代码生成：Copilot（CLI/SDK Hooks/订阅）+ Continue（config.yaml）+ Tabby（自托管）。
- 测试生成：Diffblue Cover（强化学习）+ Qodo Cover（停维护标注）。
