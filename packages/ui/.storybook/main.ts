import UnoCSS from "@unocss/vite";
import type { StorybookConfig } from "@storybook/vue3-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-onboarding"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {
      docgen: { plugin: "vue-component-meta", tsconfig: "tsconfig.app.json" },
    },
  },
  async viteFinal(config) {
    config.plugins?.push(UnoCSS());
    return config;
  },
};

export default config;
