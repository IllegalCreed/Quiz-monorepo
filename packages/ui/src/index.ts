// Package-level side-effect styles (ensure consumers importing from the package
// also include component styles). Use the canonical `styles/main.scss` file.
import "./styles/main.scss";

export { default as CheckRadio } from "./components/CheckRadio.vue";
export { default as CheckRadioGroup } from "./components/CheckRadioGroup.vue";

export type {
  CheckRadioProps,
  CheckRadioSelectPayload,
} from "./components/CheckRadio.vue";
export type { Option, GroupProps } from "./components/CheckRadioGroup.vue";
