# Skills 章批 11 三件套生产计划（设计、Web 质量与多媒体）

> 状态：调研完成，逐叶生产进行中。开批 2026-07-18。
> 上位计划：[20260715-skills-chapter-taxonomy-and-production-plan.md](./20260715-skills-chapter-taxonomy-and-production-plan.md)（第 11 批）。
> 前置：批 1~10 已上线；prod 分类树批 1 已建全叶，本批叶新建即用，无需分类迁移。
> **用「build 一次」流程**（见 [[content-deploy-workflow]]）；**Slidev 崩点已知**（未知 Shiki 语言→```text；two-cols 用 `::right::`）。

## 本批范围（4 技术叶）

完成「设计、Web 质量与多媒体」组 4 叶。

| #   | 叶名（须与 categories.ts 一致） | 规范仓库                        | 官方性        | 星数  | 许可       |
| --- | ------------------------------- | ------------------------------- | ------------- | ----- | ---------- |
| 1   | Impeccable                      | `pbakaus/impeccable`            | **个人/产品** | 47.5k | Apache-2.0 |
| 2   | Web Quality Skills              | `addyosmani/web-quality-skills` | **个人权威**  | 2.5k  | MIT        |
| 3   | Remotion Skills                 | `remotion-dev/skills`           | **官方**      | 4.0k  | (待核)     |
| 4   | HyperFrames                     | `heygen-com/hyperframes`        | **官方**      | 35.9k | Apache-2.0 |

> **官方状态核验**：Remotion=官方 remotion-dev；HyperFrames=HeyGen 官方（heygen-com org）。Impeccable=Paul Bakaus（pbakaus）个人设计语言产品（★47.5k，业界知名）。Web Quality Skills=Addy Osmani（Google Chrome 团队，Web 性能权威）个人，**与批 1「Addy Osmani Agent Skills」(addyosmani/agent-skills 宽泛集) 不同仓、不重叠**（本叶专注 Lighthouse/CWV/a11y/perf/SEO）。

## 证据矩阵（结论 → 一手来源）

### 叶 1 · Impeccable（个人/产品，Apache-2.0）

- pbakaus/impeccable，★47.5k；Paul Bakaus「让 AI harness 更擅长设计的设计语言」；**1 skill + 23 commands + 46 确定性检测规则** + live browser 迭代；`npx impeccable install` → `/impeccable init`；跨 claude/cursor/gemini/codex/github/opencode/pi/qoder/trae/rovo-dev 多 agent（各 `.{agent}/skills/impeccable/`）。设计维度：typography/color/motion/layout/UX writing；避开 AI 生成界面的通用套路。

### 叶 2 · Web Quality Skills（个人权威，MIT）

- addyosmani/web-quality-skills，★2.5k；Addy Osmani（Google Chrome）；「基于 Lighthouse + Core Web Vitals 优化 web quality」；skills：**web-quality-audit**（编排全站审计）、performance、accessibility（WCAG 2.2）、core-web-vitals、best-practices、seo；含 Chrome DevTools 团队洞见。

### 叶 3 · Remotion Skills（官方）

- remotion-dev/skills，★4.0k；Remotion 官方（编程式 React 视频）；`npx skills add remotion-dev/skills`；skills：remotion-best-practices（+ 子：remotion-create/docs/captions/interactivity/markup/render/saas）、mediabunny；教 agent 写正确的 Remotion 代码——compositions/动画/layout/typography/media/effects/audio/fonts/timing；配 `bun create video` 脚手架。

### 叶 4 · HyperFrames（官方，Apache-2.0）

- heygen-com/hyperframes，★35.9k；HeyGen 官方「Write HTML. Render video. Built for agents.」；**20 skill**：`/hyperframes`（路由 + capability map，agent 先读）+ 域 skill（motion-doctrine/seam-craft/cut-the-curve/captions-overlay/changelog-video/oversized-cursor 等）；生产循环：plan→写合法 HTML→接 seekable 动画（GSAP/runtime-adapter）→加 media/Tailwind v4 browser-runtime→lint→preview→render；`npx skills add heygen-com/hyperframes`。

## 文件映射

| #   | slug                 | 幻灯片包                   | 题库 JSON                 | 叶名               |
| --- | -------------------- | -------------------------- | ------------------------- | ------------------ |
| 1   | `impeccable`         | `impeccable-slide`         | `impeccable.json`         | Impeccable         |
| 2   | `web-quality-skills` | `web-quality-skills-slide` | `web-quality-skills.json` | Web Quality Skills |
| 3   | `remotion-skills`    | `remotion-skills-slide`    | `remotion-skills.json`    | Remotion Skills    |
| 4   | `hyperframes`        | `hyperframes-slide`        | `hyperframes.json`        | HyperFrames        |

## sidebar 变更

- **设计、Web 质量与多媒体**（新增顶层组）：Impeccable / Web Quality Skills / Remotion Skills / HyperFrames（插在「云原生、DevOps 与可观测性」组之后）

## 逐叶状态

| 叶                   | VitePress | Slidev（页/溢出） | Quiz（题数） | 状态     |
| -------------------- | --------- | ----------------- | ------------ | -------- |
| 1 Impeccable         | ✅ 4 页   | ✅ 15 页 / 0 溢出 | ✅ 20 题     | 内容完成 |
| 2 Web Quality Skills | ✅ 4 页   | ✅ 14 页 / 0 溢出 | ✅ 20 题     | 内容完成 |
| 3 Remotion Skills    | ✅ 4 页   | ✅ 12 页 / 0 溢出 | ✅ 19 题     | 内容完成 |
| 4 HyperFrames        | ✅ 4 页   | ✅ 11 页 / 0 溢出 | ✅ 20 题     | 内容完成 |

> 合计 **79 题** / 16 页笔记 / 52 页幻灯片（0 溢出）。产出：Impeccable 子代理（核到 23 命令+46 检测=27 slop+19 quality、version 3.9.1，诚实未写死星数）、Web Quality 重派子代理（20 题，如实标 README 的 unofficial + 交叉链 addy-osmani 叶）；Remotion（重派 2 次 flaky）、HyperFrames（1 次 flaky）**主会话自产**。
> **源核验纠正**：HyperFrames 实为 **19 skill = 1 路由 `/hyperframes` + 10 创作工作流 + 8 域 skill**（非网搜的 20）；含 `/remotion-to-hyperframes`（与 Remotion 叶互迁移）。Remotion Skills 以 `remotion-best-practices` 为总入口路由，铁律=`useCurrentFrame()`+`interpolate()`、**禁 CSS transition/animation 与 Tailwind 动画类**；仓库无独立 LICENSE（内部包 `@remotion/skills`）。Web Quality Skills README 自标 unofficial（Addy Osmani 个人）。

## 全批门禁 + 生产（build 一次）

- [x] 静态扫崩点（0 mustache / 0 裸标签 / 围栏语言全 Shiki 认识）+ 4 Slidev 0 溢出 + Quiz audit **0 errors**（19742 题 / 0 重复 stem）+ JSON 全角引号（0 转义 ASCII 双引号）
- [ ] 提交推送 quiz JSON + 幻灯片
- [ ] **确认生产** → import → 查真实 ID 回填 + sidebar 新建组 → VitePress build 一次 → 提交推送 → rsync 部署 → HTTP 200
