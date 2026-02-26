# quiz-app

用户端答题应用。题目随机推送，用户点击选项即提交，答对自动跳转，答错高亮对错选项并展示解析。

**技术栈**：Vue 3 + Vite + Pinia + SCSS + UnoCSS
**端口**：开发 `10000`，E2E 测试 `10010`

---

## 快速开始

```bash
# 在 monorepo 根目录
pnpm dev:frontend      # 启动前端开发服务器

# 或在当前目录
pnpm dev
```

首次启动前，复制 `.env.example` 为 `.env.development.local` 并填入 API 地址：

```bash
VITE_API_BASE=http://localhost:10020
VITE_MOCK=false
```

---

## 常用命令

```bash
pnpm dev               # 开发服务器 (port 10000)
pnpm build             # 生产构建
pnpm test:unit         # 单元测试 (Vitest, ~22 tests)
pnpm test:e2e          # E2E 测试 (Cypress, 需后端运行)
pnpm type-check        # TypeScript 类型检查
pnpm lint              # oxlint + ESLint 检查
```

---

## 架构

```
src/
├── pages/quiz-page.vue   # 主答题页（唯一业务页面）
├── api/questions.ts      # API 调用（获取题目 + 提交答案）
├── composables/
│   ├── use-quiz.ts       # 答题核心逻辑（随机获取、提交、跳转）
│   └── use-theme.ts      # 主题切换（系统检测 + 手动）
└── stores/               # Pinia stores
```

答题流程：`useQuiz` → `GET /api/questions/random` → 用户选择 → `POST /api/answers` → 后端返回判定结果 + 选项解析

---

## 相关文档

- [docs/product.md](../../docs/product.md) — 产品需求
- [docs/dev.md](../../docs/dev.md) — 技术架构
