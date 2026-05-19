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
          { name: "模块管理（CommonJS / ES Module）", sort: 3 },
          {
            name: "包管理器",
            sort: 4,
            children: [
              {
                name: "系统级（Homebrew / apt-get / yum / Chocolatey）",
                sort: 1,
              },
              {
                name: "框架级",
                sort: 2,
                children: [
                  { name: "pnpm", sort: 1 },
                  { name: "NPM", sort: 2 },
                  { name: "pip3", sort: 3 },
                  { name: "Cargo", sort: 4 },
                ],
              },
            ],
          },
          {
            name: "JS扩展库",
            sort: 5,
            children: [
              { name: "Lodash-es", sort: 1 },
              { name: "Day.js", sort: 2 },
              { name: "axios", sort: 3 },
              { name: "i18next", sort: 4 },
              { name: "crypto.js", sort: 5 },
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
              { name: "Ant Design", sort: 4 },
              { name: "Nuxt UI", sort: 5 },
              { name: "shadcn", sort: 6 },
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
              { name: "React Router", sort: 2 },
              { name: "React Navigation", sort: 3 },
              { name: "TanStack Router", sort: 4 },
            ],
          },
          {
            name: "复用库",
            sort: 7,
            children: [
              { name: "VueUse", sort: 1 },
              { name: "Ahooks", sort: 2 },
            ],
          },
          {
            name: "其他",
            sort: 8,
            children: [
              { name: "Iconify", sort: 1 },
              { name: "Shiki", sort: 2 },
              { name: "TanStack Query", sort: 3 },
              { name: "Vee-validate", sort: 4 },
              { name: "Vue-i18n", sort: 5 },
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
            ],
          },
          { name: "开发服务器（Live Server / BrowserSync）", sort: 4 },
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
              { name: "WebStorm", sort: 2 },
            ],
          },
          { name: "版本控制（Git）", sort: 2 },
          {
            name: "静态分析工具",
            sort: 3,
            children: [
              { name: "ESLint", sort: 1 },
              { name: "Prettier", sort: 2 },
              { name: "Biome", sort: 3 },
              { name: "StyleLint", sort: 4 },
              { name: "EditorConfig", sort: 5 },
            ],
          },
          { name: "在线编辑器（StackBlitz / CodeSandbox / Expo）", sort: 4 },
          {
            name: "文档生成器",
            sort: 5,
            children: [
              { name: "JSDoc", sort: 1 },
              { name: "TypeDoc", sort: 2 },
            ],
          },
        ],
      },

      // ----- 6. 前端测试 -----
      {
        name: "前端测试",
        sort: 6,
        children: [
          {
            name: "单元测试",
            sort: 1,
            children: [
              { name: "Jest", sort: 1 },
              { name: "Vitest", sort: 2 },
              { name: "Vue Test Utils", sort: 3 },
              { name: "MSW", sort: 4 },
              { name: "Testing Library", sort: 5 },
            ],
          },
          {
            name: "端到端测试",
            sort: 2,
            children: [
              { name: "Cypress", sort: 1 },
              { name: "Playwright", sort: 2 },
            ],
          },
          { name: "其他工具（Mailtrap）", sort: 3 },
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
          {
            name: "依赖管理器",
            sort: 2,
            children: [
              { name: "pnpm（工程）", sort: 1 },
              { name: "Yarn", sort: 2 },
              { name: "Bit", sort: 3 },
            ],
          },
          { name: "容器（Docker）", sort: 3 },
          {
            name: "Monorepo",
            sort: 4,
            children: [
              { name: "Lerna", sort: 1 },
              { name: "Turborepo", sort: 2 },
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
            name: "编排工具",
            sort: 3,
            children: [{ name: "Dify", sort: 1 }],
          },
          {
            name: "其他工具",
            sort: 4,
            children: [
              { name: "RAG", sort: 1 },
              { name: "LangChain", sort: 2 },
              { name: "OpenRouter", sort: 3 },
              { name: "Stitch", sort: 4 },
              { name: "Claude Design", sort: 5 },
              { name: "NotebookLM", sort: 6 },
            ],
          },
          {
            name: "提示词工程",
            sort: 5,
            children: [
              { name: "基础提示设计", sort: 1 },
              { name: "高级提示技巧", sort: 2 },
            ],
          },
          {
            name: "MCP",
            sort: 6,
            children: [{ name: "Brave Search", sort: 1 }],
          },
          {
            name: "Skills",
            sort: 7,
            children: [
              { name: "Superpowers", sort: 1 },
              { name: "Everything Claude Code", sort: 2 },
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
