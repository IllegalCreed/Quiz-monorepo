import type { Preview } from "@storybook/vue3-vite";
import "virtual:uno.css";
import "../src/styles/main.scss";

const preview: Preview = {
  tags: ["autodocs"],
  argTypes: {
    key: { table: { disable: true } },
    ref: { table: { disable: true } },
    ref_for: { table: { disable: true } },
    ref_key: { table: { disable: true } },
    class: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  decorators: [],
};

export default preview;
