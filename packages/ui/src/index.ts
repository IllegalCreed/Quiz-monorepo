// 包级副作用样式（确保从包中导入时同时包含组件样式）。
// 使用规范的 `styles/main.scss` 文件以便上层应用或 Storybook 能继承变量与全局样式。
//
// 简单使用示例（在上层应用中）：
// import { createApp } from 'vue';
// import App from './App.vue';
// import { CheckRadio } from '@quiz/ui';
// import '@quiz/ui'; // 导入包级样式
//
// createApp(App).use(CheckRadio).mount('#app');

import "./styles/main.scss";

export { default as CheckRadio } from "./components/CheckRadio.vue";
export { default as CheckRadioGroup } from "./components/CheckRadioGroup.vue";

export type { CheckRadioProps } from "./components/CheckRadio.vue";
export type {
  CheckRadioGroupOption,
  CheckRadioGroupProps,
} from "./components/CheckRadioGroup.vue";
