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
import BaseCardComp from "./components/BaseCard.vue";
import BaseCardHeaderComp from "./components/BaseCardHeader.vue";
import BaseCardContentComp from "./components/BaseCardContent.vue";
import BaseButtonComp from "./components/BaseButton.vue";
import ThemeToggleComp from "./components/ThemeToggle.vue";
import CheckRadioComp from "./components/CheckRadio.vue";
import CheckRadioGroupComp from "./components/CheckRadioGroup.vue";

export {
  BaseCardComp as BaseCard,
  BaseCardHeaderComp as BaseCardHeader,
  BaseCardContentComp as BaseCardContent,
  BaseButtonComp as BaseButton,
  ThemeToggleComp as ThemeToggle,
  CheckRadioComp as CheckRadio,
  CheckRadioGroupComp as CheckRadioGroup,
};

export default {
  install(app: App) {
    app.component("BaseCard", BaseCardComp);
    app.component("BaseCardHeader", BaseCardHeaderComp);
    app.component("BaseCardContent", BaseCardContentComp);
    app.component("BaseButton", BaseButtonComp);
    app.component("ThemeToggle", ThemeToggleComp);
    app.component("CheckRadio", CheckRadioComp);
    app.component("CheckRadioGroup", CheckRadioGroupComp);
  },
};

export type { BaseCardHeaderProps } from "./components/BaseCardHeader.vue";
export type { BaseButtonProps } from "./components/BaseButton.vue";
export type { ThemeToggleProps } from "./components/ThemeToggle.vue";
export type { CheckRadioProps } from "./components/CheckRadio.vue";
export type {
  CheckRadioGroupOption,
  CheckRadioGroupProps,
} from "./components/CheckRadioGroup.vue";
