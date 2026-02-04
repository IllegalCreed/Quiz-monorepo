import "@testing-library/jest-dom";
import { setProjectAnnotations } from "@storybook/vue3-vite";
import * as previewAnnotations from "./preview";

// Apply preview annotations so stories' preview config (decorators, parameters, etc.)
// are available to tests. Skip a11y addon in Vitest browser mode to avoid axe import failures.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const annotations: any[] = [previewAnnotations];
setProjectAnnotations(annotations);
