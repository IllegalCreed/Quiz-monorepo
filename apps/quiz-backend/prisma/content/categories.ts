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
                  { name: "网络层及以下（ICMP / ARP / DNS）", sort: 1 },
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
                name: "CSS预处理（Sass / Less / PostCSS / Tailwind CSS / UnoCSS）",
                sort: 3,
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
              { name: "框架级（pnpm / NPM / pip3 / Cargo）", sort: 2 },
            ],
          },
          {
            name: "JS扩展库（Lodash-es / Day.js / uuid / axios / i18next / crypto.js）",
            sort: 5,
          },
        ],
      },
      {
        name: "前端框架",
        sort: 3,
        children: [
          {
            name: "UI框架（React / Vue / Angular / Solid / Svelte / Preact）",
            sort: 1,
          },
          {
            name: "元框架（Next.js / Nuxt.js / Astro / Qwik / Remix / SolidStart / SvelteKit）",
            sort: 2,
          },
          { name: "静态网站框架（Docusaurus / VitePress / Slidev）", sort: 3 },
          {
            name: "组件库（Element Plus / Vuetify / Vant UI / Ant Design / Nuxt UI / shadcn）",
            sort: 4,
          },
          { name: "状态库（Pinia / Zustand / Redux）", sort: 5 },
          {
            name: "路由库（Vue Router / React Router / React Navigation）",
            sort: 6,
          },
          {
            name: "复用库（VueUse / VueHooks Plus / Ahooks / React Use）",
            sort: 7,
          },
          {
            name: "其他（Iconify / Shiki / Markdown-it / TanStack Query / Vee-validate / Vue-i18n）",
            sort: 8,
          },
        ],
      },
      {
        name: "前端基础工具链",
        sort: 4,
        children: [
          { name: "构建工具（Vite / Webpack / Turbopack）", sort: 1 },
          { name: "编译器（Babel / SWC / tsc）", sort: 2 },
          { name: "打包工具（esBuild / rollup / rolldown / rspack）", sort: 3 },
          { name: "开发服务器（Live Server / BrowserSync）", sort: 4 },
        ],
      },
      {
        name: "前端开发工具",
        sort: 5,
        children: [
          { name: "IDE（VScode / WebStorm）", sort: 1 },
          { name: "版本控制（Git）", sort: 2 },
          {
            name: "静态分析工具（ESLint / Prettier / Biome / StyleLint / EditorConfig）",
            sort: 3,
          },
          { name: "在线编辑器（StackBlitz / CodeSandbox / Expo）", sort: 4 },
          { name: "文档生成器（JSdoc / TypeDoc / TSDoc / SassDoc）", sort: 5 },
        ],
      },
      {
        name: "前端测试",
        sort: 6,
        children: [
          {
            name: "单元测试（Jest / Vitest / VueTestUtils / Axios Mock Adapter / MSW / Testing Library / Vue Router Mock）",
            sort: 1,
          },
          { name: "端到端测试（Cypress / Playwright）", sort: 2 },
          { name: "其他工具（Mailtrap）", sort: 3 },
        ],
      },
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
          { name: "微前端框架（qiankun / single spa）", sort: 3 },
        ],
      },
      {
        name: "移动/桌面开发",
        sort: 9,
        children: [
          {
            name: "移动端框架（React Native / Flutter / 微信小程序 / Uniapp / Ionic）",
            sort: 1,
          },
          { name: "桌面端框架（Electron / Tauri）", sort: 2 },
        ],
      },
      {
        name: "前端可视化",
        sort: 10,
        children: [
          {
            name: "图表（ECharts / D3.js / Chart.js / Recharts / leaflet / Mermaid / KaTeX）",
            sort: 1,
          },
          {
            name: "三维（WebGL / Three.js / Babylon / CesiumJS / ArcGIS API for JavaScript）",
            sort: 2,
          },
          {
            name: "动画（Lottie / Popmotion / Framer Motion / GSAP / Anime.js / Animate.css）",
            sort: 3,
          },
          {
            name: "拖拽（Grid Layout Plus / Vue Draggable Plus / React DnD / Interact.js / Sortable.js / Draggable.js / Hammer.js / @use-gesture）",
            sort: 4,
          },
        ],
      },
      {
        name: "工程化与自动化",
        sort: 11,
        children: [
          {
            name: "DevOps（GitHub Actions / GitLab CI/CD / Jenkins / Husky / lint-staged）",
            sort: 1,
          },
          { name: "依赖管理器（Pnpm / Yarn / Bit）", sort: 2 },
          { name: "容器（Docker）", sort: 3 },
          { name: "Monorepo（Lerna / Turborepo）", sort: 4 },
        ],
      },
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
          { name: "认证与授权（OAuth 2.0 / JWT / SAML / 哈希算法）", sort: 3 },
          {
            name: "安全框架（OWASP / Helmet.js / CORS / HTTP安全头）",
            sort: 4,
          },
          { name: "漏洞扫描（ZAP / Burp Suite / Nessus / Nmap）", sort: 5 },
        ],
      },
      {
        name: "云服务",
        sort: 13,
        children: [
          {
            name: "静态网站托管（Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render）",
            sort: 1,
          },
          {
            name: "通用云服务（阿里云 / Firebase / Azure / Netlify / Vercel / Cloudflare / AWS）",
            sort: 2,
          },
        ],
      },
      {
        name: "后端框架",
        sort: 14,
        children: [
          { name: "基础框架（Node.js / Deno / Bun）", sort: 1 },
          { name: "应用框架（Express / Fastify / Hono）", sort: 2 },
          { name: "ORM框架（TypeORM / Prisma）", sort: 3 },
        ],
      },
      {
        name: "服务器基础知识",
        sort: 15,
        children: [
          {
            name: "基础工具",
            sort: 1,
            children: [
              { name: "Shells（Bash / Zsh / powerShell）", sort: 1 },
              {
                name: "基础命令（文件系统 / 进程管理 / 文本编辑器 / 网络工具 / 系统管理工具）",
                sort: 2,
              },
              { name: "SSH 工具（OpenSSH / OpenSSL）", sort: 3 },
            ],
          },
          { name: "Web服务器（Caddy / Nginx）", sort: 2 },
        ],
      },
      {
        name: "进阶语言",
        sort: 16,
        children: [
          { name: "系统编程语言（Rust）", sort: 1 },
          { name: "通用编程语言", sort: 2 },
        ],
      },
      {
        name: "软技能",
        sort: 17,
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
    ],
  },
];
