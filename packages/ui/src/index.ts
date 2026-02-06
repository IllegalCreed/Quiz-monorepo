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
import type { App } from "vue";
import CardComp from "./components/Card.vue";
import CardHeaderComp from "./components/CardHeader.vue";
import CardContentComp from "./components/CardContent.vue";
import ButtonComp from "./components/Button.vue";
import ThemeToggleComp from "./components/ThemeToggle.vue";
import CheckRadioComp from "./components/CheckRadio.vue";
import CheckRadioGroupComp from "./components/CheckRadioGroup.vue";

export {
  CardComp as Card,
  CardHeaderComp as CardHeader,
  CardContentComp as CardContent,
  ButtonComp as Button,
  ThemeToggleComp as ThemeToggle,
  CheckRadioComp as CheckRadio,
  CheckRadioGroupComp as CheckRadioGroup,
};

export default {
  install(app: App) {
    app.component("Card", CardComp);
    app.component("CardHeader", CardHeaderComp);
    app.component("CardContent", CardContentComp);
    app.component("Button", ButtonComp);
    app.component("ThemeToggle", ThemeToggleComp);
    app.component("CheckRadio", CheckRadioComp);
    app.component("CheckRadioGroup", CheckRadioGroupComp);
  },
};

export type { CardHeaderProps } from "./components/CardHeader.vue";
export type { ButtonProps } from "./components/Button.vue";
export type { ThemeToggleProps } from "./components/ThemeToggle.vue";
export type { CheckRadioProps } from "./components/CheckRadio.vue";
export type {
  CheckRadioGroupOption,
  CheckRadioGroupProps,
} from "./components/CheckRadioGroup.vue";
