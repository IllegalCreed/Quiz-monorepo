import "@testing-library/jest-dom";
import { setProjectAnnotations } from "@storybook/vue3-vite";
import * as previewAnnotations from "./preview";

// Apply preview annotations so stories' preview config (decorators, parameters, etc.)
// are available to tests. Load the a11y addon only when NOT running in Vitest
// to avoid dynamic axe import failures inside the headless test runner.
(async () => {
  const annotations: any[] = [previewAnnotations];
  if (!(typeof process !== "undefined" && process.env && process.env.VITEST)) {
    try {
      const a11y = await import("@storybook/addon-a11y/preview");
      annotations.unshift(a11y);
    } catch (e) {
      // ignore if addon isn't available in this environment
    }
  }
  setProjectAnnotations(annotations);
})();
