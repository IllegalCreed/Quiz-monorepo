/**
 * 生产内容分类体系定义
 *
 * 与个人学习网站 sidebar 完全对齐。
 * 本文件仅供 import-content.ts 使用，不参与 seed 体系。
 *
 * 结构说明：
 *   - CategoryGroup：分类维度（技术方向 / 难度）
 *   - CategoryNode：递归树节点，children 为空时为叶子节点
 *   - Quiz 只关联叶子节点（isLeaf 隐式由 children 为空决定）
 *
 * 重构原则（2026-03-31）：
 *   - 具名工具/库：各自独立成为叶子节点（如 React、Vue、Vite、Husky）
 *   - 技术概念（非具名工具）：保持不变（如 性能优化、浏览器渲染原理）
 *   - 已是单工具节点：保持不变（如 Git、Docker、Rust）
 */

export interface CategoryNode {
  /** 分类名称 */
  name: string;
  /** 排序权重（数字越小越靠前） */
  sort?: number;
  /** 子节点（为空则为叶子节点，可关联题目） */
  children?: CategoryNode[];
}

export interface CategoryGroupDef {
  /** 维度名称 */
  name: string;
  /** 排序权重 */
  sort: number;
  /** 分类树 */
  categories: CategoryNode[];
}

/** 完整分类体系，对齐 IllegalCreedWebsite sidebar */
export const CONTENT_CATEGORY_GROUPS: CategoryGroupDef[] = [
  // =============================================
  // 维度一：技术方向
  // =============================================
  {
    name: "技术方向",
    sort: 1,
    categories: [
      // ----- 1. Web基础知识 -----
      {
        name: "Web基础知识",
        sort: 1,
        children: [
          {
            name: "三大语言",
            sort: 1,
            children: [
              {
                // 2026-06-24 三大语言开篇章：HTML 由单叶升级为父节点，下挂 7 聚焦子叶
                //（spec: docs/plans/20260624-web-base-three-languages-trilogy.md）。
                // 叶子名带「HTML」前缀保证组内唯一（import 按 groupName+leafName 定位）。
                name: "HTML",
                sort: 1,
                children: [
                  { name: "HTML 文档结构与元数据", sort: 1 },
                  { name: "HTML 语义化与文档大纲", sort: 2 },
                  { name: "HTML 文本内容与超链接", sort: 3 },
                  { name: "HTML 表单与约束校验", sort: 4 },
                  { name: "HTML 图片与多媒体", sort: 5 },
                  { name: "HTML 表格", sort: 6 },
                  { name: "HTML 交互元素与全局属性", sort: 7 },
                ],
              },
              {
                // JavaScript 父节点 · 9 聚焦子叶（DOM/事件留本章 J9，事件循环归 J7 异步）
                name: "JavaScript",
                sort: 2,
                children: [
                  { name: "JavaScript 语言基础与类型系统", sort: 1 },
                  { name: "JavaScript 函数与作用域", sort: 2 },
                  { name: "JavaScript 对象与原型继承", sort: 3 },
                  { name: "JavaScript 类与面向对象", sort: 4 },
                  { name: "JavaScript 数组与可迭代协议", sort: 5 },
                  { name: "JavaScript 内建对象与数据结构", sort: 6 },
                  { name: "JavaScript 异步编程", sort: 7 },
                  { name: "JavaScript 生成器与元编程", sort: 8 },
                  { name: "JavaScript DOM 与事件", sort: 9 },
                ],
              },
              {
                // CSS 父节点 · 10 聚焦子叶（含独立排版叶 C10）
                name: "CSS",
                sort: 3,
                children: [
                  { name: "CSS 选择器与层叠", sort: 1 },
                  { name: "CSS 盒模型与尺寸", sort: 2 },
                  { name: "CSS 定位与层叠上下文", sort: 3 },
                  { name: "CSS Flexbox 弹性布局", sort: 4 },
                  { name: "CSS Grid 网格布局", sort: 5 },
                  { name: "CSS 响应式与现代查询", sort: 6 },
                  { name: "CSS 颜色与背景", sort: 7 },
                  { name: "CSS 过渡、动画与视觉", sort: 8 },
                  { name: "CSS 自定义属性、函数与工程化", sort: 9 },
                  { name: "CSS 文字排版与字体", sort: 10 },
                ],
              },
            ],
          },
          {
            // 2026-06-25 重构：旧 3 父节点（网络模型/网络协议/网络设备）结构倒挂——
            // 传输层 TCP/UDP 整缺、HTTP 压成 1/4 叶、DNS 错挂网络层、跨域无处安放。
            // 重构为扁平 11 叶（spec: docs/plans/20260625-web-base-computer-network-trilogy.md）。
            // 自底向上排序：模型→链路→网络→传输→应用各协议→接入层。
            // 叶子名组内唯一（自带 HTTP/TCP/DNS 等技术语义），无需前缀。
            // prod 旧 7 节点（id 23-29，全 0 题）须于落地时手动删除，避免分类移动坑残留。
            name: "计算机网络基础",
            sort: 2,
            children: [
              { name: "网络分层模型", sort: 1 },
              { name: "链路层与局域网", sort: 2 },
              { name: "网络层与路由", sort: 3 },
              { name: "传输层 TCP 与 UDP", sort: 4 },
              { name: "DNS 域名系统", sort: 5 },
              { name: "HTTP 协议基础", sort: 6 },
              { name: "HTTP 演进与性能", sort: 7 },
              { name: "HTTPS 与传输安全", sort: 8 },
              { name: "跨域与同源策略", sort: 9 },
              { name: "实时通信协议", sort: 10 },
              { name: "接入与移动网络", sort: 11 },
            ],
          },
          {
            // 2026-07-02 选型调研定稿：占位 3 叶 → 5 叶（spec: docs/plans/20260702-web-base-browser-trilogy.md）。
            // 新增「浏览器架构与进程模型」（进程/线程/导航编排原无落点）与「浏览器存储」
            // （选型矩阵/配额驱逐/分区原无落点；WebStorage/IndexedDB 的 API 用法仍留 Web API 章）。
            // 旧 3 叶全部保留原名（prod id 31/32/33，均 0 题已核实），仅重排 sort——
            // importCategories 不更新已有节点 sort，落地时须手动补 prod 的 3 条 sort UPDATE。
            name: "浏览器基础",
            sort: 3,
            children: [
              { name: "浏览器架构与进程模型", sort: 1 },
              { name: "浏览器渲染原理", sort: 2 },
              { name: "浏览器存储", sort: 3 },
              { name: "浏览器缓存机制", sort: 4 },
              { name: "浏览器安全", sort: 5 },
            ],
          },
        ],
      },

      // ----- 2. Web进阶知识 -----
      {
        name: "Web进阶知识",
        sort: 2,
        children: [
          {
            name: "语言",
            sort: 1,
            children: [
              { name: "Markdown", sort: 1 },
              // 2026-07-05 新增：Markdown+JSX 超集，Docusaurus/Nextra/Astro 文档生态主力
              { name: "MDX", sort: 2 },
              { name: "TypeScript", sort: 3 },
              {
                // 2026-07-05 选型调研定案：旧「CSS预处理」组名不准（Tailwind/UnoCSS 非预处理器），
                // 重构升级为「样式方案」父组，下分两桶——「CSS 工具链」（预处理/后处理/原子化）
                // + 「CSS-in-JS」（新增范式：2026 现代主流 4）。
                // spec: docs/plans/20260705-web-advanced-language-trilogy.md
                // 🚨 prod 移动坑：import 按 groupId:parentId:name 只增不删——旧「CSS预处理」节点
                //   及其 5 子叶（Sass/Less/PostCSS/Tailwind CSS/UnoCSS，旧 parentId=CSS预处理，均 0 题）
                //   在新结构下 parentId 改为「CSS 工具链」→ key 变→ import 新建、旧的成孤儿。
                //   下次 import:content:prod 前须先只读核查（0 题 0 有效子引用）后删旧 6 节点，再 import。
                name: "样式方案",
                sort: 4,
                children: [
                  {
                    name: "CSS 工具链",
                    sort: 1,
                    children: [
                      { name: "Sass", sort: 1 },
                      { name: "Less", sort: 2 },
                      { name: "PostCSS", sort: 3 },
                      { name: "Tailwind CSS", sort: 4 },
                      { name: "UnoCSS", sort: 5 },
                    ],
                  },
                  {
                    // 2026-07-05 新增 CSS-in-JS 组：现代主流 4（排除衰退期 styled-components/Emotion，
                    //   在各叶对比带过）。CSS Modules 为零运行时作用域基线，与 CSS-in-JS 对照。
                    name: "CSS-in-JS",
                    sort: 2,
                    children: [
                      { name: "CSS Modules", sort: 1 },
                      { name: "StyleX", sort: 2 },
                      { name: "Panda CSS", sort: 3 },
                      { name: "vanilla-extract", sort: 4 },
                    ],
                  },
                ],
              },
              { name: "JSON", sort: 5 },
              { name: "YAML", sort: 6 },
              // 2026-07-05 新增：Cargo/pyproject/Wrangler 等广泛使用的配置语言，与 JSON/YAML 同类
              { name: "TOML", sort: 7 },
            ],
          },
          {
            // 2026-07-11 选型调研定案：9 占位叶 → 17 叶（spec: docs/plans/20260711-web-api-trilogy.md）。
            // 本章统一负责「浏览器 API 编程用法」——协议原理在网络章 net-realtime、
            // 存储模型/选型在浏览器章 browser-storage、SW 缓存决策在 browser-cache，只链接不重复。
            // 旧 9 叶名称/父子关系全不动（prod 已建 0 题节点），新 8 叶纯追加，无分类移动坑。
            // 排除：WebTransport（太新，WebSocket 叶带过）/ Web Crypto（安全章）/ WebAuthn（安全章语义）
            //   / Performance API（优化章）/ Canvas·SVG·WebGL·WebGPU·WAAPI（可视化章已收官）。
            name: "Web API",
            sort: 2,
            children: [
              { name: "Web Components", sort: 1 },
              { name: "Web Assembly", sort: 2 },
              { name: "WebRTC API", sort: 3 },
              { name: "Server-Sent Events", sort: 4 },
              { name: "Fetch API", sort: 5 },
              { name: "WebSocket", sort: 6 },
              { name: "Web Storage API", sort: 7 },
              { name: "IndexedDB", sort: 8 },
              { name: "Web Workers API", sort: 9 },
              // ---- 以下 2026-07-11 新增 8 叶 ----
              { name: "Service Worker 与 PWA", sort: 10 },
              { name: "Streams API", sort: 11 },
              { name: "Observer 观察器 API", sort: 12 },
              { name: "History 与 Navigation API", sort: 13 },
              { name: "View Transitions API", sort: 14 },
              { name: "File 与文件系统 API", sort: 15 },
              { name: "跨上下文通信", sort: 16 },
              { name: "常用杂项 API", sort: 17 },
            ],
          },
          {
            // 2026-06 由单叶子「模块管理（CommonJS / ES Module）」拆为两叶（生产库旧叶子已就地改名复用 id）
            name: "模块管理",
            sort: 3,
            children: [
              { name: "CommonJS", sort: 1 },
              { name: "ES Module", sort: 2 },
            ],
          },
          {
            // 2026-06 收敛为 JS 四大包管理器：移除框架级/系统级中间层与跨语言叶子(pip3/Cargo)。
            // 系统级(Homebrew/apt 等 OS 包管理器)与其他语言(Python pip / Rust Cargo)非前端选型重点，暂不立叶。
            name: "包管理器",
            sort: 4,
            children: [
              { name: "npm", sort: 1 },
              { name: "pnpm", sort: 2 },
              { name: "yarn", sort: 3 },
              { name: "bun", sort: 4 },
            ],
          },
          {
            name: "JS扩展库",
            sort: 5,
            children: [
              { name: "Lodash-es", sort: 1 },
              { name: "es-toolkit", sort: 2 },
              { name: "Day.js", sort: 3 },
              { name: "date-fns", sort: 4 },
              { name: "Luxon", sort: 5 },
              { name: "axios", sort: 6 },
              { name: "ky", sort: 7 },
              { name: "ofetch", sort: 8 },
              { name: "Zod", sort: 9 },
              { name: "Valibot", sort: 10 },
              { name: "Immer", sort: 11 },
              { name: "RxJS", sort: 12 },
              { name: "nanoid", sort: 13 },
              { name: "type-fest", sort: 14 },
              { name: "ts-pattern", sort: 15 },
              { name: "DOMPurify", sort: 16 },
              { name: "decimal.js", sort: 17 },
              { name: "PapaParse", sort: 18 },
              { name: "Fuse.js", sort: 19 },
              { name: "前端实用小库", sort: 20 },
              { name: "crypto-js", sort: 21 },
            ],
          },
        ],
      },

      // ----- 3. 前端框架 -----
      {
        name: "前端框架",
        sort: 3,
        children: [
          {
            name: "UI框架",
            sort: 1,
            children: [
              { name: "React", sort: 1 },
              { name: "Vue", sort: 2 },
              { name: "Angular", sort: 3 },
              { name: "Svelte", sort: 4 },
              { name: "Solid", sort: 5 },
              { name: "Lit", sort: 6 },
              { name: "Alpine.js", sort: 7 },
              { name: "HTMX", sort: 8 },
              { name: "Preact", sort: 9 },
            ],
          },
          {
            name: "元框架",
            sort: 2,
            children: [
              { name: "Next.js", sort: 1 },
              { name: "Nuxt", sort: 2 },
              { name: "Astro", sort: 3 },
              { name: "Qwik", sort: 4 },
              { name: "React Router", sort: 5 },
              { name: "SolidStart", sort: 6 },
              { name: "SvelteKit", sort: 7 },
              { name: "TanStack Start", sort: 8 },
              { name: "Analog", sort: 9 },
              { name: "Remix", sort: 10 },
            ],
          },
          {
            name: "静态网站框架",
            sort: 3,
            children: [
              { name: "Docusaurus", sort: 1 },
              { name: "VitePress", sort: 2 },
              { name: "Slidev", sort: 3 },
              { name: "Hexo", sort: 4 },
              { name: "Eleventy", sort: 5 },
              { name: "Nextra", sort: 6 },
              { name: "Starlight", sort: 7 },
            ],
          },
          {
            name: "组件库",
            sort: 4,
            children: [
              { name: "Element Plus", sort: 1 },
              { name: "Vuetify", sort: 2 },
              { name: "Vant UI", sort: 3 },
              { name: "Naive UI", sort: 4 },
              { name: "PrimeVue", sort: 5 },
              { name: "Arco Design Vue", sort: 6 },
              { name: "Nuxt UI", sort: 7 },
              { name: "Ant Design", sort: 8 },
              { name: "MUI", sort: 9 },
              { name: "Mantine", sort: 10 },
              { name: "Chakra UI", sort: 11 },
              { name: "Radix UI", sort: 12 },
              { name: "Headless UI", sort: 13 },
              { name: "shadcn", sort: 14 },
              { name: "Angular Material", sort: 15 },
              { name: "NG-ZORRO", sort: 16 },
              { name: "PrimeNG", sort: 17 },
              // 2026-07-05 新增：Meta 2026-06 开源的 React 设计系统（MIT，150+ 组件，基于 StyleX，
              //   带 CLI+MCP「AI agent 可读」）。与语言章 StyleX 配套同批产出。
              //   spec: docs/plans/20260705-web-advanced-language-trilogy.md
              { name: "Astryx", sort: 18 },
            ],
          },
          {
            name: "状态库",
            sort: 5,
            children: [
              { name: "Pinia", sort: 1 },
              { name: "Zustand", sort: 2 },
              { name: "Redux", sort: 3 },
              { name: "Jotai", sort: 4 },
              { name: "MobX", sort: 5 },
              { name: "NgRx", sort: 6 },
            ],
          },
          {
            name: "路由库",
            sort: 6,
            children: [
              { name: "Vue Router", sort: 1 },
              { name: "React Navigation", sort: 2 },
              { name: "TanStack Router", sort: 3 },
            ],
          },
          {
            name: "组合式函数库",
            sort: 7,
            children: [
              { name: "VueUse", sort: 1 },
              { name: "VueHooks Plus", sort: 2 },
              { name: "Ahooks", sort: 3 },
              { name: "React Use", sort: 4 },
              { name: "usehooks-ts", sort: 5 },
            ],
          },
          {
            name: "文档处理",
            sort: 8,
            children: [
              { name: "SheetJS", sort: 1 },
              { name: "ExcelJS", sort: 2 },
              { name: "docx", sort: 3 },
              { name: "mammoth", sort: 4 },
              { name: "docxtemplater", sort: 5 },
              { name: "docx-editor", sort: 6 },
              { name: "PDF.js", sort: 7 },
              { name: "jsPDF", sort: 8 },
              { name: "pdf-lib", sort: 9 },
              { name: "pptxgenjs", sort: 10 },
            ],
          },
          {
            name: "其他",
            sort: 9,
            children: [
              { name: "Iconify", sort: 1 },
              { name: "Shiki", sort: 2 },
              { name: "TanStack Query", sort: 3 },
              { name: "Vee-validate", sort: 4 },
              { name: "Vue-i18n", sort: 5 },
              { name: "Markdown-it", sort: 6 },
              { name: "i18next", sort: 7 },
            ],
          },
        ],
      },

      // ----- 4. 前端基础工具链 -----
      {
        name: "前端基础工具链",
        sort: 4,
        children: [
          {
            name: "构建工具",
            sort: 1,
            children: [
              { name: "Vite", sort: 1 },
              { name: "Webpack", sort: 2 },
              { name: "Turbopack", sort: 3 },
              // 零配置一体化构建工具（dev server + 打包 + 优化），与上三者同级
              { name: "Parcel", sort: 4 },
              // Rspack 之上的一体化构建工具（集成层，对位 Vite）；底层 Rspack 留在「打包工具」
              { name: "Rsbuild", sort: 5 },
            ],
          },
          {
            name: "编译器",
            sort: 2,
            children: [
              { name: "Babel", sort: 1 },
              { name: "SWC", sort: 2 },
              { name: "tsc", sort: 3 },
            ],
          },
          {
            name: "打包工具",
            sort: 3,
            children: [
              { name: "esBuild", sort: 1 },
              { name: "rollup", sort: 2 },
              { name: "rolldown", sort: 3 },
              { name: "rspack", sort: 4 },
              // 库打包向三巨头：tsup（esbuild 系事实标准）/ tsdown（Rolldown 官方接班人）/ unbuild（UnJS 系，独特 stub mode）
              { name: "tsup", sort: 5 },
              { name: "tsdown", sort: 6 },
              { name: "unbuild", sort: 7 },
            ],
          },
          // 注：曾规划「开发服务器」叶子（Live Server / BrowserSync），2026-06 裁撤——
          // dev server 是构建工具的内置能力（Vite/Rsbuild 内容已覆盖），不构成独立分层；
          // 本组语义收敛为构建链路三层：编译器 → 打包工具 → 构建工具。
        ],
      },

      // ----- 5. 前端开发工具 -----
      {
        name: "前端开发工具",
        sort: 5,
        children: [
          {
            name: "IDE",
            sort: 1,
            children: [
              { name: "VSCode", sort: 1 },
              { name: "Cursor", sort: 2 },
              { name: "WebStorm", sort: 3 },
              { name: "Windsurf", sort: 4 },
              { name: "Trae", sort: 5 },
              { name: "Zed", sort: 6 },
              { name: "Antigravity", sort: 7 },
              { name: "Kiro", sort: 8 },
              { name: "Vim/Neovim", sort: 9 },
              { name: "Sublime Text", sort: 10 },
            ],
          },
          {
            // 2026-06 由单叶占位「版本控制（Git）」扩为 7 叶工具组（方案 B）：
            // Git 锚点 + 主流 GUI 三件 + 终端 TUI + 新一代替代 VCS。排序按
            // 「霸主 → GUI → 终端 → 新兴」聚类，便于对比教学。旧单叶无题目挂载，无数据迁移。
            // 边界去重：GitHub/GitLab 平台→软技能·代码仓库；CI/Hooks→工程化·DevOps；
            // GitLens→VSCode 生态；SVN/Mercurial/Perforce 衰退遗留不立叶。
            name: "版本控制",
            sort: 2,
            children: [
              { name: "Git", sort: 1 },
              { name: "GitHub Desktop", sort: 2 },
              { name: "Sourcetree", sort: 3 },
              { name: "GitKraken", sort: 4 },
              { name: "Fork", sort: 5 },
              { name: "lazygit", sort: 6 },
              { name: "Jujutsu", sort: 7 },
              // 2026-06-18 Sapling 立叶（sort 8，内容待产）：Meta 的 Git 兼容 VCS，monorepo/stacked-commits。
              { name: "Sapling", sort: 8 },
            ],
          },
          {
            // 2026-06 选型调研定稿：5 叶 → 10 叶。新增 oxlint（Oxc 用户主力 / ESLint 替代，
            // 32M；oxc-parser 63M 多为传递依赖，故以 oxlint 立叶不以 oxc 立）、Knip（35M，
            // dead-code/未用依赖导出检测事实标准，已取代 depcheck/ts-prune）、commitlint
            //（33M，commit message 校验）、secretlint（4.1M，硬编码密钥 pre-commit/CI 门禁）、
            // publint（3.2M，npm 包发布前 package.json 兼容性校验）。本章语义扩为「代码质量 +
            // 提交/发布前静态门禁全集」。排序按「JS lint → 一体化 → format → CSS lint →
            // 项目清理 → 提交/密钥/发布门禁 → 编辑器配置」聚类。
            // 边界去重：commitlint/secretlint 校验本体入本章，Husky/lint-staged 仍归 工程化·DevOps
            //（hooks 管理器 / 暂存调度器，非校验本体）；publint 搭档 arethetypeswrong(1.54M) 暂不立；
            // madge/dependency-cruiser→架构下批评估；react-doctor（1.76M，React 专属 + AI agent 安全网）
            // 归「大语言模型与生成式 AI」分类（见该组 TODO），不在本章立叶；
            // dprint(0.74M)/ls-lint/markuplint(<1M)/jshint/standard/xo/ts-prune/rome 衰退或小众不立。
            name: "静态分析工具",
            sort: 3,
            children: [
              { name: "ESLint", sort: 1 },
              { name: "oxlint", sort: 2 },
              { name: "Biome", sort: 3 },
              { name: "Prettier", sort: 4 },
              { name: "StyleLint", sort: 5 },
              { name: "Knip", sort: 6 },
              { name: "commitlint", sort: 7 },
              { name: "secretlint", sort: 8 },
              { name: "publint", sort: 9 },
              { name: "EditorConfig", sort: 10 },
            ],
          },
          {
            // 2026-06-17 选型调研定稿：占位单叶 → 5 叶。判据＝「浏览器内、手写代码、即时跑/分享」。
            // 排序按机制聚类：WebContainers(跑 Node) → 服务端 microVM → 纯前端 iframe → RN 垂直 → 框架官方编译。
            // 边界去重：bolt.new/v0/Lovable/Replit Agent(prompt-to-app)→ 大语言模型·AI 应用生成器；
            // Gitpod(Ona)/GitHub Codespaces(云开发环境)、val.town(serverless)、Firebase Studio(2027 停运)、
            // Glitch(2025-07 关停) 均不立叶；JSFiddle 并入 CodePen 对比带过；Replit 本体转 AI 不单列。
            name: "在线编辑器",
            sort: 4,
            children: [
              { name: "StackBlitz", sort: 1 },
              { name: "CodeSandbox", sort: 2 },
              { name: "CodePen", sort: 3 },
              { name: "Expo Snack", sort: 4 },
              { name: "框架官方 Playground", sort: 5 },
            ],
          },
          {
            // 2026-06-18 选型调研定稿：占位 2 叶 → 7 叶。判据＝「读代码注释/类型 或 API 规范，产出 API 文档」。
            // 排序按「代码文档（JS 锚点→TS 主力→库契约→注释规范）→ OpenAPI 文档（参考实现→只读经典→新一代）」聚类。
            // 边界去重：站点型 SSG（VitePress/Docusaurus/Nextra/Starlight/Fumadocs/Mintlify）→ 前端框架·静态网站框架；
            // 组件文档（Storybook/Styleguidist/dumi/Ladle/Docz）→ 架构设计·组件设计；
            // documentation.js（更新放缓）/ESDoc（弃用）被 TypeDoc+JSDoc 覆盖，不立叶；
            // api-documenter 并入 API Extractor 叶（其 Markdown 输出环节）；RapiDoc/Stoplight Elements 小众不立。
            name: "文档生成器",
            sort: 5,
            children: [
              { name: "JSDoc", sort: 1 },
              { name: "TypeDoc", sort: 2 },
              { name: "API Extractor", sort: 3 },
              { name: "TSDoc", sort: 4 },
              { name: "Swagger UI", sort: 5 },
              { name: "Redoc", sort: 6 },
              { name: "Scalar", sort: 7 },
            ],
          },
        ],
      },

      // ----- 6. 前端测试 -----
      {
        name: "前端测试",
        sort: 6,
        children: [
          // 测试类型（按"测什么范围"分）：单元 → 组件 → 端到端
          {
            name: "单元测试",
            sort: 1,
            children: [
              { name: "Vitest", sort: 1 },
              { name: "Jest", sort: 2 },
              { name: "MSW", sort: 3 },
            ],
          },
          {
            name: "组件测试",
            sort: 2,
            children: [
              { name: "Vue Test Utils", sort: 1 },
              { name: "Testing Library", sort: 2 },
              { name: "@pinia/testing", sort: 3 },
              { name: "Vitest Browser Mode", sort: 4 },
            ],
          },
          {
            name: "端到端测试",
            sort: 3,
            children: [
              { name: "Cypress", sort: 1 },
              { name: "Playwright", sort: 2 },
              { name: "Selenium", sort: 3 },
              { name: "WebdriverIO", sort: 4 },
              { name: "Puppeteer", sort: 5 },
            ],
          },
          // 横切技术（按"怎么测得好"分），与测试类型维度正交
          {
            name: "测试方法与质量",
            sort: 4,
            children: [
              { name: "代码覆盖率", sort: 1 },
              { name: "快照测试", sort: 2 },
              { name: "可访问性测试", sort: 3 },
              { name: "视觉回归测试", sort: 4 },
              { name: "变异测试", sort: 5 },
              { name: "属性测试", sort: 6 },
            ],
          },
          // 其他工具：兜底组（原 Mailtrap 占位经核实价值不足已删，改挂 Faker.js）
          {
            name: "其他工具",
            sort: 5,
            children: [{ name: "Faker.js", sort: 1 }],
          },
        ],
      },

      // ----- 7. 前端优化 -----
      {
        name: "前端优化",
        sort: 7,
        children: [
          {
            // 2026-06-23 选型调研定稿：占位单叶 → 7 叶。判据＝「浏览器内置 DevTools 或框架/状态调试扩展（调试·审查类，非审计类）」。
            // 排序按机制聚类：内置 DevTools（三大渲染引擎 Blink→Gecko→WebKit）→ 框架组件树扩展（React→Vue→Angular）→ 状态调试扩展（Redux）。
            // 边界去重：审计类 Lighthouse/Webpack Bundle Analyzer/rollup-plugin-visualizer → 性能优化·性能评估；
            // 可访问性自动化（axe 等）→ 前端测试·可访问性测试；
            // Edge DevTools 同属 Chromium、与 Chrome 高度重叠，并入 Chrome DevTools 笔记对比带过（3D View/CSS Overview/Memory Detached elements），不单列。
            name: "浏览器工具",
            sort: 1,
            children: [
              { name: "Chrome DevTools", sort: 1 },
              { name: "Firefox Developer Tools", sort: 2 },
              { name: "Safari Web Inspector", sort: 3 },
              { name: "React DevTools", sort: 4 },
              { name: "Vue DevTools", sort: 5 },
              { name: "Angular DevTools", sort: 6 },
              { name: "Redux DevTools", sort: 7 },
            ],
          },
          {
            // 2026-07-18 选型调研定稿：占位单叶 → 组+7叶（与 sidebar 占位对齐）。
            // 4 叶通用手段（异步组件/按需引入/虚拟化/事件及属性优化）+ 性能评估组（3 工具叶）。
            // 调研结论见 docs/plans/20260718-perf-optimization-trilogy.md + workflow journal。
            name: "性能优化",
            sort: 2,
            children: [
              { name: "异步组件", sort: 1 },
              { name: "按需引入", sort: 2 },
              { name: "虚拟化", sort: 3 },
              { name: "事件及属性优化", sort: 4 },
              { name: "渲染性能", sort: 5 },
              { name: "图片优化", sort: 6 },
              {
                name: "性能评估",
                sort: 7,
                children: [
                  { name: "Lighthouse", sort: 1 },
                  { name: "Webpack Bundle Analyzer", sort: 2 },
                  { name: "rollup-plugin-visualizer", sort: 3 },
                ],
              },
            ],
          },
          {
            // 2026-07-19 单叶 → 组+2叶（与 sidebar 占位对齐）。代码分割讲策略与构建配置，
            // Tree Shaking 讲构建期死代码消除；与性能优化·异步组件章界定边界（组件级 lazy API 归异步组件）。
            name: "代码优化",
            sort: 3,
            children: [
              { name: "代码分割", sort: 1 },
              { name: "Tree Shaking", sort: 2 },
              { name: "代码压缩", sort: 3 },
              { name: "Polyfill 按需加载", sort: 4 },
            ],
          },
          {
            // 2026-07-19 选型评估：单叶 → 组+5叶（CDN/HTTP缓存/压缩/HTTP2·3/Service Worker）。
            // 边界：preload/prefetch 构建器魔法注释归代码分割叶，本叶 HTTP 缓存讲 link 标签资源提示；
            // 浏览器缓存机制原理归浏览器基础章，本叶讲缓存策略配置。
            name: "网络优化",
            sort: 4,
            children: [
              { name: "CDN", sort: 1 },
              { name: "HTTP 缓存", sort: 2 },
              { name: "压缩", sort: 3 },
              { name: "HTTP/2·HTTP/3", sort: 4 },
              { name: "Service Worker 缓存", sort: 5 },
            ],
          },
          {
            // 2026-07-21 选型评估：单叶 → 组+4叶（懒加载和预加载/交互优化/过渡动画/可访问性）。
            // 边界：代码分割讲"如何切chunk"，本叶讲"加载时机"；防抖节流性能归事件属性叶，UX归交互优化；
            // 可访问性测试(axe)归前端测试章，本叶讲a11y实践。
            name: "用户体验优化",
            sort: 5,
            children: [
              { name: "懒加载和预加载", sort: 1 },
              { name: "交互优化", sort: 2 },
              { name: "过渡动画", sort: 3 },
              { name: "可访问性", sort: 4 },
            ],
          },
          {
            // 2026-07-21 选型评估：单叶 → 组+4叶（技术SEO/页面SEO/结构化数据/GEO）。
            // 边界：CWV 机制归性能优化章，本叶讲 SEO 影响；SSR/SSG 实现归框架章，本叶讲爬虫意义。
            name: "搜索引擎优化",
            sort: 6,
            children: [
              { name: "技术 SEO", sort: 1 },
              { name: "页面 SEO", sort: 2 },
              { name: "结构化数据", sort: 3 },
              { name: "GEO", sort: 4 },
            ],
          },
        ],
      },

      // ----- 8. 前端架构设计 -----
      {
        name: "前端架构设计",
        sort: 8,
        children: [
          {
            name: "设计模式",
            sort: 1,
            children: [
              { name: "架构模式（MVC / MVP / MVVM）", sort: 1 },
              { name: "创建型设计模式", sort: 2 },
              { name: "结构型设计模式", sort: 3 },
              { name: "行为型设计模式", sort: 4 },
            ],
          },
          {
            name: "组件设计",
            sort: 2,
            children: [
              { name: "组件分类与设计原则", sort: 1 },
              { name: "Storybook", sort: 2 },
              { name: "Styleguidist", sort: 3 },
            ],
          },
          {
            // 2026-07-02 选型调研定稿：占位 2 叶 → 7 叶（spec: docs/plans/20260702-frontend-arch-micro-frontend-trilogy.md）。
            // 生态硬数据（GitHub/npm 实测）：MF 2.0 已运行时化成事实主线、wujie 2026-06 复活 v2.0、
            // micro-app 持续活跃（1.0 仍 RC）；Garfish 维护模式、icestark 遗产态——不立叶。
            // 新增 2 个原理叶（基础/核心机制）承载框架无关通论；MF 叶只讲架构层，
            // 插件配置已被 webpack expert/rspack advanced 深讲（边界核验），链接不重复。
            // 旧 2 叶保留原名（prod id 170/171，均 0 题已核实），仅重排 sort——
            // importCategories 不更新已有节点 sort，落地时须手动补 prod 2 条 sort UPDATE（170→4、171→3）。
            name: "微前端框架",
            sort: 3,
            children: [
              { name: "微前端基础", sort: 1 },
              {
                name: "微前端核心机制（沙箱 / 样式隔离 / 通信 / 依赖共享）",
                sort: 2,
              },
              { name: "single-spa", sort: 3 },
              { name: "qiankun", sort: 4 },
              { name: "wujie", sort: 5 },
              { name: "micro-app", sort: 6 },
              { name: "Module Federation", sort: 7 },
            ],
          },
          {
            // 2026-07-21 选型评估新增：渲染架构 + 状态管理架构（前端架构五层：代码模式→组件→集成→渲染→状态）。
            // 边界：Next.js/Nuxt 讲框架实现，渲染架构叶讲选型策略；Pinia/Zustand 讲 API，状态架构叶讲架构策略。
            name: "渲染架构",
            sort: 4,
            children: [
              {
                name: "渲染模式选型（CSR / SSR / SSG / ISR / Streaming / Islands / RSC）",
                sort: 1,
              },
            ],
          },
          {
            name: "状态管理架构",
            sort: 5,
            children: [
              {
                name: "状态架构策略（本地 vs 全局 / 响应式 vs 不可变 / 原子化 / 规范化）",
                sort: 1,
              },
            ],
          },
        ],
      },

      // ----- 9. 移动/桌面开发 -----
      // ⚠️ 2026-07-03 选型调研定案重构：三章格局 = 移动端框架 / 小程序 / 桌面端框架。
      //   移动端框架收窄为「真·原生/混合 App 框架」：移出「微信小程序」「Uniapp」，
      //     新增 Capacitor（原生运行时，周下载 292 万）、Lynx（字节 2025 开源·观察叶）。
      //   小程序单独成章：微信/支付宝/抖音/百度/QQ 五原生平台 + uni-app（原 Uniapp 更名）/Taro 两跨端框架。
      //   桌面端扩为四强：Electron/Tauri + Wails（Go+Web）/Neutralino（纯 JS 轻量）。
      //   组名保留「移动/桌面开发」（小程序属移动开发；改一级 node 名会令 prod 整棵子树 re-key 成孤儿，得不偿失）。
      // 🚨 prod 移动坑：import 只增不删——下次 import:content:prod 前须先删 prod 里「移动端框架」下的
      //   旧占位叶「微信小程序」「Uniapp」（0 题节点，已迁至小程序章 / 更名为 uni-app），否则残留孤儿。
      //   详见部署记忆 content-deploy-workflow「分类移动坑」。
      {
        name: "移动/桌面开发",
        sort: 9,
        children: [
          {
            name: "移动端框架",
            sort: 1,
            children: [
              { name: "React Native", sort: 1 },
              { name: "Flutter", sort: 2 },
              { name: "Capacitor", sort: 3 },
              { name: "Ionic", sort: 4 },
              { name: "Lynx", sort: 5 },
            ],
          },
          {
            name: "小程序",
            sort: 2,
            children: [
              { name: "微信小程序", sort: 1 },
              { name: "支付宝小程序", sort: 2 },
              { name: "抖音小程序", sort: 3 },
              { name: "百度智能小程序", sort: 4 },
              { name: "QQ小程序", sort: 5 },
              { name: "uni-app", sort: 6 },
              { name: "Taro", sort: 7 },
            ],
          },
          {
            name: "桌面端框架",
            sort: 3,
            children: [
              { name: "Electron", sort: 1 },
              { name: "Tauri", sort: 2 },
              { name: "Wails", sort: 3 },
              { name: "Neutralino", sort: 4 },
            ],
          },
        ],
      },

      // ----- 10. 前端可视化 -----
      // 🔒 2026-07-04 选型调研定案扩章（npm 周下载量 + 全站去重 + 2025-2026 生态事件核查）：
      //   新增「图形基础」地基组（Canvas/SVG 全站无叶）；图表补 Recharts/AntV G2；
      //   新增三组：图与流程图(G6/X6) / 地图(Leaflet/Mapbox-MapLibre) / 2D 渲染引擎(Pixi/Fabric/Konva)；
      //   三维补 WebGPU（2025 底全主流 Baseline）；动画补 WAAPI 地基 + Anime.js v4；拖拽补 dnd-kit。
      //   prod 安全：既有组/叶名与父子关系全不动（Framer Motion 叶名保留、内容讲 Motion 演进；CesiumJS 留三维组），仅重排 sort。
      //   排除项：react-dnd/Hammer.js/Popmotion→停维护；Animate.css→与 CSS 章重叠；KaTeX→出题空间小；
      //   候选观察：OpenLayers/React Three Fiber/Pragmatic DnD/Interact.js/Rive。
      {
        name: "前端可视化",
        sort: 10,
        children: [
          {
            name: "图形基础",
            sort: 1,
            children: [
              { name: "Canvas", sort: 1 },
              { name: "SVG", sort: 2 },
            ],
          },
          {
            name: "图表",
            sort: 2,
            children: [
              { name: "ECharts", sort: 1 },
              { name: "D3.js", sort: 2 },
              { name: "Chart.js", sort: 3 },
              { name: "Recharts", sort: 4 },
              { name: "AntV G2", sort: 5 },
              { name: "Mermaid", sort: 6 },
            ],
          },
          {
            name: "图与流程图",
            sort: 3,
            children: [
              { name: "AntV G6", sort: 1 },
              { name: "AntV X6", sort: 2 },
            ],
          },
          {
            name: "地图",
            sort: 4,
            children: [
              { name: "Leaflet", sort: 1 },
              { name: "Mapbox GL JS 与 MapLibre", sort: 2 },
            ],
          },
          {
            name: "三维",
            sort: 5,
            children: [
              { name: "WebGL", sort: 1 },
              { name: "WebGPU", sort: 2 },
              { name: "Three.js", sort: 3 },
              { name: "Babylon.js", sort: 4 },
              { name: "CesiumJS", sort: 5 },
            ],
          },
          {
            name: "2D 渲染引擎",
            sort: 6,
            children: [
              { name: "PixiJS", sort: 1 },
              { name: "Fabric.js", sort: 2 },
              { name: "Konva", sort: 3 },
            ],
          },
          {
            name: "动画",
            sort: 7,
            children: [
              { name: "Web Animations API", sort: 1 },
              { name: "GSAP", sort: 2 },
              { name: "Framer Motion", sort: 3 },
              { name: "Lottie", sort: 4 },
              { name: "Anime.js", sort: 5 },
            ],
          },
          {
            name: "拖拽",
            sort: 8,
            children: [
              { name: "Sortable.js", sort: 1 },
              { name: "dnd-kit", sort: 2 },
            ],
          },
        ],
      },

      // ----- 11. 工程化与自动化 -----
      // 🔒 2026-07-04 选型调研定案扩章（npm 下载量 + 全站去重核查）：
      //   DevOps 补「CI/CD 核心机制」概念地基；容器单叶→拆组(Docker/Compose/K8s/Podman)；
      //   Monorepo 补 Nx/Rush；新增三组：版本发布自动化 / 依赖更新自动化 / 基础设施即代码(IaC)。
      //   排除项：Vercel/Netlify→云服务章；pnpm/yarn→包管理器章；Vite/ESLint→各专章；可观测性另开独立章。
      {
        name: "工程化与自动化",
        sort: 11,
        children: [
          {
            name: "DevOps",
            sort: 1,
            children: [
              // 🆕 工具无关的 CI/CD 理论地基（pipeline/stage/job/runner/cache/matrix/artifact/secrets/OIDC），
              //   补齐 DevOps 只有具体工具、缺基础层的问题
              { name: "CI/CD 核心机制", sort: 1 },
              { name: "GitHub Actions", sort: 2 },
              { name: "GitLab CI/CD", sort: 3 },
              { name: "Jenkins", sort: 4 },
              { name: "Husky", sort: 5 },
              { name: "lint-staged", sort: 6 },
            ],
          },
          // 2026-06 裁撤「依赖管理器」节(pnpm（工程）/Yarn/Bit)：pnpm 与 Web进阶「包管理器」重复，
          // Yarn 已归位到 JS 四大包管理器；Bit 体量小不立叶。工程化组语义更聚焦 CI/容器/Monorepo。
          // 🚨 2026-07-04 prod 移动坑：本节原为单叶「容器（Docker）」（0 题空节点），现拆成「容器」父组 + Docker 子叶。
          //   import 只增不删——下次 import:content:prod 前须先删 prod 里旧的单叶「容器（Docker）」
          //   （key=<工程化与自动化 id>:<同 id>:容器（Docker）），否则残留孤儿。详见 content-deploy-workflow「分类移动坑」。
          {
            name: "容器",
            sort: 2,
            children: [
              { name: "Docker", sort: 1 },
              { name: "Docker Compose", sort: 2 },
              // 2026-07-04 定案拆分：容器化(Docker/Compose)→本组；编排/运行时(Kubernetes/Podman)→
              //   「基础设施与数据流·容器编排」（该章纯 sidebar 规划、暂不产出）。故本组不含 K8s/Podman。
            ],
          },
          {
            name: "Monorepo",
            sort: 3,
            children: [
              { name: "Lerna", sort: 1 },
              { name: "Turborepo", sort: 2 },
              { name: "Nx", sort: 3 }, // 9.2M/wk，Monorepo 三巨头补齐（Lerna 现已并入 Nx 维护）
              { name: "Rush", sort: 4 }, // 989k/wk，微软企业级 monorepo
            ],
          },
          // 🆕 版本发布自动化（原全站零覆盖）：conventional-commits → 自动 version/changelog/publish
          {
            name: "版本发布自动化",
            sort: 4,
            children: [
              { name: "Changesets", sort: 1 }, // 3.2M/wk，monorepo 原生（本站 pnpm monorepo 首选）
              { name: "semantic-release", sort: 2 }, // 2.56M/wk，单包自动发布经典
              { name: "release-please", sort: 3 }, // Google，GitHub-native（release PR）
            ],
          },
          // 🆕 依赖更新自动化：自动开 PR 升级依赖
          {
            name: "依赖更新自动化",
            sort: 5,
            children: [
              { name: "Renovate", sort: 1 },
              { name: "Dependabot", sort: 2 },
            ],
          },
          // 🆕 基础设施即代码（IaC）：声明式(Terraform/OpenTofu) + 编程式(Pulumi，可用 TS) + 配置管理(Ansible)
          {
            name: "基础设施即代码（IaC）",
            sort: 6,
            children: [
              { name: "Terraform", sort: 1 },
              { name: "OpenTofu", sort: 2 }, // Terraform 许可证变更后的社区开源 fork
              { name: "Pulumi", sort: 3 },
              { name: "Ansible", sort: 4 },
            ],
          },
        ],
      },

      // ----- 12. 安全 -----
      {
        name: "安全",
        sort: 12,
        children: [
          {
            // 2026-07-21 选型评估：单叶保持（6 种攻击合一叶，不拆碎叶）
            name: "攻击方式",
            sort: 1,
          },
          {
            name: "加密",
            sort: 2,
          },
          {
            name: "认证与授权",
            sort: 3,
            children: [
              { name: "OAuth 2.0", sort: 1 },
              { name: "JWT", sort: 2 },
              { name: "SAML", sort: 3 },
            ],
          },
          {
            name: "安全框架",
            sort: 4,
            children: [
              {
                name: "OWASP Top 10 与前端防护（CSP / HTTP 安全头 / Helmet / CORS）",
                sort: 1,
              },
              { name: "供应链安全", sort: 2 },
            ],
          },
          { name: "漏洞扫描", sort: 5 },
        ],
      },

      // ----- 13. 云服务 -----
      {
        name: "云服务",
        sort: 13,
        children: [
          {
            name: "静态网站托管",
            sort: 1,
            children: [
              { name: "Netlify", sort: 1 },
              { name: "Vercel", sort: 2 },
              { name: "Cloudflare Pages", sort: 3 },
            ],
          },
          {
            name: "通用云服务",
            sort: 2,
            children: [
              { name: "阿里云", sort: 1 },
              { name: "Firebase", sort: 2 },
              { name: "AWS", sort: 3 },
            ],
          },
        ],
      },

      // ----- 14. 后端框架 -----
      {
        name: "后端框架",
        sort: 14,
        children: [
          {
            name: "基础框架",
            sort: 1,
            children: [
              { name: "Node.js", sort: 1 },
              { name: "Deno", sort: 2 },
              { name: "Bun", sort: 3 },
            ],
          },
          {
            name: "应用框架",
            sort: 2,
            children: [
              { name: "Express", sort: 1 },
              { name: "Fastify", sort: 2 },
              { name: "Hono", sort: 3 },
            ],
          },
          {
            name: "ORM框架",
            sort: 3,
            children: [
              { name: "TypeORM", sort: 1 },
              { name: "Prisma", sort: 2 },
            ],
          },
        ],
      },

      // ----- 15. 服务器基础知识 -----
      {
        name: "服务器基础知识",
        sort: 15,
        children: [
          {
            name: "基础工具",
            sort: 1,
            children: [
              {
                name: "Shells",
                sort: 1,
                children: [
                  { name: "Bash", sort: 1 },
                  { name: "Zsh", sort: 2 },
                  { name: "PowerShell", sort: 3 },
                ],
              },
              {
                name: "基础命令（文件系统 / 进程管理 / 文本编辑器 / 网络工具 / 系统管理工具）",
                sort: 2,
              },
              {
                name: "SSH 工具",
                sort: 3,
                children: [
                  { name: "OpenSSH", sort: 1 },
                  { name: "OpenSSL", sort: 2 },
                ],
              },
            ],
          },
          {
            name: "Web服务器",
            sort: 2,
            children: [
              { name: "Caddy", sort: 1 },
              { name: "Nginx", sort: 2 },
            ],
          },
        ],
      },

      // ----- 16. 进阶语言 -----
      {
        name: "进阶语言",
        sort: 16,
        children: [
          { name: "系统编程语言（Rust）", sort: 1 },
          { name: "通用编程语言", sort: 2 },
        ],
      },

      // ----- 17. AI 基础 -----
      // 2026-07-28 AI 章扩容：机器学习/深度学习的算法与架构概念叶（讲原理），与
      // 「AI 框架与库」（讲工具 API）、「大语言模型与生成式 AI」（讲应用）形成认知递进。
      {
        name: "AI 基础",
        sort: 17,
        children: [
          {
            name: "机器学习基础",
            sort: 1,
            children: [
              { name: "监督学习", sort: 1 },
              { name: "无监督学习", sort: 2 },
              { name: "强化学习", sort: 3 },
              { name: "AutoML", sort: 4 },
              { name: "集成学习与树模型", sort: 5 },
              { name: "特征工程", sort: 6 },
            ],
          },
          {
            name: "深度学习基础",
            sort: 2,
            children: [
              { name: "神经网络", sort: 1 },
              { name: "卷积神经网络（CNN）", sort: 2 },
              { name: "循环神经网络（RNN）", sort: 3 },
              { name: "Transformer", sort: 4 },
              { name: "生成对抗网络（GAN）", sort: 5 },
              { name: "扩散模型", sort: 6 },
            ],
          },
        ],
      },

      // ----- 18. AI 框架与库 -----
      // 2026-07-28 AI 章扩容：训练/推理侧的具体工具库。与「AI 基础」（概念）互补：
      // 基础章讲为什么，本章讲怎么用（API/工程实践）。
      {
        name: "AI 框架与库",
        sort: 18,
        children: [
          {
            name: "通用机器学习框架",
            sort: 1,
            children: [
              { name: "PyTorch 基础", sort: 1 },
              { name: "PyTorch 分布式训练", sort: 2 },
              { name: "TensorFlow", sort: 3 },
              { name: "Keras", sort: 4 },
              { name: "scikit-learn", sort: 5 },
              { name: "JAX", sort: 6 },
              { name: "PaddlePaddle", sort: 7 },
              { name: "MindSpore", sort: 8 },
              { name: "ONNX", sort: 9 },
            ],
          },
          {
            name: "计算机视觉",
            sort: 2,
            children: [
              { name: "OpenCV", sort: 1 },
              { name: "Ultralytics YOLO", sort: 2 },
              { name: "MediaPipe", sort: 3 },
              { name: "OpenMMLab", sort: 4 },
              { name: "timm", sort: 5 },
              { name: "Albumentations", sort: 6 },
            ],
          },
          {
            name: "自然语言处理",
            sort: 3,
            children: [
              { name: "Hugging Face Transformers", sort: 1 },
              { name: "Hugging Face PEFT 与 TRL", sort: 2 },
              { name: "Hugging Face Datasets 与 Tokenizers", sort: 3 },
              { name: "spaCy", sort: 4 },
              { name: "NLTK", sort: 5 },
              { name: "Gensim", sort: 6 },
            ],
          },
        ],
      },

      // ----- 19. 大语言模型与生成式 AI -----
      {
        name: "大语言模型与生成式 AI",
        sort: 19,
        children: [
          {
            name: "模型",
            sort: 1,
            children: [
              { name: "GPT", sort: 1 },
              { name: "Gemini", sort: 2 },
              { name: "Claude", sort: 3 },
              { name: "Grok", sort: 4 },
              { name: "GLM", sort: 5 },
              { name: "DeepSeek", sort: 6 },
              { name: "Qwen", sort: 7 },
              { name: "MiniMax", sort: 8 },
              { name: "Kimi", sort: 9 },
              { name: "Llama", sort: 10 },
            ],
          },
          {
            name: "Agent",
            sort: 2,
            children: [
              { name: "Pi", sort: 1 },
              { name: "Claude Code", sort: 2 },
              { name: "Codex", sort: 3 },
              { name: "Gemini CLI", sort: 4 },
              { name: "OpenCode", sort: 5 },
            ],
          },
          {
            // 2026-06-17 选型调研新增子组：AI 应用生成器（prompt-to-app / vibe coding）。
            // bolt.new（StackBlitz 出品，复用自家 WebContainers 浏览器内跑 Node）、v0（Vercel
            // 旗舰，agentic 全栈生成 + 一键部署 Vercel）、Lovable（2025-12 估值 $6.6B、$200M ARR）
            // 三家均「自然语言 → 可运行全栈应用」，受众含大量非编码者，是区别于 Agent（改你
            // 代码库的 coding agent）与「前端开发工具 > 在线编辑器」（手写代码的浏览器内 playground）
            // 的新物种。边界互斥：凡主轴是「自然语言生成应用」的归此组，不入在线编辑器章。
            // 2026-06-18 Replit Agent 立叶（sort 4）：Replit 已整体转型 AI 应用生成（Agent 4，
            // 人在回路 + 并行 agent/kanban），执行在服务端 Docker+Nix 容器（非浏览器 WASM），同属此组。
            name: "AI 应用生成器",
            sort: 3,
            children: [
              { name: "bolt.new", sort: 1 },
              { name: "v0", sort: 2 },
              { name: "Lovable", sort: 3 },
              { name: "Replit Agent", sort: 4 },
            ],
          },
          {
            name: "编排工具",
            sort: 4,
            children: [
              { name: "Dify", sort: 1 },
              { name: "n8n", sort: 2 },
              { name: "ComfyUI", sort: 3 },
            ],
          },
          {
            name: "其他工具",
            sort: 5,
            children: [
              { name: "RAG", sort: 1 },
              { name: "LangChain", sort: 2 },
              { name: "OpenRouter", sort: 3 },
              { name: "NotebookLM", sort: 4 },
              // 2026-07-28 AI 章调研扩容：下列为 RAG 流程的存储/编码组件、LLM 应用 SDK、
              // 安全合规与检索增强等新物种，与 RAG（流程）同级互为兄弟叶。
              { name: "向量数据库", sort: 5 },
              { name: "嵌入模型", sort: 6 },
              { name: "AI 网关", sort: 7 },
              { name: "Vercel AI SDK", sort: 8 },
              { name: "AI 内容审核", sort: 9 },
              { name: "AI 搜索 API", sort: 10 },
              { name: "Perplexity API", sort: 11 },
            ],
          },
          {
            name: "提示词工程",
            sort: 6,
            children: [
              { name: "基础提示设计", sort: 1 },
              { name: "高级提示技巧", sort: 2 },
              // 2026-07-28 提示词工程扩容：从「内容设计」延伸到「工程化管理」。
              // 基础/高级讲怎么写好提示词；下列两叶讲版本/评测/监控/红队。
              { name: "LLM 可观测与评测", sort: 3 },
              { name: "LLM 测试与红队", sort: 4 },
            ],
          },
          {
            name: "MCP",
            sort: 7,
            children: [
              {
                name: "MCP 协议基础（Transport / Resource / Tool / Prompt / Sampling）",
                sort: 1,
              },
              { name: "常用 MCP Server 集成", sort: 2 },
            ],
          },
          {
            name: "Skills",
            sort: 8,
            children: [
              {
                name: "规范、发现与创作",
                sort: 1,
                children: [
                  { name: "Agent Skills 规范与生态", sort: 1 },
                  { name: "Skills CLI 与 find-skills", sort: 2 },
                  { name: "Anthropic Skills", sort: 3 },
                  { name: "Skill Creator 与 Skill 评测", sort: 4 },
                ],
              },
              {
                name: "工程方法与上下文管理",
                sort: 2,
                children: [
                  { name: "Superpowers", sort: 1 },
                  { name: "Everything Claude Code", sort: 2 },
                  { name: "Grill Me", sort: 3 },
                  { name: "Grill With Docs", sort: 4 },
                  { name: "gstack", sort: 5 },
                  { name: "Compound Engineering", sort: 6 },
                  { name: "GSD Core", sort: 7 },
                  { name: "Addy Osmani Agent Skills", sort: 8 },
                  { name: "BMAD Method", sort: 9 },
                  { name: "Caveman", sort: 10 },
                ],
              },
              {
                name: "框架与应用开发",
                sort: 3,
                children: [
                  {
                    name: "Web 框架与元框架",
                    sort: 1,
                    children: [
                      { name: "Vercel Agent Skills", sort: 1 },
                      { name: "Next.js Workflow Skills", sort: 2 },
                      { name: "Vue Skills", sort: 3 },
                      { name: "Antfu Skills", sort: 4 },
                      { name: "Nuxt Skills", sort: 5 },
                      { name: "Angular Developer Skill", sort: 6 },
                      { name: "Svelte AI Tools", sort: 7 },
                    ],
                  },
                  {
                    name: "路由、状态与数据流",
                    sort: 2,
                    children: [
                      { name: "React Router Skill", sort: 1 },
                      { name: "TanStack Router & Start Skills", sort: 2 },
                      { name: "Redux Toolkit Skills", sort: 3 },
                    ],
                  },
                  {
                    name: "组件系统",
                    sort: 3,
                    children: [
                      { name: "shadcn Skill", sort: 1 },
                      { name: "Nuxt UI Skill", sort: 2 },
                    ],
                  },
                  {
                    name: "应用服务集成",
                    sort: 4,
                    children: [
                      { name: "Better Auth Skills", sort: 1 },
                      { name: "Stripe Skills", sort: 2 },
                    ],
                  },
                  {
                    name: "移动与跨端",
                    sort: 5,
                    children: [
                      { name: "Expo Skills", sort: 1 },
                      { name: "Callstack React Native Skills", sort: 2 },
                      { name: "Software Mansion Skills", sort: 3 },
                      { name: "Flutter Agent Plugins", sort: 4 },
                    ],
                  },
                  {
                    name: "后端框架与运行时",
                    sort: 6,
                    children: [
                      { name: "Matteo Collina Node.js Skills", sort: 1 },
                      { name: "NestJS Best Practices", sort: 2 },
                      { name: "Deno Skills", sort: 3 },
                    ],
                  },
                  {
                    name: "AI 应用开发",
                    sort: 7,
                    children: [
                      { name: "Vercel AI SDK Skills", sort: 1 },
                      { name: "Mastra Skills", sort: 2 },
                      { name: "LangChain & LangGraph Skills", sort: 3 },
                      { name: "CopilotKit Skills", sort: 4 },
                      { name: "assistant-ui Skills", sort: 5 },
                    ],
                  },
                ],
              },
              {
                name: "数据库与数据工程",
                sort: 4,
                children: [
                  { name: "Supabase Agent Skills", sort: 1 },
                  { name: "Firebase Agent Skills", sort: 2 },
                  { name: "Prisma Skills", sort: 3 },
                  { name: "dbt Agent Skills", sort: 4 },
                  { name: "ClickHouse Agent Skills", sort: 5 },
                  { name: "DuckDB Skills", sort: 6 },
                ],
              },
              {
                name: "云原生、DevOps 与可观测性",
                sort: 5,
                children: [
                  { name: "Azure Skills Plugin", sort: 1 },
                  { name: "AWS Agent Toolkit", sort: 2 },
                  { name: "Cloudflare Skills", sort: 3 },
                  { name: "HashiCorp Agent Skills", sort: 4 },
                  { name: "可观测性 Skills", sort: 5 },
                ],
              },
              {
                name: "设计、Web 质量与多媒体",
                sort: 6,
                children: [
                  { name: "Impeccable", sort: 1 },
                  { name: "Web Quality Skills", sort: 2 },
                  { name: "Remotion Skills", sort: 3 },
                  { name: "HyperFrames", sort: 4 },
                ],
              },
              {
                name: "浏览器、测试与检索自动化",
                sort: 7,
                children: [
                  { name: "Agent Browser", sort: 1 },
                  { name: "Playwright CLI", sort: 2 },
                  { name: "Browser Use", sort: 3 },
                  { name: "Firecrawl CLI", sort: 4 },
                ],
              },
              {
                name: "安全审计与供应链治理",
                sort: 8,
                children: [
                  { name: "Skill 安全与供应链治理", sort: 1 },
                  { name: "Trail of Bits Skills", sort: 2 },
                ],
              },
              {
                name: "AI / ML 与科研工作流",
                sort: 9,
                children: [
                  { name: "Hugging Face Skills", sort: 1 },
                  { name: "Gemini Skills", sort: 2 },
                  { name: "Google DeepMind Science Skills", sort: 3 },
                  { name: "AI 论文复现 Skills", sort: 4 },
                ],
              },
              {
                name: "文档、办公与业务工作流",
                sort: 10,
                children: [
                  { name: "Anthropic Knowledge Work Plugins", sort: 1 },
                  { name: "Google Workspace CLI Skills", sort: 2 },
                  { name: "Lark / 飞书 CLI Skills", sort: 3 },
                  { name: "Marketing Skills", sort: 4 },
                ],
              },
            ],
          },
          {
            // 2026-06-18 新建子组：AI 辅助开发工具（给 coding agent 当安全网 / 提供修复 skill 的新物种）。
            // react-doctor（Million.js 团队，React 代码体检 CLI，0-100 健康分 + 60+ 规则覆盖性能/架构/安全/a11y）：
            // React 专属 + 功能与 ESLint/Knip 重叠，但定位是 AI 辅助开发，故归本 AI 章而非「静态分析工具」。内容待产。
            name: "AI 辅助开发工具",
            sort: 9,
            children: [{ name: "react-doctor", sort: 1 }],
          },
          {
            // 2026-06-18 新建子组：AI 设计（prompt/截图 → UI 设计稿/可导 Figma，产出设计而非可运行 app）。
            // 从「其他工具」迁出 Stitch（Google AI UI 设计）、Claude Design；与 AI 应用生成器（出可运行全栈 app）区分。
            name: "AI 设计",
            sort: 10,
            children: [
              { name: "Stitch", sort: 1 },
              { name: "Claude Design", sort: 2 },
            ],
          },
        ],
      },

      // ----- 20. AI 开发工具与平台 -----
      // 2026-07-28 AI 章扩容：模型生命周期工具链（开发→训练→推理→服务化），是基础设施/
      // 平台层，区别于「大语言模型与生成式 AI」的应用/编排层（Dify/n8n/Agent 等）。
      {
        name: "AI 开发工具与平台",
        sort: 20,
        children: [
          {
            name: "开发环境与社区平台",
            sort: 1,
            children: [
              { name: "Jupyter Notebook", sort: 1 },
              { name: "Google Colab", sort: 2 },
              { name: "Hugging Face 平台", sort: 3 },
            ],
          },
          {
            name: "训练平台与实验追踪",
            sort: 2,
            children: [
              { name: "AWS SageMaker", sort: 1 },
              { name: "MLflow", sort: 2 },
              { name: "Weights & Biases", sort: 3 },
              { name: "DVC", sort: 4 },
            ],
          },
          {
            name: "LLM 推理引擎",
            sort: 3,
            children: [
              { name: "vLLM", sort: 1 },
              { name: "Ollama", sort: 2 },
            ],
          },
          {
            name: "模型服务化与托管",
            sort: 4,
            children: [
              { name: "FastAPI 模型服务化", sort: 1 },
              { name: "Gradio", sort: 2 },
              { name: "NVIDIA Triton", sort: 3 },
              { name: "BentoML", sort: 4 },
              { name: "Serverless GPU 平台", sort: 5 },
            ],
          },
        ],
      },

      // ----- 21. AI 在全栈中的应用 -----
      // 2026-07-28 AI 章扩容：AI 落地全栈的具体场景型技术叶。区别于上层应用编排
      // （第 19 章的 Agent/RAG），本章聚焦"AI 用在前/后端/研发流程某环节"的实打实技术。
      {
        name: "AI 在全栈中的应用",
        sort: 21,
        children: [
          {
            name: "前端智能",
            sort: 1,
            children: [{ name: "Web Speech API", sort: 1 }],
          },
          {
            name: "后端智能",
            sort: 2,
            children: [{ name: "推荐系统", sort: 1 }],
          },
          {
            name: "自动化与优化",
            sort: 3,
            children: [
              { name: "代码生成（Copilot-like）", sort: 1 },
              { name: "AI 测试用例生成", sort: 2 },
            ],
          },
        ],
      },

      // ----- 22. 软技能 -----
      // 2026-07-29 调研定稿：7 合并叶 → 16 独立叶。全量增量（0 题基线，无迁移坑）。
      // 软件工程：价值观伞(Agile) + 正交实现(Scrum/Kanban) + 哲学(Lean/OKR) 分层
      // 技术社区/代码仓库：具名平台各成叶（符合 L13 重构原则）
      // 项目管理工具：移除 BitBucket（归代码仓库），新增 Linear（2026 主流）
      // 即时通讯：新增飞书/钉钉（国内事实标准）
      {
        name: "软技能",
        sort: 22,
        children: [
          {
            name: "软件工程",
            sort: 1,
            children: [
              { name: "敏捷开发", sort: 1 },
              { name: "Scrum", sort: 2 },
              { name: "看板方法（Kanban）", sort: 3 },
              { name: "精益开发与目标管理", sort: 4 },
            ],
          },
          {
            name: "开源分享",
            sort: 2,
            children: [
              {
                name: "技术社区",
                sort: 1,
                children: [
                  { name: "Medium", sort: 1 },
                  { name: "dev.to", sort: 2 },
                  { name: "Stack Overflow", sort: 3 },
                  { name: "掘金", sort: 4 },
                  { name: "简书", sort: 5 },
                ],
              },
              {
                name: "代码仓库",
                sort: 2,
                children: [
                  { name: "GitHub", sort: 1 },
                  { name: "GitLab", sort: 2 },
                  { name: "Gitee", sort: 3 },
                ],
              },
            ],
          },
          {
            name: "团队协作",
            sort: 3,
            children: [
              { name: "项目管理工具（Jira / Trello / Linear）", sort: 1 },
              {
                name: "即时通讯与协作工具（Slack / Discord / 飞书 / 钉钉）",
                sort: 2,
              },
              { name: "沟通技巧", sort: 3 },
              { name: "技术写作", sort: 4 },
            ],
          },
        ],
      },
    ],
  },

  // =============================================
  // 维度二：难度
  // =============================================
  {
    name: "难度",
    sort: 2,
    categories: [
      { name: "入门", sort: 1 },
      { name: "初级", sort: 2 },
      { name: "中级", sort: 3 },
      { name: "高级", sort: 4 },
      { name: "专家", sort: 5 },
    ],
  },
];
