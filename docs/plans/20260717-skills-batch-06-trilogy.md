# Skills 章批 06 三件套生产计划（移动与跨端）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-17。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 6 批）。
> 前置：批 1~5 已上线；**prod 分类树批 1 已建全 69 叶**，本批叶为既有空节点/新建即用，无需分类迁移。

## 本批范围（4 技术叶）

完成「框架与应用开发 > **移动与跨端**」组 4 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                          | 官方性   | 星数 | 许可   |
| --- | ------------------------------- | --------------------------------- | -------- | ---- | ------ |
| 1   | Expo Skills                     | `expo/skills`                     | **官方** | 2.2k | MIT    |
| 2   | Callstack React Native Skills   | `callstackincubator/agent-skills` | **官方** | 1.5k | MIT    |
| 3   | Software Mansion Skills         | `software-mansion-labs/skills`    | **官方** | 244  | (待核) |
| 4   | Flutter Agent Plugins           | `flutter/agent-plugins`           | **官方** | 2.7k | BSD-3  |

> **工程价值核验**（防"纯文档封装"）：4 叶均具工程决策/工作流——Expo「EAS Build/hosting/workflows + Expo Router + native module 全家桶」、Callstack「RN 性能优化 JS/Native/bundling 9+9+9 + 迁移/建库」、Software Mansion「Reanimated 4 动画/手势/音视频/on-device AI + Fishjam/Radon」、Flutter「分层架构 + dart-\* 12+ + widget preview + 集成测试 + MCP+rules 捆绑」。
> **官方状态核验**：Expo=expo org 官方（docs.expo.dev/skills）；Callstack=RN 核心贡献机构 callstackincubator；Software Mansion=Reanimated/Gesture Handler/Screens 作者 software-mansion-labs；Flutter=flutter org 官方（BSD-3，同 Flutter 本体）。全部为**RN/Flutter 移动跨端官方 agent 技能**。

## 证据矩阵（结论 → 一手来源 → 本地验证）

### 叶 1 · Expo Skills（官方）

| 结论                                                                                                                                                                                    | 一手来源                      | 本地验证         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------- |
| expo/skills 官方 AI agent skills 集（Expo 项目 + EAS），MIT，★2.2k                                                                                                                      | docs.expo.dev/skills + gh api | 克隆读           |
| skills 在 `plugins/expo/skills/`：eas-app-stores/hosting/observe/simulator/update-insights/workflows + expo-app-clip/brownfield/data-fetching/dev-client/dom/module/native-ui 等（11+） | gh api tree                   | 克隆 ls          |
| 覆盖：Expo Router、EAS Build/部署、native module、push、数据获取、DOM 组件、跨端                                                                                                        | 各 SKILL.md                   | 逐字读（生产时） |
| 安装：`.claude/settings.json` 启用官方插件 `expo@claude-plugins-official`                                                                                                               | docs.expo.dev/agents/claude   | 读取             |

### 叶 2 · Callstack React Native Skills（官方）

| 结论                                                                                                                                                           | 一手来源                    | 本地验证 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------- |
| callstackincubator/agent-skills 官方（Callstack = RN 核心贡献机构），MIT，★1.5k                                                                                | gh api + callstack.com/blog | 克隆读   |
| skills 在 `skills/`：react-native-best-practices、assess-react-native-migration、create-react-native-library、github-actions、github                           | gh api tree                 | 克隆 ls  |
| react-native-best-practices = RN 性能优化指南（基于 Callstack「Ultimate Guide to RN Optimization」）：JS/React 9 篇 + Native(iOS/Android) 9 篇 + bundling 9 篇 | SKILL.md + blog             | 逐字读   |
| 安装：`/plugin install react-native-best-practices@callstack-agent-skills`；raw skills/ 也可直读                                                               | README + docs               | 读取     |

### 叶 3 · Software Mansion Skills（官方）

| 结论                                                                                                                                                                                       | 一手来源        | 本地验证         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ---------------- |
| software-mansion-labs/skills 官方（Software Mansion = Reanimated/Gesture Handler/Screens/Skia 绑定作者），★244                                                                             | gh api          | 克隆读           |
| skills：react-native-best-practices（references: animations/audio/gestures/jsi/multithreading/on-device-ai/rich-text/svg）、detour、fishjam（实时音视频）、expo-horizon、radon-mcp、rnrepo | gh api tree     | 克隆 ls          |
| 支持 Reanimated 4 + 多种动画（CSS transitions/animations、shared value、Skia canvas、GPU shader、layout）+ 手势/音频/on-device AI/实时视频                                                 | SKILL.md + 官方 | 逐字读（生产时） |
| 安装：`/plugin marketplace add software-mansion-labs/skills` → `/plugin install skills@swmansion` → `/reload-plugins`                                                                      | 官方 README     | 读取             |

### 叶 4 · Flutter Agent Plugins（官方）

| 结论                                                                                                                                                                  | 一手来源                       | 本地验证 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------- |
| flutter/agent-plugins 官方（flutter org），BSD-3，★2.7k；捆绑 skills + MCP server 配置 + rules                                                                        | gh api + docs.flutter.dev/ai   | 克隆读   |
| Flutter skills：flutter-add-integration-test、flutter-add-widget-preview、修复布局错误（overflow/unbounded）、分层架构（UI/Logic/Data）等                             | gh api tree                    | 克隆 ls  |
| Dart skills：dart-add-unit-test/build-cli-app/collect-coverage/fix-runtime-errors/generate-test-mocks/use-ffigen/use-pattern-matching/use-primary-constructors 等 12+ | gh api tree                    | 克隆读   |
| Skill 与 MCP 互补：MCP 给工具访问，Skill 教「怎么用」；用 previews.dart 加交互 widget preview、Flutter Driver 转集成测试                                              | docs.flutter.dev/ai + SKILL.md | 逐字读   |

## 文件映射

| #   | 笔记 slug                       | 幻灯片包                              | 题库 JSON                            | 叶名                          |
| --- | ------------------------------- | ------------------------------------- | ------------------------------------ | ----------------------------- |
| 1   | `expo-skills`                   | `expo-skills-slide`                   | `expo-skills.json`                   | Expo Skills                   |
| 2   | `callstack-react-native-skills` | `callstack-react-native-skills-slide` | `callstack-react-native-skills.json` | Callstack React Native Skills |
| 3   | `software-mansion-skills`       | `software-mansion-skills-slide`       | `software-mansion-skills.json`       | Software Mansion Skills       |
| 4   | `flutter-agent-plugins`         | `flutter-agent-plugins-slide`         | `flutter-agent-plugins.json`         | Flutter Agent Plugins         |

## sidebar 变更（框架与应用开发 组）

- **移动与跨端**（新增子组，sort 5）：Expo Skills / Callstack React Native Skills / Software Mansion Skills / Flutter Agent Plugins

## 逐叶状态

| 叶                              | VitePress | Slidev（页/overflow） | Quiz（题数） | 状态     |
| ------------------------------- | --------- | --------------------- | ------------ | -------- |
| 1 Expo Skills                   | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 2 Callstack React Native Skills | ✅ 4 页   | ✅ 15 页 / 0 溢出     | ✅ 21 题     | 内容完成 |
| 3 Software Mansion Skills       | ✅ 4 页   | ✅ 14 页 / 0 溢出     | ✅ 20 题     | 内容完成 |
| 4 Flutter Agent Plugins         | ✅ 4 页   | ✅ 8 页 / 0 溢出      | ✅ 19 题     | 内容完成 |

> 合计 **80 题** / 16 页笔记 / 51 页幻灯片（0 溢出）。产出：Flutter 主上下文自产（Expo 曾 1 次 flaky 空跑重派成功），Expo/Callstack/Software Mansion 子代理产出。
> **许可修正**：Software Mansion 本地核查——README 底部明写 `## License MIT` + 多个 SKILL.md frontmatter 标 `license: MIT`，仅仓库根**无独立 LICENSE 文件**（比「未声明」更准）。Expo 实为 20 skills（14 开源 Framework + 6 付费 Services）非 11；SWM 实为 7 skills（含 typegpu）。

## 全批门禁 + 生产

- [x] VitePress build 0 死链（784s + 回填后 812s 真实成功）/ 4 Slidev 0 溢出 / Quiz audit 0 errors / git diff ×3
- [x] 三仓库 Conventional Commits 提交推送（quiz `fb9ee0e` / slide `5c270d6` / VitePress `352a541`）
- [x] **生产完成（无需分类迁移）**：import:content:prod 新增 80 题（20+21+20+19）→ 查真实 ID（Expo 615 / Callstack 616 / Software Mansion 617 / Flutter 618；移动与跨端 614 子组由 import 自动建）回填 → rebuild + commit `69ee7c7`/push → rsync 部署笔记（0 误删 SlideStack）+ 4 幻灯片 → **全 8 页 HTTP 200 上线**（2026-07-17）
