/**
 * 应用入口文件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// UnoCSS
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// Element Plus 基础样式（生成组件依赖的 CSS 变量）
import 'element-plus/theme-chalk/src/base.scss'

// Element Plus 深色模式默认变量（main.scss 中覆盖不足的部分由此兜底）
import 'element-plus/theme-chalk/dark/css-vars.css'

// Element Plus 弹窗组件样式（非按需引入的组件需手动导入）
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/notification.scss'

// 全局样式（Tailwind 色阶 + Quiz 紫色主题 + Element Plus 变量覆盖）
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
