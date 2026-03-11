/*
 * tsdown 配置（打包与产物说明，面向初学者）
 *
 * 目的：将本组件库打包为 ESM/CJS 两种格式并生成类型声明（用于发布到 npm 或被上层项目直接引用）。
 * 常用命令：
 *  - 本地构建（开发验证）：pnpm -C packages/ui run build
 *  - 生成并本地预览：pnpm -C packages/ui run preview
 *
 * CSS 处理流水线：
 * 1. scssPlugin — 编译独立 .scss 文件（sass-embedded），跳过 Vue SFC 虚拟模块
 * 2. unplugin-vue — 编译 Vue SFC 中的 <style lang="scss">（含 @use 引用）
 * 3. rolldown 合并所有 CSS → 单个 style.css
 * 4. unocssPlugin — 在 generateBundle 阶段统一展开 @apply + 注入 preflight/safelist
 *
 * 注意事项：
 * - .scss/.sass 文件通过 moduleTypes 标记为 empty，由自定义 scssPlugin 接管加载。
 * - tsdown v0.21+ 的 @tsdown/css 内置 SCSS 预处理器目前与 unplugin-vue 存在兼容问题
 *   （rolldown rc.8 导致 Vue SFC 中的 @use 不被编译），因此暂不升级。
 * - UnoCSS 处理从旧版的逐文件 processUnoCSS 改为 generateBundle 阶段统一处理，
 *   代码更简洁，且确保所有来源的 CSS（独立文件 + SFC）都能被处理。
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

/**
 * UnoCSS 生成器 — 用于展开 @apply 指令并生成 preflight/safelist CSS
 */
const uno = await createGenerator({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [transformerDirectives()],
  // safelist: 只包含组件特定的动态状态类（无法通过 @apply 定义的类）
  safelist: ["radio--correct", "radio--incorrect", "radio--disabled"],
});

/**
 * 自定义 SCSS 编译插件 — 在 rolldown 解析前拦截独立 .scss/.sass 文件
 *
 * 仅处理真实的 .scss/.sass 文件，Vue SFC 虚拟模块（路径含 ? 或 &）交给 unplugin-vue 处理。
 * 配合 inputOptions.moduleTypes 将 .scss/.sass 标记为 empty，确保此插件接管加载流程。
 */
function scssPlugin(): Plugin {
  return {
    name: "scss",
    async load(id) {
      // 跳过 Vue SFC 虚拟模块
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
      return {
        code: result.css,
        moduleType: "css",
      };
    },
  };
}

/**
 * UnoCSS 后处理插件 — 在 generateBundle 阶段对最终 CSS 资产统一处理
 *
 * 相比旧版在 scssPlugin.load 中逐文件调用 processUnoCSS 的方式，
 * generateBundle 阶段处理有以下优势：
 * - 统一处理所有 CSS 来源（独立 .scss + Vue SFC 样式）
 * - preflight 和 safelist 只注入一次（不会重复）
 * - 代码更简洁，职责更清晰
 */
function unocssPlugin(): Plugin {
  return {
    name: "unocss-apply",
    async generateBundle(_options, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!fileName.endsWith(".css") || asset.type !== "asset") {
          continue;
        }

        const css =
          typeof asset.source === "string"
            ? asset.source
            : new TextDecoder().decode(asset.source);

        // 使用 transformer 展开 @apply 指令
        const s = new MagicString(css);
        for (const transformer of uno.config.transformers || []) {
          // @ts-expect-error - transformer 上下文类型与 UnoCSS 内部类型存在不完全一致
          await transformer.transform(s, fileName, {
            uno,
            tokens: new Set(),
          });
        }

        // 生成 preflight CSS（CSS 变量、基础重置等）
        const { css: preflightCss } = await uno.generate("", {
          preflights: true,
          safelist: false,
        });

        // 生成 safelist 类的 CSS
        const safelistClasses = (uno.config.safelist || []).filter(
          (item): item is string => typeof item === "string",
        );
        const { css: safelistCss } = await uno.generate(safelistClasses, {
          preflights: false,
          safelist: true,
        });

        // 组合：preflight + safelist + 原始 CSS（已展开 @apply）
        let finalCss = "";
        if (preflightCss) {
          finalCss += preflightCss + "\n";
        }
        if (safelistCss) {
          finalCss += safelistCss + "\n";
        }
        finalCss += s.toString();

        asset.source = finalCss;
      }
    },
  };
}

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  clean: true,
  publint: "ci-only",
  attw: "ci-only",
  plugins: [
    // 独立 .scss 文件由自定义插件编译（跳过 Vue SFC 虚拟模块）
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
    // UnoCSS 后处理：在 CSS 输出前统一展开 @apply 并注入 preflight
    unocssPlugin(),
  ],
  dts: {
    vue: true,
  },
  tsconfig: "./tsconfig.build.json",
  // Externalize vue 和 @vueuse/core - 保持为 peer dependency
  external: ["vue", "@vueuse/core"],

  /*
   * 将 .scss/.sass 标记为 empty 模块，让自定义 scssPlugin 接管加载流程。
   * 如果不这么做，rolldown 的默认处理器可能会尝试解析这些文件，导致冲突。
   */
  inputOptions: {
    moduleTypes: {
      ".scss": "empty",
      ".sass": "empty",
    },
  },

  /*
   * CSS 输出配置
   * - splitting: false — 所有样式打包到单个 style.css
   * - fileName — 指定输出文件名
   */
  css: {
    splitting: false,
    fileName: "style.css",
  },
});
