import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // general defaults for local unit tests
      environment: "jsdom",
      globals: true,
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL("./", import.meta.url)),
      // Per the Storybook docs: define a project for Storybook tests
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              // path to your .storybook directory
              configDir: path.join(dirname, ".storybook"),
              // ensure this matches your package script
              storybookScript: "pnpm run storybook",
            }),
          ],
          test: {
            // name used by the addon (the addon may also use storybook:<configDir> filter)
            name: "storybook",
            // Enable browser mode using Playwright
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
            }, // Coverage configuration for Storybook tests
            coverage: {
              provider: "v8",
              enabled: true,
              reporter: [
                ["html", {}],
                ["text", {}],
              ],
              reportsDirectory: "./coverage",
            }, // ensure Storybook preview annotations are applied in tests
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    } as any,
  }),
);
