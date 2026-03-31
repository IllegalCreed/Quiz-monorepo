# Husky Quiz 题目生产计划（含 categories.ts 全面重构）

## Context

按技术生产 Quiz 题目，发现 `categories.ts` 中多个工具合并为一个叶子节点（如 `"DevOps（GitHub Actions / GitLab CI/CD / Jenkins / Husky / lint-staged）"`），无法精确关联单个工具的题目。需全面重构分类树：**具名工具/库各自独立成为叶子节点，概念类节点保持不变**。

---

## 一、categories.ts 重构原则

| 类型                    | 处理方式                         | 例子                                                   |
| ----------------------- | -------------------------------- | ------------------------------------------------------ |
| 具名工具/库（多个合并） | 父节点保留，每个工具拆为独立叶子 | `React`、`Vue`、`Vite`、`Husky`                        |
| 技术概念（非具名工具）  | 保持不变                         | `性能优化（异步组件 / 按需引入...）`、`浏览器渲染原理` |
| 已是单工具节点          | 保持不变                         | `Git`、`Docker`、`Rust`                                |

---

## 二、需拆分的节点清单

### Web进阶知识

| 原节点                                                              | 拆为叶子                                     |
| ------------------------------------------------------------------- | -------------------------------------------- |
| CSS预处理（Sass / Less / PostCSS / Tailwind CSS / UnoCSS）          | Sass、Less、PostCSS、Tailwind CSS、UnoCSS    |
| 包管理器 > 框架级（pnpm / NPM / pip3 / Cargo）                      | pnpm、NPM、pip3、Cargo                       |
| JS扩展库（Lodash-es / Day.js / uuid / axios / i18next / crypto.js） | Lodash-es、Day.js、axios、i18next、crypto.js |

### 前端框架

| 原节点                                                                           | 拆为叶子                                                    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| UI框架（React / Vue / Angular / Solid / Svelte / Preact）                        | React、Vue、Angular、Solid、Svelte、Preact                  |
| 元框架（Next.js / Nuxt.js / Astro / Qwik / Remix / SolidStart / SvelteKit）      | Next.js、Nuxt.js、Astro、Qwik、Remix、SolidStart、SvelteKit |
| 静态网站框架（Docusaurus / VitePress / Slidev）                                  | Docusaurus、VitePress、Slidev                               |
| 组件库（Element Plus / Vuetify / Vant UI / Ant Design / Nuxt UI / shadcn）       | Element Plus、Vuetify、Vant UI、Ant Design、Nuxt UI、shadcn |
| 状态库（Pinia / Zustand / Redux）                                                | Pinia、Zustand、Redux                                       |
| 路由库（Vue Router / React Router / React Navigation）                           | Vue Router、React Router、React Navigation                  |
| 复用库（VueUse / VueHooks Plus / Ahooks / React Use）                            | VueUse、Ahooks                                              |
| 其他（Iconify / Shiki / Markdown-it / TanStack Query / Vee-validate / Vue-i18n） | Iconify、Shiki、TanStack Query、Vee-validate、Vue-i18n      |

### 前端基础工具链

| 原节点                                           | 拆为叶子                          |
| ------------------------------------------------ | --------------------------------- |
| 构建工具（Vite / Webpack / Turbopack）           | Vite、Webpack、Turbopack          |
| 编译器（Babel / SWC / tsc）                      | Babel、SWC、tsc                   |
| 打包工具（esBuild / rollup / rolldown / rspack） | esBuild、rollup、rolldown、rspack |

### 前端开发工具

| 原节点                                                               | 拆为叶子                                         |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| IDE（VScode / WebStorm）                                             | VSCode、WebStorm                                 |
| 静态分析工具（ESLint / Prettier / Biome / StyleLint / EditorConfig） | ESLint、Prettier、Biome、StyleLint、EditorConfig |
| 文档生成器（JSdoc / TypeDoc / TSDoc / SassDoc）                      | JSDoc、TypeDoc                                   |

### 前端测试

| 原节点                                                                             | 拆为叶子                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| 单元测试（Jest / Vitest / VueTestUtils / MSW / Testing Library / Vue Router Mock） | Jest、Vitest、Vue Test Utils、MSW、Testing Library |
| 端到端测试（Cypress / Playwright）                                                 | Cypress、Playwright                                |

### 前端架构设计

| 原节点                             | 拆为叶子            |
| ---------------------------------- | ------------------- |
| 微前端框架（qiankun / single spa） | qiankun、single-spa |

### 移动/桌面开发

| 原节点                                                             | 拆为叶子                                         |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| 移动端框架（React Native / Flutter / 微信小程序 / Uniapp / Ionic） | React Native、Flutter、微信小程序、Uniapp、Ionic |
| 桌面端框架（Electron / Tauri）                                     | Electron、Tauri                                  |

### 前端可视化

| 原节点                                                                    | 拆为叶子                              |
| ------------------------------------------------------------------------- | ------------------------------------- |
| 图表（ECharts / D3.js / Chart.js / Recharts / leaflet / Mermaid / KaTeX） | ECharts、D3.js、Chart.js、Mermaid     |
| 三维（WebGL / Three.js / Babylon / CesiumJS）                             | WebGL、Three.js、Babylon.js、CesiumJS |
| 动画（Lottie / Popmotion / Framer Motion / GSAP / Anime.js）              | GSAP、Framer Motion、Lottie           |
| 拖拽（... Sortable.js / Draggable.js ...）                                | Sortable.js                           |

### 工程化与自动化

| 原节点                                                                  | 拆为叶子                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| DevOps（GitHub Actions / GitLab CI/CD / Jenkins / Husky / lint-staged） | GitHub Actions、GitLab CI/CD、Jenkins、**Husky**、lint-staged |
| 依赖管理器（Pnpm / Yarn / Bit）                                         | pnpm（工程）、Yarn、Bit                                       |
| Monorepo（Lerna / Turborepo）                                           | Lerna、Turborepo                                              |

### 安全

| 原节点                                            | 拆为叶子             |
| ------------------------------------------------- | -------------------- |
| 认证与授权（OAuth 2.0 / JWT / SAML / 哈希算法）   | OAuth 2.0、JWT、SAML |
| 安全框架（OWASP / Helmet.js / CORS / HTTP安全头） | Helmet.js            |

### 云服务

| 原节点                                                                        | 拆为叶子                          |
| ----------------------------------------------------------------------------- | --------------------------------- |
| 静态网站托管（Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render）    | Netlify、Vercel、Cloudflare Pages |
| 通用云服务（阿里云 / Firebase / Azure / Netlify / Vercel / Cloudflare / AWS） | 阿里云、Firebase、AWS             |

### 后端框架

| 原节点                               | 拆为叶子               |
| ------------------------------------ | ---------------------- |
| 基础框架（Node.js / Deno / Bun）     | Node.js、Deno、Bun     |
| 应用框架（Express / Fastify / Hono） | Express、Fastify、Hono |
| ORM框架（TypeORM / Prisma）          | TypeORM、Prisma        |

### 服务器基础知识

| 原节点                            | 拆为叶子              |
| --------------------------------- | --------------------- |
| Shells（Bash / Zsh / PowerShell） | Bash、Zsh、PowerShell |
| SSH 工具（OpenSSH / OpenSSL）     | OpenSSH、OpenSSL      |
| Web服务器（Caddy / Nginx）        | Caddy、Nginx          |

---

## 三、题目 JSON 新格式（内嵌 categories）

不再使用单独的 `-categories.ts` 映射文件，分类信息直接内嵌到 JSON：

```json
{
  "stem": "Husky: 安装命令是什么？",
  "explanation": "解析...",
  "tags": ["husky", "git-hooks", "devops"],
  "categories": [
    ["技术方向", "Husky"],
    ["难度", "入门"]
  ],
  "options": [...]
}
```

`import-content.ts` 需同步修改：从 JSON 的 `categories` 字段读取分类映射，不再扫描同名 `-categories.ts` 文件。

---

## 四、Husky 题目清单（共 13 题）

### 入门（4 题）

1. Husky 主要解决什么问题（定义）
2. 安装命令（`pnpm add -D husky`）
3. `pnpm exec husky init` 做了什么（创建 `.husky/pre-commit` + 设置 `prepare`）
4. 如何临时跳过钩子（`HUSKY=0` / `git -n`）

### 初级（5 题）

5. `pre-commit` 触发时机
6. Husky v9 使用的 Git 配置项（`core.hooksPath`）
7. `prepare` 脚本与 Husky 的关系
8. CI 环境避免干扰的方案（`install.mjs`）
9. `pre-push` vs `pre-commit` 适用场景对比

### 中级（4 题）

10. Yarn 需改用 `postinstall` 的原因
11. NVM 环境 GUI 工具中 node 找不到的解法
12. `.husky/_` 目录的作用（运行时内部脚本，已被 `.gitignore`）
13. Husky 与直接修改 `.git/hooks` 的对比优势

---

## 五、涉及文件

| 文件                                             | 操作                                  |
| ------------------------------------------------ | ------------------------------------- |
| `apps/quiz-backend/prisma/content/categories.ts` | 重构分类树（工具节点全部拆开）        |
| `apps/quiz-backend/scripts/import-content.ts`    | 改为从 JSON `categories` 字段读取映射 |
| `apps/quiz-backend/prisma/content/husky.json`    | 新建，13 道题（含内嵌 categories）    |
| `docs/plans/20260331-husky-quiz.md`              | 新建，归档本计划                      |

---

## 六、import-content.ts 关键改动

### SeedQuestion 接口新增 categories 字段

```typescript
interface SeedQuestion {
  stem: string;
  explanation?: string | null;
  tags?: string[] | null;
  categories?: [string, string][]; // ← 新增
  options: SeedOption[];
}
```

### importQuestions 函数改动

- 移除 `categoryMapPath` 参数（不再读取外部 `-categories.ts`）
- 直接从 `q.categories` 获取分类映射
- 删除 `catMapByRtem` Map 逻辑，改为直接遍历 `q.categories`

### main() 函数改动

- 移除 `catMapPath` 变量和外部文件加载逻辑
- 调用 `importQuestions(jsonFile, categoryIndex)` 即可

---

## 七、执行顺序

1. 重构 `categories.ts`（按第二节清单，工具节点拆分，概念类节点不变）
2. 修改 `import-content.ts`（读 JSON 内嵌 categories，删除外部 `-categories.ts` 加载逻辑）
3. 新建 `husky.json`（13 题，含内嵌 categories）
4. 本地验证：`pnpm run import:content:dev`，检查日志无报错，分类索引中出现 "Husky"
5. 生产导入：`pnpm run import:content:prod`
6. 提交代码 + 归档计划文档为 `docs/plans/20260331-husky-quiz.md`
