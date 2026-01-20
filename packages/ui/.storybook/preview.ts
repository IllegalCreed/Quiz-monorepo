import type { Preview } from "@storybook/vue3-vite";
import "virtual:uno.css";
import "../src/styles/main.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
  decorators: [],
};

export default preview;
