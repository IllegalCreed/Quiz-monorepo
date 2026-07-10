# VitePress 内容全量审计报告

> 生成时间：2026-07-10T03:15:50.635Z
> 审计仓库：`/Users/zhangxu/workspace/IllegalCreedWebsite`
> 规则口径：技术内容页应在标题和版本说明后紧跟 `## 速查`；`index.md` 概览页及明确登记的根级非技术页面除外。带 `## 文档地址` 或 `## 幻灯片地址` 的技术节点首页应带 `## 测试题`。

## 摘要

| 指标               | 数量 |
| ------------------ | ---: |
| Markdown 总数      | 2057 |
| index 概览页       |  341 |
| 内容页（需速查）   | 1712 |
| 非技术页（免速查） |    4 |
| 速查合规           | 1401 |
| 缺失速查           |  311 |
| 速查位置不合规     |    0 |
| 空速查             |    0 |
| 版本说明合规       | 1651 |
| 缺失版本说明块     |   31 |
| 版本说明未给出基线 |   30 |
| 技术节点首页       |  327 |
| 文档链接首页       |  327 |
| 幻灯片链接首页     |  275 |
| 应有测试题链接首页 |  327 |
| 已有测试题链接首页 |  327 |
| 缺失测试题链接首页 |    0 |
| 测试题链接格式异常 |    0 |

## 速查审计

### 免速查页面

| 文件                          | 原因                            |
| ----------------------------- | ------------------------------- |
| `src/zh/api-examples.md`      | VitePress 运行时 API 脚手架示例 |
| `src/zh/CV.md`                | 个人简历                        |
| `src/zh/markdown-examples.md` | VitePress Markdown 脚手架示例   |
| `src/zh/start.md`             | 站点使用说明                    |

| 目录                                           | 内容页 | 合规 | 缺失 | 位置不合规 | 空速查 |
| ---------------------------------------------- | ------ | ---- | ---- | ---------- | ------ |
| base/language                                  | 207    | 207  | 0    | 0          | 0      |
| frontend-develop-tools/testing                 | 133    | 133  | 0    | 0          | 0      |
| web-advanced/js-extension                      | 105    | 45   | 60   | 0          | 0      |
| web-advanced/language                          | 98     | 98   | 0    | 0          | 0      |
| base/network                                   | 88     | 88   | 0    | 0          | 0      |
| architecture/micro-frontend                    | 56     | 56   | 0    | 0          | 0      |
| frontend-develop-tools/static-analysis         | 56     | 56   | 0    | 0          | 0      |
| frontend-framework/components                  | 54     | 27   | 27   | 0          | 0      |
| frontend-framework/document                    | 50     | 10   | 40   | 0          | 0      |
| frontend-develop-tools/optimization            | 47     | 47   | 0    | 0          | 0      |
| mobile-desktop/miniprogram                     | 46     | 46   | 0    | 0          | 0      |
| frontend-develop-tools/documentation-generator | 41     | 41   | 0    | 0          | 0      |
| frontend-framework/meta                        | 41     | 26   | 15   | 0          | 0      |
| base/browser                                   | 40     | 40   | 0    | 0          | 0      |
| frontend-framework/ui                          | 38     | 25   | 13   | 0          | 0      |
| frontend-toolchain/bundler                     | 35     | 7    | 28   | 0          | 0      |
| mobile-desktop/mobile-framework                | 34     | 34   | 0    | 0          | 0      |
| large-language-model/tools                     | 30     | 14   | 16   | 0          | 0      |
| engineering/devops                             | 26     | 22   | 4    | 0          | 0      |
| mobile-desktop/desktop-framework               | 26     | 26   | 0    | 0          | 0      |
| frontend-framework/ssg                         | 24     | 11   | 13   | 0          | 0      |
| engineering/iac                                | 23     | 21   | 2    | 0          | 0      |
| engineering/monorepo                           | 22     | 21   | 1    | 0          | 0      |
| frontend-develop-tools/online-editor           | 22     | 22   | 0    | 0          | 0      |
| web-advanced/package-manager                   | 20     | 4    | 16   | 0          | 0      |
| frontend-develop-tools/ide                     | 19     | 10   | 9    | 0          | 0      |
| frontend-framework/others                      | 19     | 9    | 10   | 0          | 0      |
| frontend-framework/state                       | 18     | 12   | 6    | 0          | 0      |
| engineering/release                            | 17     | 16   | 1    | 0          | 0      |
| frontend-toolchain/build                       | 17     | 5    | 12   | 0          | 0      |
| frontend-toolchain/compiler                    | 15     | 3    | 12   | 0          | 0      |
| frontend-develop-tools/version-control         | 13     | 13   | 0    | 0          | 0      |
| engineering/container                          | 12     | 12   | 0    | 0          | 0      |
| engineering/deps                               | 11     | 11   | 0    | 0          | 0      |
| frontend-framework/composables                 | 11     | 7    | 4    | 0          | 0      |
| web-advanced/module                            | 10     | 2    | 8    | 0          | 0      |
| frontend-framework/router                      | 9      | 6    | 3    | 0          | 0      |
| large-language-model/models                    | 9      | 3    | 6    | 0          | 0      |
| frontend-visualization/canvas                  | 7      | 7    | 0    | 0          | 0      |
| frontend-visualization/d3                      | 7      | 7    | 0    | 0          | 0      |
| frontend-visualization/echarts                 | 7      | 7    | 0    | 0          | 0      |
| frontend-visualization/svg                     | 7      | 7    | 0    | 0          | 0      |
| frontend-visualization/animejs                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/antv-g2                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/antv-g6                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/antv-x6                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/babylon                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/cesium                  | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/chartjs                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/dnd-kit                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/fabric                  | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/framer-motion           | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/gsap                    | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/konva                   | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/leaflet                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/lottie                  | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/mapbox-maplibre         | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/mermaid                 | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/pixi                    | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/recharts                | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/waapi                   | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/webgl                   | 6      | 6    | 0    | 0          | 0      |
| frontend-visualization/webgpu                  | 6      | 6    | 0    | 0          | 0      |
| large-language-model/skills                    | 6      | 2    | 4    | 0          | 0      |
| frontend-visualization/sortablejs              | 5      | 5    | 0    | 0          | 0      |
| frontend-visualization/three                   | 5      | 4    | 1    | 0          | 0      |

### 缺失速查文件

- `src/zh/engineering/devops/github-actions/reference.md`
- `src/zh/engineering/devops/gitlab-cicd/reference.md`
- `src/zh/engineering/devops/husky/reference.md`
- `src/zh/engineering/devops/lint-staged/reference.md`
- `src/zh/engineering/iac/ansible/reference.md`
- `src/zh/engineering/iac/pulumi/reference.md`
- `src/zh/engineering/monorepo/turborepo/reference.md`
- `src/zh/engineering/release/changesets/reference.md`
- `src/zh/frontend-develop-tools/ide/cursor/guideline-rules.md`
- `src/zh/frontend-develop-tools/ide/kiro/guideline-spec.md`
- `src/zh/frontend-develop-tools/ide/sublime-text/guideline-config.md`
- `src/zh/frontend-develop-tools/ide/trae/guideline-rules.md`
- `src/zh/frontend-develop-tools/ide/vim-neovim/guideline-neovim.md`
- `src/zh/frontend-develop-tools/ide/vscode/guideline-ai.md`
- `src/zh/frontend-develop-tools/ide/webstorm/guideline-ai.md`
- `src/zh/frontend-develop-tools/ide/windsurf/guideline-rules.md`
- `src/zh/frontend-develop-tools/ide/zed/guideline-ai.md`
- `src/zh/frontend-framework/components/angular-material/getting-started.md`
- `src/zh/frontend-framework/components/angular-material/guide-line.md`
- `src/zh/frontend-framework/components/angular-material/reference.md`
- `src/zh/frontend-framework/components/astryx/reference.md`
- `src/zh/frontend-framework/components/chakra-ui/getting-started.md`
- `src/zh/frontend-framework/components/chakra-ui/guide-line.md`
- `src/zh/frontend-framework/components/chakra-ui/reference.md`
- `src/zh/frontend-framework/components/headless-ui/getting-started.md`
- `src/zh/frontend-framework/components/headless-ui/guide-line.md`
- `src/zh/frontend-framework/components/headless-ui/reference.md`
- `src/zh/frontend-framework/components/mantine/getting-started.md`
- `src/zh/frontend-framework/components/mantine/guide-line.md`
- `src/zh/frontend-framework/components/mantine/reference.md`
- `src/zh/frontend-framework/components/mui/getting-started.md`
- `src/zh/frontend-framework/components/mui/guide-line.md`
- `src/zh/frontend-framework/components/mui/reference.md`
- `src/zh/frontend-framework/components/ng-zorro/getting-started.md`
- `src/zh/frontend-framework/components/ng-zorro/guide-line.md`
- `src/zh/frontend-framework/components/ng-zorro/reference.md`
- `src/zh/frontend-framework/components/radix-ui/getting-started.md`
- `src/zh/frontend-framework/components/radix-ui/guide-line.md`
- `src/zh/frontend-framework/components/radix-ui/reference.md`
- `src/zh/frontend-framework/components/shadcn/getting-started.md`
- `src/zh/frontend-framework/components/shadcn/guide-line.md`
- `src/zh/frontend-framework/components/shadcn/reference.md`
- `src/zh/frontend-framework/components/vant-ui/guide-line.md`
- `src/zh/frontend-framework/components/vant-ui/reference.md`
- `src/zh/frontend-framework/composables/ahooks/guide-line.md`
- `src/zh/frontend-framework/composables/react-use/guide-line.md`
- `src/zh/frontend-framework/composables/usehooks-ts/guide-line.md`
- `src/zh/frontend-framework/composables/vue-hooks-plus/guide-line.md`
- `src/zh/frontend-framework/document/docx-editor/guide-line/advanced.md`
- `src/zh/frontend-framework/document/docx-editor/guide-line/base.md`
- `src/zh/frontend-framework/document/docx-editor/guide-line/expert.md`
- `src/zh/frontend-framework/document/docx-editor/reference.md`
- `src/zh/frontend-framework/document/docx/guide-line/advanced.md`
- `src/zh/frontend-framework/document/docx/guide-line/base.md`
- `src/zh/frontend-framework/document/docx/guide-line/expert.md`
- `src/zh/frontend-framework/document/docx/reference.md`
- `src/zh/frontend-framework/document/docxtemplater/guide-line/advanced.md`
- `src/zh/frontend-framework/document/docxtemplater/guide-line/base.md`
- `src/zh/frontend-framework/document/docxtemplater/guide-line/expert.md`
- `src/zh/frontend-framework/document/docxtemplater/reference.md`
- `src/zh/frontend-framework/document/exceljs/guide-line/advanced.md`
- `src/zh/frontend-framework/document/exceljs/guide-line/base.md`
- `src/zh/frontend-framework/document/exceljs/guide-line/expert.md`
- `src/zh/frontend-framework/document/exceljs/reference.md`
- `src/zh/frontend-framework/document/jspdf/guide-line/advanced.md`
- `src/zh/frontend-framework/document/jspdf/guide-line/base.md`
- `src/zh/frontend-framework/document/jspdf/guide-line/expert.md`
- `src/zh/frontend-framework/document/jspdf/reference.md`
- `src/zh/frontend-framework/document/mammoth/guide-line/advanced.md`
- `src/zh/frontend-framework/document/mammoth/guide-line/base.md`
- `src/zh/frontend-framework/document/mammoth/guide-line/expert.md`
- `src/zh/frontend-framework/document/mammoth/reference.md`
- `src/zh/frontend-framework/document/pdf-lib/guide-line/advanced.md`
- `src/zh/frontend-framework/document/pdf-lib/guide-line/base.md`
- `src/zh/frontend-framework/document/pdf-lib/guide-line/expert.md`
- `src/zh/frontend-framework/document/pdf-lib/reference.md`
- `src/zh/frontend-framework/document/pdfjs/guide-line/advanced.md`
- `src/zh/frontend-framework/document/pdfjs/guide-line/base.md`
- `src/zh/frontend-framework/document/pdfjs/guide-line/expert.md`
- `src/zh/frontend-framework/document/pdfjs/reference.md`
- `src/zh/frontend-framework/document/pptxgenjs/guide-line/advanced.md`
- `src/zh/frontend-framework/document/pptxgenjs/guide-line/base.md`
- `src/zh/frontend-framework/document/pptxgenjs/guide-line/expert.md`
- `src/zh/frontend-framework/document/pptxgenjs/reference.md`
- `src/zh/frontend-framework/document/sheetjs/guide-line/advanced.md`
- `src/zh/frontend-framework/document/sheetjs/guide-line/base.md`
- `src/zh/frontend-framework/document/sheetjs/guide-line/expert.md`
- `src/zh/frontend-framework/document/sheetjs/reference.md`
- `src/zh/frontend-framework/meta/analog/guide-line.md`
- `src/zh/frontend-framework/meta/analog/reference.md`
- `src/zh/frontend-framework/meta/astro/reference.md`
- `src/zh/frontend-framework/meta/next-js/reference.md`
- `src/zh/frontend-framework/meta/nuxt/reference.md`
- `src/zh/frontend-framework/meta/qwik/guide-line.md`
- `src/zh/frontend-framework/meta/qwik/reference.md`
- `src/zh/frontend-framework/meta/react-router/guide-line.md`
- `src/zh/frontend-framework/meta/react-router/reference.md`
- `src/zh/frontend-framework/meta/remix/guide-line.md`
- `src/zh/frontend-framework/meta/solid-start/guide-line.md`
- `src/zh/frontend-framework/meta/solid-start/reference.md`
- `src/zh/frontend-framework/meta/svelte-kit/reference.md`
- `src/zh/frontend-framework/meta/tanstack-start/guide-line.md`
- `src/zh/frontend-framework/meta/tanstack-start/reference.md`
- `src/zh/frontend-framework/others/i18next/guide-line/advanced.md`
- `src/zh/frontend-framework/others/i18next/guide-line/base.md`
- `src/zh/frontend-framework/others/i18next/guide-line/expert.md`
- `src/zh/frontend-framework/others/i18next/reference.md`
- `src/zh/frontend-framework/others/iconify/guide-line.md`
- `src/zh/frontend-framework/others/markdown-it/guide-line.md`
- `src/zh/frontend-framework/others/shiki/guide-line.md`
- `src/zh/frontend-framework/others/tanstack-query/guide-line.md`
- `src/zh/frontend-framework/others/vee-validate/reference.md`
- `src/zh/frontend-framework/others/vue-i18n/reference.md`
- `src/zh/frontend-framework/router/react-navigation/reference.md`
- `src/zh/frontend-framework/router/tanstack-router/reference.md`
- `src/zh/frontend-framework/router/vue-router/reference.md`
- `src/zh/frontend-framework/ssg/docusaurus/guide-line.md`
- `src/zh/frontend-framework/ssg/docusaurus/reference.md`
- `src/zh/frontend-framework/ssg/eleventy/guide-line.md`
- `src/zh/frontend-framework/ssg/eleventy/reference.md`
- `src/zh/frontend-framework/ssg/hexo/guide-line.md`
- `src/zh/frontend-framework/ssg/hexo/reference.md`
- `src/zh/frontend-framework/ssg/nextra/guide-line.md`
- `src/zh/frontend-framework/ssg/nextra/reference.md`
- `src/zh/frontend-framework/ssg/slidev/getting-started.md`
- `src/zh/frontend-framework/ssg/slidev/guide-line/other.md`
- `src/zh/frontend-framework/ssg/starlight/guide-line.md`
- `src/zh/frontend-framework/ssg/starlight/reference.md`
- `src/zh/frontend-framework/ssg/vite-press/getting-started.md`
- `src/zh/frontend-framework/state/jotai/reference.md`
- `src/zh/frontend-framework/state/mobx/reference.md`
- `src/zh/frontend-framework/state/ng-rx/reference.md`
- `src/zh/frontend-framework/state/pinia/reference.md`
- `src/zh/frontend-framework/state/redux/reference.md`
- `src/zh/frontend-framework/state/zustand/reference.md`
- `src/zh/frontend-framework/ui/alpine-js/guide-line.md`
- `src/zh/frontend-framework/ui/alpine-js/reference.md`
- `src/zh/frontend-framework/ui/angular/reference.md`
- `src/zh/frontend-framework/ui/htmx/guide-line.md`
- `src/zh/frontend-framework/ui/htmx/reference.md`
- `src/zh/frontend-framework/ui/lit/guide-line.md`
- `src/zh/frontend-framework/ui/lit/reference.md`
- `src/zh/frontend-framework/ui/preact/guide-line.md`
- `src/zh/frontend-framework/ui/react/reference.md`
- `src/zh/frontend-framework/ui/solid/guide-line.md`
- `src/zh/frontend-framework/ui/solid/reference.md`
- `src/zh/frontend-framework/ui/svelte/reference.md`
- `src/zh/frontend-framework/ui/vue/reference.md`
- `src/zh/frontend-toolchain/build/parcel/guide-line/base.md`
- `src/zh/frontend-toolchain/build/rsbuild/guide-line/base.md`
- `src/zh/frontend-toolchain/build/vite/guide-line/advanced.md`
- `src/zh/frontend-toolchain/build/vite/guide-line/base.md`
- `src/zh/frontend-toolchain/build/vite/guide-line/expert.md`
- `src/zh/frontend-toolchain/build/vite/guide-line/other.md`
- `src/zh/frontend-toolchain/build/vite/reference.md`
- `src/zh/frontend-toolchain/build/webpack/guide-line/advanced.md`
- `src/zh/frontend-toolchain/build/webpack/guide-line/base.md`
- `src/zh/frontend-toolchain/build/webpack/guide-line/expert.md`
- `src/zh/frontend-toolchain/build/webpack/guide-line/other.md`
- `src/zh/frontend-toolchain/build/webpack/reference.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/esbuild/reference.md`
- `src/zh/frontend-toolchain/bundler/rolldown/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/rolldown/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/rolldown/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/rolldown/reference.md`
- `src/zh/frontend-toolchain/bundler/rollup/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/rollup/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/rollup/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/rollup/reference.md`
- `src/zh/frontend-toolchain/bundler/rspack/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/rspack/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/rspack/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/rspack/reference.md`
- `src/zh/frontend-toolchain/bundler/tsdown/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/tsdown/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/tsdown/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/tsdown/reference.md`
- `src/zh/frontend-toolchain/bundler/tsup/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/tsup/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/tsup/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/tsup/reference.md`
- `src/zh/frontend-toolchain/bundler/unbuild/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/unbuild/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/unbuild/guide-line/expert.md`
- `src/zh/frontend-toolchain/bundler/unbuild/reference.md`
- `src/zh/frontend-toolchain/compiler/babel/guide-line/advanced.md`
- `src/zh/frontend-toolchain/compiler/babel/guide-line/base.md`
- `src/zh/frontend-toolchain/compiler/babel/guide-line/expert.md`
- `src/zh/frontend-toolchain/compiler/babel/reference.md`
- `src/zh/frontend-toolchain/compiler/swc/guide-line/advanced.md`
- `src/zh/frontend-toolchain/compiler/swc/guide-line/base.md`
- `src/zh/frontend-toolchain/compiler/swc/guide-line/expert.md`
- `src/zh/frontend-toolchain/compiler/swc/reference.md`
- `src/zh/frontend-toolchain/compiler/tsc/guide-line/advanced.md`
- `src/zh/frontend-toolchain/compiler/tsc/guide-line/base.md`
- `src/zh/frontend-toolchain/compiler/tsc/guide-line/expert.md`
- `src/zh/frontend-toolchain/compiler/tsc/reference.md`
- `src/zh/frontend-visualization/three/reference.md`
- `src/zh/large-language-model/models/claude/getting-started.md`
- `src/zh/large-language-model/models/claude/reference.md`
- `src/zh/large-language-model/models/gemini/getting-started.md`
- `src/zh/large-language-model/models/gemini/reference.md`
- `src/zh/large-language-model/models/gpt/getting-started.md`
- `src/zh/large-language-model/models/gpt/reference.md`
- `src/zh/large-language-model/skills/everything-claude-code/getting-started.md`
- `src/zh/large-language-model/skills/everything-claude-code/reference.md`
- `src/zh/large-language-model/skills/superpowers/getting-started.md`
- `src/zh/large-language-model/skills/superpowers/reference.md`
- `src/zh/large-language-model/tools/agent/claude-code/getting-started.md`
- `src/zh/large-language-model/tools/agent/claude-code/reference.md`
- `src/zh/large-language-model/tools/agent/codex/getting-started.md`
- `src/zh/large-language-model/tools/agent/codex/reference.md`
- `src/zh/large-language-model/tools/agent/gemini-cli/getting-started.md`
- `src/zh/large-language-model/tools/agent/gemini-cli/reference.md`
- `src/zh/large-language-model/tools/agent/opencode/getting-started.md`
- `src/zh/large-language-model/tools/agent/opencode/reference.md`
- `src/zh/large-language-model/tools/agent/pi/getting-started.md`
- `src/zh/large-language-model/tools/agent/pi/reference.md`
- `src/zh/large-language-model/tools/app-builder/bolt-new/reference.md`
- `src/zh/large-language-model/tools/app-builder/lovable/reference.md`
- `src/zh/large-language-model/tools/app-builder/replit-agent/reference.md`
- `src/zh/large-language-model/tools/app-builder/v0/reference.md`
- `src/zh/large-language-model/tools/other/open-router/getting-started.md`
- `src/zh/large-language-model/tools/other/open-router/reference.md`
- `src/zh/web-advanced/js-extension/crypto-js/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/crypto-js/guide-line/base.md`
- `src/zh/web-advanced/js-extension/crypto-js/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/crypto-js/reference.md`
- `src/zh/web-advanced/js-extension/decimal-js/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/decimal-js/guide-line/base.md`
- `src/zh/web-advanced/js-extension/decimal-js/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/decimal-js/reference.md`
- `src/zh/web-advanced/js-extension/dompurify/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/dompurify/guide-line/base.md`
- `src/zh/web-advanced/js-extension/dompurify/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/dompurify/reference.md`
- `src/zh/web-advanced/js-extension/es-toolkit/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/es-toolkit/guide-line/base.md`
- `src/zh/web-advanced/js-extension/es-toolkit/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/es-toolkit/reference.md`
- `src/zh/web-advanced/js-extension/fuse-js/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/fuse-js/guide-line/base.md`
- `src/zh/web-advanced/js-extension/fuse-js/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/fuse-js/reference.md`
- `src/zh/web-advanced/js-extension/immer/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/immer/guide-line/base.md`
- `src/zh/web-advanced/js-extension/immer/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/immer/reference.md`
- `src/zh/web-advanced/js-extension/lodash-es/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/lodash-es/guide-line/base.md`
- `src/zh/web-advanced/js-extension/lodash-es/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/lodash-es/reference.md`
- `src/zh/web-advanced/js-extension/nanoid/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/nanoid/guide-line/base.md`
- `src/zh/web-advanced/js-extension/nanoid/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/nanoid/reference.md`
- `src/zh/web-advanced/js-extension/papaparse/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/papaparse/guide-line/base.md`
- `src/zh/web-advanced/js-extension/papaparse/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/papaparse/reference.md`
- `src/zh/web-advanced/js-extension/rxjs/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/rxjs/guide-line/base.md`
- `src/zh/web-advanced/js-extension/rxjs/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/rxjs/reference.md`
- `src/zh/web-advanced/js-extension/ts-pattern/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/ts-pattern/guide-line/base.md`
- `src/zh/web-advanced/js-extension/ts-pattern/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/ts-pattern/reference.md`
- `src/zh/web-advanced/js-extension/type-fest/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/type-fest/guide-line/base.md`
- `src/zh/web-advanced/js-extension/type-fest/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/type-fest/reference.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/base.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/utility-libs/reference.md`
- `src/zh/web-advanced/js-extension/valibot/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/valibot/guide-line/base.md`
- `src/zh/web-advanced/js-extension/valibot/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/valibot/reference.md`
- `src/zh/web-advanced/js-extension/zod/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/zod/guide-line/base.md`
- `src/zh/web-advanced/js-extension/zod/guide-line/expert.md`
- `src/zh/web-advanced/js-extension/zod/reference.md`
- `src/zh/web-advanced/module/commonjs/guide-line/advanced.md`
- `src/zh/web-advanced/module/commonjs/guide-line/base.md`
- `src/zh/web-advanced/module/commonjs/guide-line/expert.md`
- `src/zh/web-advanced/module/commonjs/reference.md`
- `src/zh/web-advanced/module/es-module/guide-line/advanced.md`
- `src/zh/web-advanced/module/es-module/guide-line/base.md`
- `src/zh/web-advanced/module/es-module/guide-line/expert.md`
- `src/zh/web-advanced/module/es-module/reference.md`
- `src/zh/web-advanced/package-manager/bun/guide-line/advanced.md`
- `src/zh/web-advanced/package-manager/bun/guide-line/base.md`
- `src/zh/web-advanced/package-manager/bun/guide-line/expert.md`
- `src/zh/web-advanced/package-manager/bun/reference.md`
- `src/zh/web-advanced/package-manager/npm/guide-line/advanced.md`
- `src/zh/web-advanced/package-manager/npm/guide-line/base.md`
- `src/zh/web-advanced/package-manager/npm/guide-line/expert.md`
- `src/zh/web-advanced/package-manager/npm/reference.md`
- `src/zh/web-advanced/package-manager/pnpm/guide-line/advanced.md`
- `src/zh/web-advanced/package-manager/pnpm/guide-line/base.md`
- `src/zh/web-advanced/package-manager/pnpm/guide-line/expert.md`
- `src/zh/web-advanced/package-manager/pnpm/reference.md`
- `src/zh/web-advanced/package-manager/yarn/guide-line/advanced.md`
- `src/zh/web-advanced/package-manager/yarn/guide-line/base.md`
- `src/zh/web-advanced/package-manager/yarn/guide-line/expert.md`
- `src/zh/web-advanced/package-manager/yarn/reference.md`

### 速查位置不合规文件

_无_

### 空速查文件

_无_

## 版本说明审计

### 缺失版本说明块

- `src/zh/engineering/devops/husky/guide-line.md`
- `src/zh/frontend-framework/components/angular-material/getting-started.md`
- `src/zh/frontend-framework/components/angular-material/guide-line.md`
- `src/zh/frontend-framework/components/angular-material/reference.md`
- `src/zh/frontend-framework/components/chakra-ui/getting-started.md`
- `src/zh/frontend-framework/components/headless-ui/getting-started.md`
- `src/zh/frontend-framework/components/headless-ui/guide-line.md`
- `src/zh/frontend-framework/components/headless-ui/reference.md`
- `src/zh/frontend-framework/components/mantine/getting-started.md`
- `src/zh/frontend-framework/components/mui/getting-started.md`
- `src/zh/frontend-framework/components/mui/guide-line.md`
- `src/zh/frontend-framework/components/mui/reference.md`
- `src/zh/frontend-framework/components/ng-zorro/getting-started.md`
- `src/zh/frontend-framework/components/ng-zorro/guide-line.md`
- `src/zh/frontend-framework/components/ng-zorro/reference.md`
- `src/zh/frontend-framework/components/radix-ui/getting-started.md`
- `src/zh/frontend-framework/components/radix-ui/guide-line.md`
- `src/zh/frontend-framework/components/radix-ui/reference.md`
- `src/zh/frontend-framework/components/shadcn/getting-started.md`
- `src/zh/frontend-framework/components/shadcn/guide-line.md`
- `src/zh/frontend-framework/components/shadcn/reference.md`
- `src/zh/frontend-framework/ssg/slidev/getting-started.md`
- `src/zh/frontend-framework/ssg/slidev/guide-line/advance.md`
- `src/zh/frontend-framework/ssg/slidev/guide-line/base.md`
- `src/zh/frontend-framework/ssg/slidev/guide-line/built-in.md`
- `src/zh/frontend-framework/ssg/slidev/guide-line/other.md`
- `src/zh/frontend-framework/ssg/slidev/reference.md`
- `src/zh/frontend-framework/ssg/vite-press/guideline-base.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/advanced.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/base.md`
- `src/zh/frontend-toolchain/bundler/esbuild/guide-line/expert.md`

### 版本说明未给出基线

- `src/zh/engineering/devops/github-actions/guide-line/advanced.md`
- `src/zh/engineering/devops/github-actions/guide-line/expert.md`
- `src/zh/engineering/devops/github-actions/guide-line/other.md`
- `src/zh/engineering/devops/github-actions/reference.md`
- `src/zh/engineering/devops/gitlab-cicd/guide-line/other.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/getting-started.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/guide-line/principles-and-methods.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/guide-line/three-approaches.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/guide-line/when-ai-cases.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/guide-line/when-manual.md`
- `src/zh/frontend-develop-tools/testing/test-quality/ai-era-testing/reference.md`
- `src/zh/frontend-framework/composables/react-use/guide-line.md`
- `src/zh/frontend-framework/meta/astro/guide-line/advanced.md`
- `src/zh/frontend-framework/meta/astro/guide-line/base.md`
- `src/zh/frontend-framework/meta/astro/guide-line/expert.md`
- `src/zh/frontend-framework/meta/next-js/guide-line/advanced.md`
- `src/zh/frontend-framework/meta/next-js/guide-line/base.md`
- `src/zh/frontend-framework/meta/next-js/guide-line/expert.md`
- `src/zh/frontend-framework/meta/nuxt/guide-line/advanced.md`
- `src/zh/frontend-framework/meta/nuxt/guide-line/expert.md`
- `src/zh/frontend-framework/meta/svelte-kit/guide-line/advanced.md`
- `src/zh/frontend-framework/meta/svelte-kit/guide-line/base.md`
- `src/zh/frontend-framework/meta/svelte-kit/guide-line/expert.md`
- `src/zh/frontend-framework/others/iconify/guide-line.md`
- `src/zh/frontend-framework/ui/vue/guide-line/advanced.md`
- `src/zh/frontend-framework/ui/vue/guide-line/expert.md`
- `src/zh/frontend-framework/ui/vue/guide-line/other.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/advanced.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/base.md`
- `src/zh/web-advanced/js-extension/utility-libs/guide-line/expert.md`

## 技术节点链接审计

| 目录                                           | 技术首页 | 文档链接 | 幻灯片链接 | 应有测试题 | 已有测试题 |
| ---------------------------------------------- | -------- | -------- | ---------- | ---------- | ---------- |
| base/language                                  | 26       | 26       | 26         | 26         | 26         |
| web-advanced/js-extension                      | 21       | 21       | 21         | 21         | 21         |
| frontend-develop-tools/testing                 | 20       | 20       | 20         | 20         | 20         |
| frontend-framework/components                  | 18       | 18       | 1          | 18         | 18         |
| web-advanced/language                          | 15       | 15       | 15         | 15         | 15         |
| base/network                                   | 11       | 11       | 11         | 11         | 11         |
| frontend-framework/meta                        | 10       | 10       | 1          | 10         | 10         |
| frontend-develop-tools/ide                     | 10       | 10       | 10         | 10         | 10         |
| frontend-develop-tools/static-analysis         | 10       | 10       | 10         | 10         | 10         |
| frontend-framework/document                    | 10       | 10       | 10         | 10         | 10         |
| large-language-model/tools                     | 10       | 10       | 10         | 10         | 10         |
| frontend-framework/ui                          | 9        | 9        | 8          | 9          | 9          |
| architecture/micro-frontend                    | 7        | 7        | 7          | 7          | 7          |
| frontend-develop-tools/version-control         | 8        | 8        | 8          | 8          | 8          |
| frontend-framework/ssg                         | 7        | 7        | 0          | 7          | 7          |
| frontend-develop-tools/documentation-generator | 7        | 7        | 7          | 7          | 7          |
| frontend-develop-tools/optimization            | 7        | 7        | 7          | 7          | 7          |
| frontend-framework/others                      | 7        | 7        | 3          | 7          | 7          |
| frontend-toolchain/bundler                     | 7        | 7        | 7          | 7          | 7          |
| mobile-desktop/miniprogram                     | 7        | 7        | 7          | 7          | 7          |
| base/browser                                   | 5        | 5        | 5          | 5          | 5          |
| engineering/devops                             | 6        | 6        | 6          | 6          | 6          |
| frontend-framework/state                       | 6        | 6        | 0          | 6          | 6          |
| frontend-develop-tools/online-editor           | 5        | 5        | 5          | 5          | 5          |
| frontend-framework/composables                 | 5        | 5        | 0          | 5          | 5          |
| frontend-toolchain/build                       | 5        | 5        | 5          | 5          | 5          |
| mobile-desktop/mobile-framework                | 5        | 5        | 5          | 5          | 5          |
| engineering/iac                                | 4        | 4        | 4          | 4          | 4          |
| engineering/monorepo                           | 4        | 4        | 4          | 4          | 4          |
| mobile-desktop/desktop-framework               | 4        | 4        | 4          | 4          | 4          |
| web-advanced/package-manager                   | 4        | 4        | 4          | 4          | 4          |
| engineering/release                            | 3        | 3        | 3          | 3          | 3          |
| frontend-framework/router                      | 3        | 3        | 0          | 3          | 3          |
| frontend-toolchain/compiler                    | 3        | 3        | 3          | 3          | 3          |
| large-language-model/models                    | 3        | 3        | 3          | 3          | 3          |
| engineering/container                          | 2        | 2        | 2          | 2          | 2          |
| engineering/deps                               | 2        | 2        | 2          | 2          | 2          |
| large-language-model/skills                    | 2        | 2        | 2          | 2          | 2          |
| web-advanced/module                            | 2        | 2        | 2          | 2          | 2          |
| (root)                                         | 0        | 0        | 0          | 0          | 0          |
| base                                           | 0        | 0        | 0          | 0          | 0          |
| frontend-framework                             | 0        | 0        | 0          | 0          | 0          |
| frontend-visualization                         | 0        | 0        | 0          | 0          | 0          |
| frontend-visualization/animejs                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/antv-g2                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/antv-g6                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/antv-x6                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/babylon                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/canvas                  | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/cesium                  | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/chartjs                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/d3                      | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/dnd-kit                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/echarts                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/fabric                  | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/framer-motion           | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/gsap                    | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/konva                   | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/leaflet                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/lottie                  | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/mapbox-maplibre         | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/mermaid                 | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/pixi                    | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/recharts                | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/sortablejs              | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/svg                     | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/three                   | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/waapi                   | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/webgl                   | 1        | 1        | 1          | 1          | 1          |
| frontend-visualization/webgpu                  | 1        | 1        | 1          | 1          | 1          |
| large-language-model                           | 0        | 0        | 0          | 0          | 0          |

### 缺失测试题链接文件

_无_

### 测试题链接格式异常文件

_无_
