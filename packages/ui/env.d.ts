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
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
