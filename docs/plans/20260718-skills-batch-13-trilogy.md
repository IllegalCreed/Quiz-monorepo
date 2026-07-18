# Skills 章批 13 三件套生产计划（安全审计与供应链治理）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-18。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 13 批）。
> 前置：批 1~12 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**；**Slidev 崩点已知**；**子代理 flaky 高发，重派/自产**。

## 本批范围（2 技术叶）

完成「安全审计与供应链治理」组（categories.ts sort 8）2 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库 / 锚定源                                                                                                                   | 官方性                                        | 许可          |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------- |
| 1   | Skill 安全与供应链治理          | Trail of Bits 研究 + `trailofbits/skills`（agentic-actions-auditor/supply-chain-risk-auditor/seatbelt-sandboxer）+ agent-skillguard | 方法论/主题叶（Trail of Bits 安全研究为代表） | (各 skill 异) |
| 2   | Trail of Bits Skills            | `trailofbits/skills`                                                                                                                | **官方**                                      | CC-BY-SA-4.0  |

> **定源说明**：
>
> - **Trail of Bits Skills**（叶 2）= 官方 `trailofbits/skills` marketplace，实有 **75 skill**（网搜低估 35+），**CC-BY-SA-4.0**（Attribution-ShareAlike 4.0 International，copyleft，非 MIT/Apache），`/plugin marketplace add trailofbits/skills`，Codex 兼容。
> - **Skill 安全与供应链治理**（叶 1）= **方法论/主题叶**，SKILL.md/agent skill 作为攻击面的安全治理。以 **Trail of Bits「The Sorry State of Skill Distribution」(2026-06-03) 研究**为核心一手（造 4 个明恶意 skill 绕过所有扫描器 ClawHub/Cisco 等，结论：自动化扫描不足、需沙箱+行为监控+人工审查），锚定 trailofbits/skills 内相关 skill（agentic-actions-auditor 审 CI/CD agent prompt injection、supply-chain-risk-auditor 依赖风险准则、seatbelt-sandboxer macOS 沙箱），生态另有 agent-skillguard（npm，对比 SKILL.md 声明 vs 行为漂移）。处理方式同批 10「可观测性 Skills」泛化叶。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Skill 安全与供应链治理（方法论/主题叶）

- **核心研究**：Trail of Bits「The Sorry State of Skill Distribution」(2026-06-03)——研究者造 **4 个明恶意 agent skill**，**绕过所有测试的 skill 扫描器**（ClawHub 恶意 skill 检测器、Cisco agent skill 扫描器等）；结论：公共 skill marketplace 是重大攻击面，现有自动化扫描器**不足以**把关，需 sandboxing + 运行时行为监控 + 人工审查。
- **攻击面**：SKILL.md 作为攻击面——prompt injection（skill 内嵌指令劫持 agent）、声明 vs 行为漂移（SKILL.md 声明一套、代码做另一套）。
- **官方相关 skill**（trailofbits/skills）：`agentic-actions-auditor`（审计 GitHub Actions 里 AI agent 的 CI/CD prompt injection，检测 pull_request_target 等外部输入到达 agent）、`supply-chain-risk-auditor`（依赖风险准则：single maintainer/unmaintained/low popularity/high-risk features FFI·反序列化/past CVEs/no security contact）、`seatbelt-sandboxer`（macOS seatbelt 沙箱限权）、`insecure-defaults`/`sharp-edges`。
- **生态工具**：agent-skillguard（npm，对比 SKILL.md 声明 vs 观测行为检测漂移）；Repello 方法论（安装前读每行 SKILL.md、列 zip 全文件、查恶意行为）。

### 叶 2 · Trail of Bits Skills（官方，CC-BY-SA-4.0）

- trailofbits/skills，**75 skill**，CC-BY-SA-4.0；`/plugin marketplace add trailofbits/skills` + Codex 兼容。AI 辅助安全分析/测试/开发工作流，业界称"gold standard"。
- **分类**：building-secure-contracts（智能合约多链漏洞扫描 algorand/cairo/cosmos/solana/substrate/ton + audit-prep-assistant/code-maturity-assessor/guidelines-advisor/secure-workflow-guide/token-integration-analyzer）、testing-handbook-skills（libafl/libfuzzer/ossfuzz/ruzzy/wycheproof 模糊测试 + testing-handbook-generator）、trailmark（密码学审计 audit-augmentation/crypto-protocol-diagram/mermaid-to-proverif/genotoxic/vector-forge）、c-review/rust-review/constant-time-analysis/zeroize-audit、semgrep-rule-creator/semgrep-rule-variant-creator/variant-analysis/yara-rule-authoring、burpsuite-project-parser/firebase-apk-scanner/entry-point-analyzer、agentic-actions-auditor/supply-chain-risk-auditor/seatbelt-sandboxer/insecure-defaults/sharp-edges、gh-cli/git-cleanup/modern-python/mutation-testing/property-based-testing/differential-review/dimensional-analysis/fp-check/second-opinion 等。

## 文件映射

| #   | slug                          | 幻灯片包                            | 题库 JSON                          | 叶名                   |
| --- | ----------------------------- | ----------------------------------- | ---------------------------------- | ---------------------- |
| 1   | `skill-security-supply-chain` | `skill-security-supply-chain-slide` | `skill-security-supply-chain.json` | Skill 安全与供应链治理 |
| 2   | `trail-of-bits-skills`        | `trail-of-bits-skills-slide`        | `trail-of-bits-skills.json`        | Trail of Bits Skills   |

## sidebar 变更

- **安全审计与供应链治理**（新增顶层组）：Skill 安全与供应链治理 / Trail of Bits Skills（插在「浏览器、测试与检索自动化」组之后）

## 逐叶状态

| 叶                       | VitePress | Slidev（页/溢出） | Quiz（题数） | 状态     |
| ------------------------ | --------- | ----------------- | ------------ | -------- |
| 1 Skill 安全与供应链治理 | ✅ 4 页   | ✅ 11 页 / 0 溢出 | ✅ 20 题     | 内容完成 |
| 2 Trail of Bits Skills   | ✅ 4 页   | ✅ 11 页 / 0 溢出 | ✅ 20 题     | 内容完成 |

> 合计 **40 题** / 8 页笔记 / 22 页幻灯片（0 溢出）。产出：2 叶全子代理成功（0 flaky）。
> **源核验纠正**：trailofbits/skills 实为 **40 plugin / 75 SKILL.md**（双重确认，最大三 plugin：testing-handbook-skills 15/building-secure-contracts 11/trailmark 10），**CC-BY-SA-4.0** copyleft（非 MIT/Apache），Codex 原生兼容；网搜常低估 35+。Skill 安全叶方法论锚定 Trail of Bits「Sorry State of Skill Distribution」+ 仓内 agentic-actions-auditor/supply-chain-risk-auditor/seatbelt-sandboxer。
> **崩点修复**：skill-security 笔记 9 处 GitHub Actions `${{ }}`（行内反引号内联 code，VitePress 当 Vue 插值）→ `<code v-pre>` 包裹；幻灯片 `scheme` 围栏（Slidev Shiki 不识 Lisp 方言硬崩）→ `text`。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（mustache 9 处 v-pre 包裹 + scheme→text）+ 2 Slidev 0 溢出 + Quiz audit **0 errors**（19861 题 / 0 重复 stem）
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar 新建组 → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
