import "@testing-library/jest-dom";
import { setProjectAnnotations } from "@storybook/vue3-vite";
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import * as previewAnnotations from "./preview";

// Apply preview annotations so stories' preview config (decorators, parameters, etc.)
// are available to tests. Including a11y addon annotations enables accessibility testing.
// See: https://storybook.js.org/docs/writing-tests/accessibility-testing#integration-with-vitest-addon
setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);
