# 内容生产流程方案

## Context

以"学习一门技术"为单位，批量生产三类内容：

1. **VitePress 学习速查笔记** → `/Users/zhangxu/workspace/IllegalCreedWebsite`
2. **Slidev 入门幻灯片** → `/Users/zhangxu/workspace/SlideStack`
3. **Quiz 题目 JSON** → `/Users/zhangxu/illegal/quiz-monorepo` 数据库

---

## 前置工作（一次性，第一个技术之前完成）

### 1. 重建 Quiz 分类体系（严格对齐个人学习网站）

现有 Quiz 分类是测试数据（2 个维度、少量叶子节点），生产数据需**完整映射**网站 sidebar 的技术体系。

**维度设计**：保留"难度"维度，将"技术方向"替换为与网站 sidebar 完全对应的多级分类树。

#### CategoryGroup 1: 技术方向

```
技术方向
├── Web基础知识
│   ├── 三大语言
│   │   ├── HTML
│   │   ├── JavaScript
│   │   └── CSS
│   ├── 计算机网络基础
│   │   ├── 网络模型
│   │   │   ├── OSI 模型
│   │   │   └── TCP/IP 模型
│   │   ├── 网络协议
│   │   │   ├── 网络层及以下（ICMP / ARP / DNS）
│   │   │   └── 应用层（HTTP/HTTPS / WebSocket / SSL/TLS）
│   │   └── 网络设备（路由器 / 交换机 / 网关 / 移动网络）
│   └── 浏览器基础
│       ├── 浏览器渲染原理
│       ├── 浏览器缓存机制
│       └── 浏览器安全
│
├── Web进阶知识
│   ├── 语言
│   │   ├── Markdown
│   │   ├── TypeScript
│   │   ├── CSS预处理（Sass / Less / PostCSS / Tailwind CSS / UnoCSS）
│   │   ├── JSON
│   │   └── YAML
│   ├── Web API
│   │   ├── Web Components
│   │   ├── Web Assembly
│   │   ├── WebRTC API
│   │   ├── Server-Sent Events
│   │   ├── Fetch API
│   │   ├── WebSocket
│   │   ├── Web Storage API
│   │   ├── IndexedDB
│   │   └── Web Workers API
│   ├── 模块管理（CommonJS / ES Module）
│   ├── 包管理器
│   │   ├── 系统级（Homebrew / apt-get / yum / Chocolatey）
│   │   └── 框架级（pnpm / NPM / pip3 / Cargo）
│   └── JS扩展库（Lodash-es / Day.js / uuid / axios / i18next / crypto.js）
│
├── 前端框架
│   ├── UI框架（React / Vue / Angular / Solid / Svelte / Preact）
│   ├── 元框架（Next.js / Nuxt.js / Astro / Qwik / Remix / SolidStart / SvelteKit）
│   ├── 静态网站框架（Docusaurus / VitePress / Slidev）
│   ├── 组件库（Element Plus / Vuetify / Vant UI / Ant Design / Nuxt UI / shadcn）
│   ├── 状态库（Pinia / Zustand / Redux）
│   ├── 路由库（Vue Router / React Router / React Navigation）
│   ├── 复用库（VueUse / VueHooks Plus / Ahooks / React Use）
│   └── 其他（Iconify / Shiki / Markdown-it / TanStack Query / Vee-validate / Vue-i18n）
│
├── 前端基础工具链
│   ├── 构建工具（Vite / Webpack / Turbopack）
│   ├── 编译器（Babel / SWC / tsc）
│   ├── 打包工具（esBuild / rollup / rolldown / rspack）
│   └── 开发服务器（Live Server / BrowserSync）
│
├── 前端开发工具
│   ├── IDE（VScode / WebStorm）
│   ├── 版本控制（Git）
│   ├── 静态分析工具（ESLint / Prettier / Biome / StyleLint / EditorConfig）
│   ├── 在线编辑器（StackBlitz / CodeSandbox / Expo）
│   └── 文档生成器（JSdoc / TypeDoc / TSDoc / SassDoc）
│
├── 前端测试
│   ├── 单元测试（Jest / Vitest / VueTestUtils / Axios Mock Adapter / MSW / Testing Library / Vue Router Mock）
│   ├── 端到端测试（Cypress / Playwright）
│   └── 其他工具（Mailtrap）
│
├── 前端优化
│   ├── 浏览器工具（Chrome DevTools / Firefox Developer Tools / React DevTools / Vue DevTools）
│   ├── 性能优化（异步组件 / 按需引入 / 虚拟化 / 事件及属性优化 / 性能评估）
│   ├── 代码优化（代码分割 / Tree Shaking）
│   ├── 网络优化（CDN / 缓存 / 压缩）
│   ├── 用户体验优化（懒加载和预加载 / 交互优化 / 可访问性）
│   └── 搜索引擎优化
│
├── 前端架构设计
│   ├── 设计模式
│   │   ├── 架构模式（MVC / MVVM）
│   │   ├── 创建型（工厂方法 / 抽象工厂 / 单例 / 建造者 / 原型）
│   │   ├── 结构型（适配器 / 桥接 / 组合 / 装饰 / 外观 / 享元 / 代理）
│   │   └── 行为型（责任链 / 命令 / 迭代器 / 中介者 / 备忘录 / 观察者 / 状态 / 策略 / 模板方法 / 访问者）
│   ├── 组件设计（组件分类 / 设计原则 / Storybook / Styleguidist）
│   └── 微前端框架（qiankun / single spa）
│
├── 移动/桌面开发
│   ├── 移动端框架（React Native / Flutter / 微信小程序 / Uniapp / Ionic）
│   └── 桌面端框架（Electron / Tauri）
│
├── 前端可视化
│   ├── 图表（ECharts / D3.js / Chart.js / Recharts / leaflet / Mermaid / KaTeX）
│   ├── 三维（WebGL / Three.js / Babylon / CesiumJS / ArcGIS API for JavaScript）
│   ├── 动画（Lottie / Popmotion / Framer Motion / GSAP / Anime.js / Animate.css）
│   └── 拖拽（Grid Layout Plus / Vue Draggable Plus / React DnD / Interact.js / Sortable.js / Draggable.js / Hammer.js / @use-gesture）
│
├── 工程化与自动化
│   ├── DevOps（GitHub Actions / GitLab CI/CD / Jenkins / Husky / lint-staged）
│   ├── 依赖管理器（Pnpm / Yarn / Bit）
│   ├── 容器（Docker）
│   └── Monorepo（Lerna / Turborepo）
│
├── 安全
│   ├── 攻击方式（XSS / CSRF / SQL 注入 / SSRF / DDoS / MITM）
│   ├── 加密（对称加密和非对称加密 / 公钥基础设施 / Crypto.js / Web Crypto API）
│   ├── 认证与授权（OAuth 2.0 / JWT / SAML / 哈希算法）
│   ├── 安全框架（OWASP / Helmet.js / CORS / HTTP安全头）
│   └── 漏洞扫描（ZAP / Burp Suite / Nessus / Nmap）
│
├── 云服务
│   ├── 静态网站托管（Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render）
│   └── 通用云服务（阿里云 / Firebase / Azure / Netlify / Vercel / Cloudflare / AWS）
│
├── 后端框架
│   ├── 基础框架（Node.js / Deno / Bun）
│   ├── 应用框架（Express / Fastify / Hono）
│   └── ORM框架（TypeORM / Prisma）
│
├── 服务器基础知识
│   ├── 基础工具
│   │   ├── Shells（Bash / Zsh / powerShell）
│   │   ├── 基础命令（文件系统 / 进程管理 / 文本编辑器 / 网络工具 / 系统管理工具）
│   │   └── SSH 工具（OpenSSH / OpenSSL）
│   └── Web服务器（Caddy / Nginx）
│
├── 进阶语言
│   ├── 系统编程语言（Rust）
│   └── 通用编程语言（...）
│
└── 软技能
    ├── 软件工程（敏捷开发 / Scrum）
    ├── 开源分享
    │   ├── 技术社区（Medium / dev.to / stackoverflow / 掘金 / 简书）
    │   └── 代码仓库（Github / GitLab / Gitee）
    └── 团队协作
        ├── 团队协作工具（Jira / Trello / BitBucket）
        ├── 远程协作工具（Slack / Discord）
        ├── 沟通技巧
        └── 技术写作
```

#### CategoryGroup 2: 难度（保持不变）

```
难度
├── 入门
├── 初级
├── 中级
└── 高级
```

#### 实现说明

- **Quiz 只需存叶子节点关联**（与现有 `QuestionCategory` 机制一致）
- 题目关联到具体技术叶子（如 `"Vitest"`）而非中间节点（如 `"单元测试"`）
- 中间节点只是分类导航用，不直接关联题目
- `seed-categories.ts` 中的 `CATEGORY_GROUPS` 需要完整重写，支持任意深度嵌套

**文件**：`apps/quiz-backend/prisma/data/seed-categories.ts`

---

### 2. 生产数据与测试数据的关系

> **核心原则**：生产数据和测试/开发数据完全独立，互不影响。

|               | 测试/开发环境                                    | 生产环境                                           |
| ------------- | ------------------------------------------------ | -------------------------------------------------- |
| **分类体系**  | `seed-categories.ts`（测试数据，可随时重置）     | 内容导入脚本创建（一次性清库后灌入，之后不再清库） |
| **题目数据**  | `seed-test.json`（带 `(TEST)` 前缀，可随时重置） | 内容导入脚本创建（幂等追加，不删除）               |
| **重置操作**  | `resetTest()` / `db:reset:test` 随便用           | **永远不做**，数据只增不删                         |
| **seed 脚本** | `seedSystem` / `seedTest` / `seedUsers` 等       | **不使用**，用独立的内容导入脚本                   |

现有 `prisma/data/` 下的所有 seed 文件（`seed-test.json`、`seed-categories.ts`、`seed-users.ts` 等）**保持不动**，它们只服务于测试/开发环境。

### 3. 实现内容导入脚本（独立于 seed 体系）

新建独立的内容导入工具，**不放在 `db-utils.ts`**，与现有 seed 体系完全分离：

```
apps/quiz-backend/
├── prisma/
│   ├── data/                    # 测试/开发数据（不动）
│   │   ├── seed-test.json
│   │   ├── seed-categories.ts
│   │   └── ...
│   └── content/                 # 生产内容数据（新建）
│       ├── categories.ts        # 完整分类体系定义（对齐个人学习网站）
│       ├── vitest.json          # 每个技术的题目
│       ├── vitest-categories.ts # 每个技术的分类映射
│       └── ...
└── scripts/
    └── import-content.ts        # 独立导入脚本入口
```

**导入脚本设计原则**：

- **幂等**：stem 匹配去重，已存在则更新（replace-all options），不存在则创建
- **只增不删**：绝对不调用 `deleteMany`、`resetAutoIncrements` 等破坏性操作
- **可在生产环境安全运行**：不检查 `ensureNotProd()`，因为它就是为生产设计的
- **独立入口**：不混入 `db-utils.ts`，通过 `scripts/import-content.ts` 独立调用
- **分步执行**：先导入分类体系，再导入题目并关联分类

### 4. 注册导入命令

在 `package.json` 中添加（三个环境都可以用）：

```json
"import:content:dev": "dotenv -e .env.dev -- tsx scripts/import-content.ts",
"import:content:test": "dotenv -e .env.test -- tsx scripts/import-content.ts",
"import:content:prod": "dotenv -e .env.prod -e .env.prod.local -- tsx scripts/import-content.ts"
```

### 5. 生产环境首次初始化流程

1. 清空生产库的分类和题目（**仅此一次**，手动操作或专用脚本）
2. 运行 `import:content:prod` 灌入完整分类体系 + 所有题目
3. 之后每次新增技术内容，只需新增 JSON + 映射文件，再跑 `import:content:prod` 追加

### 6. 待处理：`db:seed:prod` 安全隐患

> **风险**：现有 `scripts/seed.ts` 在 `mode === "prod"` 时会调用 `seedSystem()` + `seedTest()`，向生产库灌入测试题目、测试分类、测试用户等数据。虽有 `QUIZ_ALLOW_PROD_SEED=true` 环境变量保护，但一旦设置就会污染生产数据。
>
> **计划**：在正式灌入生产内容数据前，修改 `db:seed:prod` —— 去掉 `seedTest()` 调用，只保留 `seedSystem()`（管理员账号初始化）。或根据届时需要直接移除该命令。

---

## 每个技术的生产流程

### 第一步：VitePress 学习笔记

网站 sidebar 中已有大量技术条目但**无 link**（空占位），说明分类位置已确定，只需填充内容。

#### 文件结构

```
src/zh/{sidebar 对应路径}/{技术名}/
├── index.md           # 概览页
├── getting-started.md # 入门（含顶部速查）
└── guide-line.md      # 指南（可选，较大的技术才需要）
```

#### index.md（参考 husky/prettier/slidev 格式）

```markdown
---
layout: doc
---

# {技术名}

{一句话中文定义}

## 评价

**优点**

- ...

**缺点**

- ...

## 文档地址

[{技术名}]({官方文档URL})

## GitHub地址

[{技术名}]({GitHub URL})

## 幻灯片地址

<a href="/SlideStack/{技术名}-slide/" target="_blank">{技术名}</a>
```

#### getting-started.md（参考 lint-staged/husky 格式）

```markdown
---
layout: doc
outline: [2, 3]
---

# 入门

## 速查

- 安装：`pnpm add -D {包名}`
- 配置文件：`{配置文件名}`
- 核心命令：`{常用命令}`
- {其他关键要点}

## 安装

{安装步骤 + 代码块}

## 配置

{配置方式 + 代码块}

## 基本用法

{核心用法 + 代码示例}
```

#### 侧边栏更新

在 `.vitepress/config.mts` 中，将现有空占位条目补充 `link` 和 `items`：

```typescript
// 之前（空占位）
{ text: "Vitest" },

// 之后（填充内容）
{
  text: "Vitest",
  collapsed: true,
  link: "/zh/frontend-test/unit/vitest/",
  items: [
    { text: "入门", link: "/zh/frontend-test/unit/vitest/getting-started" },
  ],
},
```

**文件**：`/Users/zhangxu/workspace/IllegalCreedWebsite/.vitepress/config.mts`

---

### 第二步：Slidev 幻灯片

#### 新建 package

复制 `prettier-slide` 的结构到 `packages/{技术名}-slide/`：

```
packages/{技术名}-slide/
├── package.json
├── slides.md
├── components/       # 可选
├── public/           # logo 等资源
├── vercel.json       # 不变
└── netlify.toml      # 不变
```

#### package.json

```json
{
  "name": "{技术名}-slide",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "slidev build --base /SlideStack/{技术名}-slide/",
    "dev": "slidev --open",
    "export": "slidev export"
  },
  "dependencies": {
    "@slidev/cli": "^52.11.1",
    "@slidev/theme-default": "latest",
    "@slidev/theme-seriph": "latest",
    "vue": "^3.5.26"
  },
  "devDependencies": {
    "@iconify/json": "^2.2.420"
  }
}
```

#### slides.md 结构（约 10-15 页，轻量入门风格）

```
1. 封面（emoji/logo + 一句话 tagline + GitHub 链接）
2. 为什么选择它？（layout: image-right, v-clicks: 痛点→方案→优势）
3. 安装与配置（layout: two-cols-header）
4-6. 核心概念/用法（含代码块、magic-move）
7. 常见坑 & Tips
8. 总结 + 资源链接
```

每页含 `<!-- 讲者备注 -->`。

#### CI/CD

无需配置——pnpm workspace 自动发现，GitHub Actions `pnpm -r build` 自动构建。

---

### 第三步：Quiz 题目

#### 题目 JSON

位置：`apps/quiz-backend/prisma/data/content/{技术名}.json`

```json
[
  {
    "stem": "{技术名}: {题干}？",
    "explanation": "{解析}",
    "tags": ["{技术标签}", "{领域标签}"],
    "options": [
      { "text": "选项A", "isCorrect": false, "description": "解释" },
      { "text": "选项B", "isCorrect": true, "description": "解释" },
      { "text": "选项C", "isCorrect": false, "description": "解释" }
    ]
  }
]
```

**每技术 10-15 道**：基础 3-4 题 + 核心用法 4-5 题 + 进阶/易错 2-3 题 + 对比 1-2 题

#### 分类映射

位置：`apps/quiz-backend/prisma/data/content/{技术名}-categories.ts`

```typescript
export const {TECH}_CATEGORY_MAP: [string, [string, string][]][] = [
  ["{技术名}: {题干}？", [["技术方向", "{叶子分类名}"], ["难度", "{入门|初级|中级|高级}"]]],
];
```

#### 导入

```bash
pnpm -C apps/quiz-backend run import:content:dev
```

---

## 验证清单

| 产出           | 验证方式                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| VitePress 笔记 | `cd IllegalCreedWebsite && pnpm docs:dev` → 页面渲染 + 侧边栏导航正常     |
| Slidev 幻灯片  | `cd SlideStack/packages/{X}-slide && pnpm dev` → 幻灯片播放正常           |
| Quiz 题目      | `pnpm -C apps/quiz-backend run import:content:dev` → 管理后台题目列表可见 |

---

## 关键文件路径汇总

| 用途                  | 路径                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| VitePress 侧边栏      | `/Users/zhangxu/workspace/IllegalCreedWebsite/.vitepress/config.mts`                    |
| VitePress 内容        | `/Users/zhangxu/workspace/IllegalCreedWebsite/src/zh/`                                  |
| SlideStack 幻灯片     | `/Users/zhangxu/workspace/SlideStack/packages/`                                         |
| SlideStack CI         | `/Users/zhangxu/workspace/SlideStack/.github/workflows/deploy.yml`                      |
| Quiz 内容数据         | `/Users/zhangxu/illegal/quiz-monorepo/apps/quiz-backend/prisma/content/`                |
| Quiz 内容分类定义     | `/Users/zhangxu/illegal/quiz-monorepo/apps/quiz-backend/prisma/content/categories.ts`   |
| Quiz 内容导入脚本     | `/Users/zhangxu/illegal/quiz-monorepo/apps/quiz-backend/scripts/import-content.ts`      |
| Quiz 测试分类（不动） | `/Users/zhangxu/illegal/quiz-monorepo/apps/quiz-backend/prisma/data/seed-categories.ts` |
| Quiz DB 工具（不动）  | `/Users/zhangxu/illegal/quiz-monorepo/apps/quiz-backend/prisma/db-utils.ts`             |
