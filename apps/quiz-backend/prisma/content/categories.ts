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
              { name: "HTML", sort: 1 },
              { name: "JavaScript", sort: 2 },
              { name: "CSS", sort: 3 },
            ],
          },
          {
            name: "计算机网络基础",
            sort: 2,
            children: [
              {
                name: "网络模型",
                sort: 1,
                children: [
                  { name: "OSI 模型", sort: 1 },
                  { name: "TCP/IP 模型", sort: 2 },
                ],
              },
              {
                name: "网络协议",
                sort: 2,
                children: [
                  {
                    name: "网络层及以下（ICMP / ARP / DNS）",
                    sort: 1,
                  },
                  {
                    name: "应用层（HTTP/HTTPS / WebSocket / SSL/TLS）",
                    sort: 2,
                  },
                ],
              },
              {
                name: "网络设备（路由器 / 交换机 / 网关 / 移动网络）",
                sort: 3,
              },
            ],
          },
          {
            name: "浏览器基础",
            sort: 3,
            children: [
              { name: "浏览器渲染原理", sort: 1 },
              { name: "浏览器缓存机制", sort: 2 },
              { name: "浏览器安全", sort: 3 },
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
              { name: "TypeScript", sort: 2 },
              {
                name: "CSS预处理",
                sort: 3,
                children: [
                  { name: "Sass", sort: 1 },
                  { name: "Less", sort: 2 },
                  { name: "PostCSS", sort: 3 },
                  { name: "Tailwind CSS", sort: 4 },
                  { name: "UnoCSS", sort: 5 },
                ],
              },
              { name: "JSON", sort: 4 },
              { name: "YAML", sort: 5 },
            ],
          },
          {
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
            name: "浏览器工具（Chrome DevTools / Firefox Developer Tools / React DevTools / Vue DevTools）",
            sort: 1,
          },
          {
            name: "性能优化（异步组件 / 按需引入 / 虚拟化 / 事件及属性优化 / 性能评估）",
            sort: 2,
          },
          { name: "代码优化（代码分割 / Tree Shaking）", sort: 3 },
          { name: "网络优化（CDN / 缓存 / 压缩）", sort: 4 },
          {
            name: "用户体验优化（懒加载和预加载 / 交互优化 / 可访问性）",
            sort: 5,
          },
          { name: "搜索引擎优化", sort: 6 },
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
              { name: "架构模式（MVC / MVVM）", sort: 1 },
              {
                name: "创建型（工厂方法 / 抽象工厂 / 单例 / 建造者 / 原型）",
                sort: 2,
              },
              {
                name: "结构型（适配器 / 桥接 / 组合 / 装饰 / 外观 / 享元 / 代理）",
                sort: 3,
              },
              {
                name: "行为型（责任链 / 命令 / 迭代器 / 中介者 / 备忘录 / 观察者 / 状态 / 策略 / 模板方法 / 访问者）",
                sort: 4,
              },
            ],
          },
          {
            name: "组件设计（组件分类 / 设计原则 / Storybook / Styleguidist）",
            sort: 2,
          },
          {
            name: "微前端框架",
            sort: 3,
            children: [
              { name: "qiankun", sort: 1 },
              { name: "single-spa", sort: 2 },
            ],
          },
        ],
      },

      // ----- 9. 移动/桌面开发 -----
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
              { name: "微信小程序", sort: 3 },
              { name: "Uniapp", sort: 4 },
              { name: "Ionic", sort: 5 },
            ],
          },
          {
            name: "桌面端框架",
            sort: 2,
            children: [
              { name: "Electron", sort: 1 },
              { name: "Tauri", sort: 2 },
            ],
          },
        ],
      },

      // ----- 10. 前端可视化 -----
      {
        name: "前端可视化",
        sort: 10,
        children: [
          {
            name: "图表",
            sort: 1,
            children: [
              { name: "ECharts", sort: 1 },
              { name: "D3.js", sort: 2 },
              { name: "Chart.js", sort: 3 },
              { name: "Mermaid", sort: 4 },
            ],
          },
          {
            name: "三维",
            sort: 2,
            children: [
              { name: "WebGL", sort: 1 },
              { name: "Three.js", sort: 2 },
              { name: "Babylon.js", sort: 3 },
              { name: "CesiumJS", sort: 4 },
            ],
          },
          {
            name: "动画",
            sort: 3,
            children: [
              { name: "GSAP", sort: 1 },
              { name: "Framer Motion", sort: 2 },
              { name: "Lottie", sort: 3 },
            ],
          },
          {
            name: "拖拽",
            sort: 4,
            children: [{ name: "Sortable.js", sort: 1 }],
          },
        ],
      },

      // ----- 11. 工程化与自动化 -----
      {
        name: "工程化与自动化",
        sort: 11,
        children: [
          {
            name: "DevOps",
            sort: 1,
            children: [
              { name: "GitHub Actions", sort: 1 },
              { name: "GitLab CI/CD", sort: 2 },
              { name: "Jenkins", sort: 3 },
              { name: "Husky", sort: 4 },
              { name: "lint-staged", sort: 5 },
            ],
          },
          // 2026-06 裁撤「依赖管理器」节(pnpm（工程）/Yarn/Bit)：pnpm 与 Web进阶「包管理器」重复，
          // Yarn 已归位到 JS 四大包管理器；Bit 体量小不立叶。工程化组语义更聚焦 CI/容器/Monorepo。
          { name: "容器（Docker）", sort: 2 },
          {
            name: "Monorepo",
            sort: 3,
            children: [
              { name: "Lerna", sort: 1 },
              { name: "Turborepo", sort: 2 },
              // TODO（做本批时补）：Nx —— 2026-06 调研漏项，8.5M/wk · 28.8k★，
              // Monorepo 主流之一，体量不输 Turborepo，建议 sort: 3
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
            name: "攻击方式（XSS / CSRF / SQL 注入 / SSRF / DDoS / MITM）",
            sort: 1,
          },
          {
            name: "加密（对称加密和非对称加密 / 公钥基础设施 / Crypto.js / Web Crypto API）",
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
            children: [{ name: "Helmet.js", sort: 1 }],
          },
          { name: "漏洞扫描（ZAP / Burp Suite / Nessus / Nmap）", sort: 5 },
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

      // ----- 17. 大语言模型与生成式 AI -----
      {
        name: "大语言模型与生成式 AI",
        sort: 17,
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
            children: [{ name: "Dify", sort: 1 }],
          },
          {
            name: "其他工具",
            sort: 5,
            children: [
              { name: "RAG", sort: 1 },
              { name: "LangChain", sort: 2 },
              { name: "OpenRouter", sort: 3 },
              { name: "NotebookLM", sort: 4 },
            ],
          },
          {
            name: "提示词工程",
            sort: 6,
            children: [
              { name: "基础提示设计", sort: 1 },
              { name: "高级提示技巧", sort: 2 },
            ],
          },
          {
            name: "MCP",
            sort: 7,
            children: [
              { name: "Brave Search", sort: 1 },
              { name: "GitHub MCP", sort: 2 },
              { name: "Context7 MCP", sort: 3 },
              { name: "Playwright MCP", sort: 4 },
              { name: "Chrome DevTools MCP", sort: 5 },
              { name: "Figma MCP", sort: 6 },
              { name: "Blender MCP", sort: 7 },
              { name: "Notion MCP", sort: 8 },
              { name: "Sentry MCP", sort: 9 },
              { name: "Supabase MCP", sort: 10 },
            ],
          },
          {
            name: "Skills",
            sort: 8,
            children: [
              { name: "Superpowers", sort: 1 },
              { name: "Everything Claude Code", sort: 2 },
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

      // ----- 18. 软技能 -----
      {
        name: "软技能",
        sort: 18,
        children: [
          { name: "软件工程（敏捷开发 / Scrum）", sort: 1 },
          {
            name: "开源分享",
            sort: 2,
            children: [
              {
                name: "技术社区（Medium / dev.to / stackoverflow / 掘金 / 简书）",
                sort: 1,
              },
              { name: "代码仓库（Github / GitLab / Gitee）", sort: 2 },
            ],
          },
          {
            name: "团队协作",
            sort: 3,
            children: [
              { name: "团队协作工具（Jira / Trello / BitBucket）", sort: 1 },
              { name: "远程协作工具（Slack / Discord）", sort: 2 },
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
