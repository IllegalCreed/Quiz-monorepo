/**
 * 应用入口文件
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Element Plus 样式（深色模式 CSS 变量）
import "./styles/index.scss";

// 全局样式（Tailwind 色阶 + Quiz 紫色主题 + Element Plus 变量覆盖）
import "./styles/main.scss";

// Element Plus 弹窗组件样式（非按需引入的组件需手动导入）
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/notification.scss";

// UnoCSS（最后导入，确保最高优先级）
import "virtual:uno.css";

// 自定义指令
import { permission } from "./directives/permission";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 注册全局指令
app.directive("permission", permission);

app.mount("#app");
