// Type declarations for non-TS module imports used by the package
// UnoCSS provides a virtual stylesheet import; declare it for TypeScript
declare module "virtual:uno.css";

declare module "*.css";
declare module "*.scss";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // Use stricter types to avoid `{} / any` lint errors
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
