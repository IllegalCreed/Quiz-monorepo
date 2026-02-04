import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

/*
 * Vitest 配置（用于本包的单元测试与 Storybook 插件测试）
 *
 * 运行说明：
 * - 运行所有测试（包含 storybook tests）：pnpm -C packages/ui test
 * - 只跑单元测试（unit project）：pnpm -C packages/ui test -- --project unit
 * - 收集覆盖率：pnpm -C packages/ui test -- --coverage
 *
 * 关于 storybookTest 插件：
 * - 我们使用 @storybook/addon-vitest 的 storybookTest 来在 Playwright 中运行 story 级别的交互测试。
 * - 如果需要调试 Playwright 测试，可把 headless 设为 false 或使用 playwright 的调试工具。
 */
const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // 本地单元测试的通用默认配置
      environment: "jsdom",
      globals: true,
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL("./", import.meta.url)),
      // 覆盖配置（在顶层生效；运行 `--coverage` 时收集覆盖率）
      coverage: {
        provider: "v8",
        enabled: true,
        reporter: [
          ["html", {}],
          ["text", {}],
        ],
        reportsDirectory: "./coverage",
      },
      // 按 Storybook 文档：为 Storybook 测试定义单独的项目（用于浏览器级的 story 测试）
      projects: [
        // Unit tests project (runs our src/__tests__/*.spec.ts files)
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/__tests__/**/*.spec.ts"],
            environment: "jsdom",
            globals: true,
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              // 指向本包的 .storybook 目录
              configDir: path.join(dirname, ".storybook"),
              // 确保与 package.json 中的 storybook 脚本一致
              storybookScript: "pnpm run storybook",
            }),
          ],
          test: {
            // 该 name 会被 addon 使用（addon 也可能使用 storybook:<configDir> 的过滤器）
            name: "storybook",
            // 启用基于 Playwright 的浏览器模式进行 story 级测试
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
            }, // 确保 Storybook 的 preview 注入（decorators 等）在测试中生效
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  }),
);
