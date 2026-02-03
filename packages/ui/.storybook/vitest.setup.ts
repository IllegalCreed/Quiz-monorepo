import { setProjectAnnotations } from "@storybook/vue3-vite";
import * as previewAnnotations from "./preview";

// Apply preview annotations so stories' preview config (decorators, parameters, etc.)
// are available to tests as documented in Storybook's Vitest guide.
setProjectAnnotations([previewAnnotations]);
