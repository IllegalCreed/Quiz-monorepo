import type { Preview } from "@storybook/vue3-vite";
import "virtual:uno.css";
import "../src/styles/main.scss";

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Light / Dark",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
    },
  },
};

export const decorators = [
  (
    Story: () => unknown,
    context: { globals?: { theme?: "light" | "dark" } },
  ): unknown => {
    const theme = context.globals?.theme ?? "light";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-color-scheme", theme === "dark" ? "dark" : "light");
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    return Story();
  },
];

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
};

export default preview;
