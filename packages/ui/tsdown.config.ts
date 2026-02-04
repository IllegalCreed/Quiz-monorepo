import { defineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";
import * as sass from "sass";
import * as path from "path";
import * as fs from "fs";
import type { Plugin } from "rolldown";
import { createGenerator } from "@unocss/core";
import presetWind4 from "@unocss/preset-wind4";
import transformerDirectives from "@unocss/transformer-directives";

// Create UnoCSS generator for processing @apply directives
const uno = await createGenerator({
  presets: [presetWind4()],
  transformers: [transformerDirectives()],
});

// Process CSS with UnoCSS to expand @apply directives
async function processUnoCSS(css: string, id: string): Promise<string> {
  const result = await uno.applyExtractors(css, id);
  // Use the transformer to process @apply
  const s = new (await import("magic-string")).default(css);
  for (const transformer of uno.config.transformers || []) {
    await transformer.transform(s, id, { uno, tokens: new Set() } as any);
  }
  return s.toString();
}

// Custom SCSS plugin for rolldown - uses load hook to intercept before native parser
function scssPlugin(): Plugin {
  return {
    name: "scss",
    async load(id) {
      // Only handle real .scss/.sass files, not Vue SFC virtual modules
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
      // Process @apply directives with UnoCSS
      const processedCss = await processUnoCSS(result.css, id);
      // Return as CSS module - rolldown will handle CSS bundling
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
  // Externalize vue - it's a peer dependency
  external: ["vue"],
  // Tell rolldown to treat .scss as empty initially (plugin will handle loading)
  inputOptions: {
    moduleTypes: {
      ".scss": "empty",
      ".sass": "empty",
    },
  },
  // CSS configuration
  css: {
    splitting: false,
    fileName: "style.css",
  },
});
