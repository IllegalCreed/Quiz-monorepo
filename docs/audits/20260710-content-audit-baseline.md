# 三仓库内容审计 M0 基线

> 生成时间：2026-07-10T01:14:40.129Z
> 范围：本地文件只读；未连接数据库，未执行导入、清理或部署。
> Slidev 分数为自动启发式基线，仅用于安排人工审阅优先级。

## 仓库指纹

| 仓库      | 提交         | 生成时工作区改动数 |
| --------- | ------------ | -----------------: |
| Quiz      | cf5c124ed184 |                  0 |
| VitePress | 12e37dcf015b |                  0 |
| Slidev    | e23fb354b951 |                  0 |

## 总览

| 指标                       |        数量 |
| -------------------------- | ----------: |
| VitePress 技术节点         |         327 |
| VitePress 内容页           |        1716 |
| 缺失 / 位置异常速查        |    344 / 18 |
| Slidev 套件 / 页面         |  327 / 8852 |
| VitePress 已展示幻灯片链接 |         275 |
| 漏链但可发现 Slidev 包     |          52 |
| 无法找到 Slidev 包         |           0 |
| Quiz JSON / 题目           | 326 / 17787 |
| Quiz 本地错误 / 警告       |    0 / 2443 |
| Quiz 分类未匹配节点        |           1 |
| 孤立 Slidev 包 / Quiz JSON |       0 / 0 |

## 优先级

| 优先级 | 技术节点数 |
| ------ | ---------: |
| P0     |          1 |
| P1     |        264 |
| P2     |         61 |
| P3     |          1 |

优先级含义：P0 为映射或本地结构错误；P1 为速查缺失或 Slidev D；P2 为速查位置异常、Slidev C 或首页漏链；P3 为当前自动规则未发现阻断项。

## Slidev 初步等级

| 等级    | 套件数 |
| ------- | -----: |
| A       |      1 |
| B       |      3 |
| C       |    114 |
| D       |    209 |
| missing |      0 |

内部参考 `prettier-slide`：85 分 / A。自动基线已识别其分步代码、magic-move、布局多样性、讲稿和引用优势。

## Quiz 本地规则

| 规则                     | 命中数 |
| ------------------------ | -----: |
| missing-technical-prefix |   2443 |

当前 warning 需要按规则分层复核；它们不等同于事实错误。所有 error 才是本地结构阻断项。

## 分类未匹配

- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/index.md`：参数 `ai-时代如何测试`

## 幻灯片首页漏链

以下技术已有 Slidev 包，但 VitePress 首页尚未展示幻灯片链接：

- `src/zh/frontend-framework/components/angular-material/index.md` → `angular-material-slide`
- `src/zh/frontend-framework/components/ant-design/index.md` → `ant-design-slide`
- `src/zh/frontend-framework/components/arco-design-vue/index.md` → `arco-design-vue-slide`
- `src/zh/frontend-framework/components/chakra-ui/index.md` → `chakra-ui-slide`
- `src/zh/frontend-framework/components/element-plus/index.md` → `element-plus-slide`
- `src/zh/frontend-framework/components/headless-ui/index.md` → `headless-ui-slide`
- `src/zh/frontend-framework/components/mantine/index.md` → `mantine-slide`
- `src/zh/frontend-framework/components/mui/index.md` → `mui-slide`
- `src/zh/frontend-framework/components/naive-ui/index.md` → `naive-ui-slide`
- `src/zh/frontend-framework/components/ng-zorro/index.md` → `ng-zorro-slide`
- `src/zh/frontend-framework/components/nuxt-ui/index.md` → `nuxt-ui-slide`
- `src/zh/frontend-framework/components/prime-ng/index.md` → `prime-ng-slide`
- `src/zh/frontend-framework/components/prime-vue/index.md` → `prime-vue-slide`
- `src/zh/frontend-framework/components/radix-ui/index.md` → `radix-ui-slide`
- `src/zh/frontend-framework/components/shadcn/index.md` → `shadcn-slide`
- `src/zh/frontend-framework/components/vant-ui/index.md` → `vant-ui-slide`
- `src/zh/frontend-framework/components/vuetify/index.md` → `vuetify-slide`
- `src/zh/frontend-framework/composables/ahooks/index.md` → `ahooks-slide`
- `src/zh/frontend-framework/composables/react-use/index.md` → `react-use-slide`
- `src/zh/frontend-framework/composables/usehooks-ts/index.md` → `usehooks-ts-slide`
- `src/zh/frontend-framework/composables/vue-hooks-plus/index.md` → `vue-hooks-plus-slide`
- `src/zh/frontend-framework/composables/vueuse/index.md` → `vueuse-slide`
- `src/zh/frontend-framework/meta/analog/index.md` → `analog-slide`
- `src/zh/frontend-framework/meta/astro/index.md` → `astro-slide`
- `src/zh/frontend-framework/meta/next-js/index.md` → `next-js-slide`
- `src/zh/frontend-framework/meta/qwik/index.md` → `qwik-slide`
- `src/zh/frontend-framework/meta/react-router/index.md` → `react-router-slide`
- `src/zh/frontend-framework/meta/remix/index.md` → `remix-slide`
- `src/zh/frontend-framework/meta/solid-start/index.md` → `solid-start-slide`
- `src/zh/frontend-framework/meta/svelte-kit/index.md` → `svelte-kit-slide`
- `src/zh/frontend-framework/meta/tanstack-start/index.md` → `tanstack-start-slide`
- `src/zh/frontend-framework/others/iconify/index.md` → `iconify-slide`
- `src/zh/frontend-framework/others/markdown-it/index.md` → `markdown-it-slide`
- `src/zh/frontend-framework/others/shiki/index.md` → `shiki-slide`
- `src/zh/frontend-framework/others/tanstack-query/index.md` → `tanstack-query-slide`
- `src/zh/frontend-framework/router/react-navigation/index.md` → `react-navigation-slide`
- `src/zh/frontend-framework/router/tanstack-router/index.md` → `tanstack-router-slide`
- `src/zh/frontend-framework/router/vue-router/index.md` → `vue-router-slide`
- `src/zh/frontend-framework/ssg/docusaurus/index.md` → `docusaurus-slide`
- `src/zh/frontend-framework/ssg/eleventy/index.md` → `eleventy-slide`
- `src/zh/frontend-framework/ssg/hexo/index.md` → `hexo-slide`
- `src/zh/frontend-framework/ssg/nextra/index.md` → `nextra-slide`
- `src/zh/frontend-framework/ssg/slidev/index.md` → `slidev-slide`
- `src/zh/frontend-framework/ssg/starlight/index.md` → `starlight-slide`
- `src/zh/frontend-framework/ssg/vite-press/index.md` → `vitepress-slide`
- `src/zh/frontend-framework/state/jotai/index.md` → `jotai-slide`
- `src/zh/frontend-framework/state/mobx/index.md` → `mobx-slide`
- `src/zh/frontend-framework/state/ng-rx/index.md` → `ng-rx-slide`
- `src/zh/frontend-framework/state/pinia/index.md` → `pinia-slide`
- `src/zh/frontend-framework/state/redux/index.md` → `redux-slide`
- `src/zh/frontend-framework/state/zustand/index.md` → `zustand-slide`
- `src/zh/frontend-framework/ui/preact/index.md` → `preact-slide`

## 无法找到幻灯片包

_无_

## 孤立内容

Slidev：_无_

Quiz：_无_

未分配给技术节点的 VitePress 内容页：4。

## Slidev 优先人工审阅

| 技术                          | 套件                                | 分数 | 等级 | 风险信号                                                                                                         |
| ----------------------------- | ----------------------------------- | ---: | ---- | ---------------------------------------------------------------------------------------------------------------- |
| JavaScript 生成器与元编程     | js-generators-metaprogramming-slide |   34 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 自定义属性、函数与工程化  | css-variables-engineering-slide     |   36 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 类与面向对象       | js-classes-oop-slide                |   36 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Docker                        | docker-slide                        |   37 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| HTML 文档结构与元数据         | html-document-metadata-slide        |   38 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS Flexbox 弹性布局          | css-flexbox-slide                   |   39 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 颜色与背景                | css-color-background-slide          |   40 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS Grid 网格布局             | css-grid-slide                      |   40 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 文字排版与字体            | css-typography-slide                |   40 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 数组与可迭代协议   | js-arrays-iterables-slide           |   40 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 内建对象与数据结构 | js-builtins-structures-slide        |   40 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| React Router                  | react-router-slide                  |   41 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 异步编程           | js-async-slide                      |   42 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 语言基础与类型系统 | js-fundamentals-types-slide         |   42 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| React DevTools                | react-devtools-slide                |   42 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| Safari Web Inspector          | safari-web-inspector-slide          |   42 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| Nuxt                          | nuxt-slide                          |   42 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 过渡、动画与视觉          | css-animation-effects-slide         |   43 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 定位与层叠上下文          | css-positioning-slide               |   43 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| HTML 语义化与文档大纲         | html-semantics-slide                |   43 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 对象与原型继承     | js-objects-prototype-slide          |   43 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CI/CD 核心机制                | cicd-core-slide                     |   43 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| GitKraken                     | gitkraken-slide                     |   43 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| React                         | react-slide                         |   43 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| CSS 盒模型与尺寸              | css-box-sizing-slide                |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 响应式与现代查询          | css-responsive-queries-slide        |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| HTML 表格                     | html-tables-slide                   |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| JavaScript 函数与作用域       | js-functions-scope-slide            |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Terraform                     | terraform-slide                     |   44 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| TanStack Start                | tanstack-start-slide                |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Gemini                        | gemini-slide                        |   44 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| GPT                           | gpt-slide                           |   44 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| HTML 文本内容与超链接         | html-text-links-slide               |   45 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Puppeteer                     | puppeteer-slide                     |   45 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal                                       |
| SolidStart                    | solid-start-slide                   |   45 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Iconify                       | iconify-slide                       |   45 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| TanStack Router               | tanstack-router-slide               |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Lit                           | lit-slide                           |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Solid                         | solid-slide                         |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Claude Code                   | claude-code-slide                   |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Codex CLI                     | codex-slide                         |   45 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Gemini CLI                    | gemini-cli-slide                    |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| OpenCode                      | opencode-slide                      |   45 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Firefox Developer Tools       | firefox-devtools-slide              |   46 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| GitHub Desktop                | github-desktop-slide                |   46 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| Everything Claude Code（ECC） | everything-claude-code-slide        |   46 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Pi                            | pi-slide                            |   46 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| OpenRouter                    | open-router-slide                   |   46 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| CSS 选择器与层叠              | css-selectors-cascade-slide         |   47 | D    | layout-monotony, static-code-only, low-notes-coverage                                                            |
| Antigravity                   | antigravity-slide                   |   47 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| Windsurf                      | windsurf-slide                      |   47 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| usehooks-ts                   | usehooks-ts-slide                   |   47 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |
| Claude                        | claude-model-slide                  |   47 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage                   |
| Superpowers                   | superpowers-slide                   |   47 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Lynx                          | lynx-slide                          |   47 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| Selenium                      | selenium-slide                      |   48 | D    | layout-monotony, static-code-only, no-topic-visuals, no-interaction-signal                                       |
| Fork                          | fork-slide                          |   48 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| Sourcetree                    | sourcetree-slide                    |   48 | D    | layout-monotony, list-outline-run, no-topic-visuals, no-interaction-signal                                       |
| Qwik                          | qwik-slide                          |   48 | D    | layout-monotony, list-outline-run, static-code-only, no-topic-visuals, no-interaction-signal, low-notes-coverage |
| Remix                         | remix-slide                         |   48 | D    | layout-monotony, no-topic-visuals, no-interaction-signal                                                         |

## 下一检查点

1. 校准 VitePress 特殊页面速查范围并修复位置异常。
2. 以 Prettier 为内部参考，完成 TypeScript、JSON、Three.js 三套样板。
3. 样板验收后进入 VitePress 和 Slidev 分批治理。
