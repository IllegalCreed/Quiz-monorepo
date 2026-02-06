/*
 * tsdown 配置（打包与产物说明，面向初学者）
 *
 * 目的：将本组件库打包为 ESM/CJS 两种格式并生成类型声明（用于发布到 npm 或被上层项目直接引用）。
 * 常用命令：
 *  - 本地构建（开发验证）：pnpm -C packages/ui run build
 *  - 生成并本地预览：pnpm -C packages/ui run preview
 *
 * 为什么要自定义 SCSS 插件？
 * - 我们需要在构建时预处理组件中独立的 .scss 文件（例如展开 @apply），并且在打包阶段把结果输出到单独的 style.css。
 * - scssPlugin 会在 rolldown 解析之前读取文件并调用 sass 与 UnoCSS 进行处理。
 *
 * 注意事项：
 * - 我们把 .scss 标记为空模块（inputOptions.moduleTypes）以便插件接管加载流程。
 * - 生产构建使用 tsdown，而不是 vite 的库构建路径；tsdown 使用 rolldown（rolldown 基于 rollup）来打包。
 */
import { defineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";
import * as sass from "sass";
import * as path from "path";
import * as fs from "fs";
import type { Plugin } from "rolldown";
import { createGenerator } from "@unocss/core";
import presetWind4 from "@unocss/preset-wind4";
import presetIcons from "@unocss/preset-icons";
import transformerDirectives from "@unocss/transformer-directives";
import MagicString from "magic-string";

// 为 UnoCSS 创建生成器，用于处理 @apply 指令和图标
const uno = await createGenerator({
  presets: [
    presetWind4(),
    presetIcons({
      // 启用所有 iconify 集合（包括 carbon）
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [transformerDirectives()],
  // safelist: 只包含组件特定的动态状态类（无法通过 @apply 定义的类）
  safelist: [
    // CheckRadio 组件的动态状态类
    "radio--correct",
    "radio--incorrect",
    "radio--disabled",
  ],
});

// 使用 UnoCSS 处理 CSS，将 @apply 展开为最终的 CSS
async function processUnoCSS(css: string, id: string): Promise<string> {
  // 使用 transformer 对 @apply 进行处理
  const s = new MagicString(css);
  for (const transformer of uno.config.transformers || []) {
    // @ts-expect-error - transformer 上下文类型与 UnoCSS 内部类型存在不完全一致
    await transformer.transform(s, id, { uno, tokens: new Set() });
  }

  // 如果是 main.scss，生成并添加 UnoCSS 的基础 CSS（包括 CSS 变量定义）和 safelist 类
  if (id.includes("main.scss")) {
    // 生成 preflight CSS
    const { css: preflightCss } = await uno.generate("", {
      preflights: true,
      safelist: false,
    });

    // 生成 safelist 中的类的 CSS（过滤出字符串类型）
    const safelistClasses = (uno.config.safelist || []).filter(
      (item): item is string => typeof item === "string",
    );
    const { css: safelistCss } = await uno.generate(safelistClasses, {
      preflights: false,
      safelist: true,
    });

    // 组合所有 CSS：preflight + safelist + 原始 CSS
    let finalCss = "";
    if (preflightCss) {
      finalCss += preflightCss + "\n";
    }
    if (safelistCss) {
      finalCss += safelistCss + "\n";
    }
    finalCss += s.toString();

    return finalCss;
  }

  return s.toString();
}

// 自定义 SCSS 插件给 rolldown 使用 - 在原生解析前拦截并预处理 SCSS
function scssPlugin(): Plugin {
  return {
    name: "scss",
    async load(id) {
      // 仅处理真实的 .scss/.sass 文件，不处理 Vue SFC 的虚拟模块
      if (id.includes("?") || id.includes("&")) {
        return null;
      }
      if (!id.endsWith(".scss") && !id.endsWith(".sass")) {
        return null;
      }
      const code = fs.readFileSync(id, "utf-8");
      const result = sass.compileString(code, {
        loadPaths: [path.dirname(id), "node_modules"],
        style: "expanded",
      });
      // 使用 UnoCSS 展开 @apply 指令
      const processedCss = await processUnoCSS(result.css, id);
      // 返回为 CSS 模块，由 rolldown 负责后续打包
      return {
        code: processedCss,
        moduleType: "css",
      };
    },
  };
}

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  clean: true,
  // CI 环境下启用包验证（确保 exports 正确）
  publint: "ci-only",
  attw: "ci-only",
  plugins: [
    // Handle standalone .scss files
    scssPlugin(),
    Vue({
      isProduction: true,
      style: {
        preprocessLang: "scss",
        preprocessOptions: {
          scss: {
            api: "modern-compiler",
          },
        },
      },
    }),
  ],
  dts: {
    vue: true,
    // Use isolated mode - works better with Vue SFCs
  },
  // Use the build-specific tsconfig (with noEmit: false)
  tsconfig: "./tsconfig.build.json",
  // Externalize vue - 保持为 peer dependency（Vue 不会被打包进产物）
  // 说明：发布的包不会包含 Vue，使用者需要在他们的项目中安装对应的 Vue 版本。
  // 这样可以避免出现多个 Vue 实例导致的运行时问题，并让最终包更轻量。
  external: ["vue"],

  /*
   * SCSS 处理说明（为何将 .scss 标记为空）
   *
   * - 我们在 input 阶段把 .scss/.sass 标记为 'empty'，目的是让自定义的 scssPlugin
   *   负责读取并处理这些文件（比如调用 sass 编译、再用 UnoCSS 展开 @apply）。
   * - 如果不这么做，rolldown/rollup 的默认处理器可能会尝试解析这些文件，导致
   *   我们无法在打包时插入 UnoCSS 的结果或控制输出结构。
   * - 调试提示：要查看最终生成的 CSS，请执行 `pnpm -C packages/ui run build` 后
   *   查看输出目录下的 `style.css`（或运行 `pnpm -C packages/ui run preview` 本地预览）。
   */
  inputOptions: {
    moduleTypes: {
      // 在输入阶段把 .scss/.sass 视为空模块，交给上面的 scssPlugin 处理并返回 CSS
      ".scss": "empty",
      ".sass": "empty",
    },
  },

  /*
   * CSS 输出配置
   * - splitting: false 表示不进行 CSS 拆分，所有样式打包到单个文件（style.css），
   *   适合组件库简单使用：上层只需引用一个 CSS 文件即可。
   * - fileName: 指定输出的 CSS 文件名，发布后可通过 `./style.css` 导入样式。
   *
   * 可选项：若希望按组件拆分 CSS（按需加载），可以将 splitting 设为 true，
   * 但需要考虑上层消费方如何加载多个 CSS 文件。
   */
  css: {
    splitting: false,
    fileName: "style.css",
  },
});
