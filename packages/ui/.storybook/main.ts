import { mergeConfig } from "vite";
import UnoCSS from "@unocss/vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config_, { configType }) {
    return mergeConfig(config_, {
      plugins: [UnoCSS()],
      ssr: { noExternal: ["@quiz/ui"] },
    });
  },
};

export default config;
