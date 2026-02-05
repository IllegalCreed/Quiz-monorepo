import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "@unocss/vite";

/*
 * Vite 开发配置（面向本包的本地开发）
 *
 * 说明：
 * - 该配置主要用于 Storybook 的开发服务器和本地开发体验（热重载、UnoCSS 等）。
 * - 若需要在本地调试组件，运行：pnpm -C packages/ui run storybook
 * - 生产包的构建由 tsdown 负责（请查看 tsdown.config.ts）。
 */
// 该配置用于 Storybook 的开发服务器及其他开发工具。
// 生产环境下库的构建由 tsdown 负责（参见 tsdown.config.ts）。
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  // 预优化 Storybook a11y addon 依赖，避免测试时动态优化导致重载
  optimizeDeps: {
    include: ["@storybook/addon-a11y/preview"],
  },
  // Preview 服务器配置
  preview: {
    port: 10040,
    strictPort: true, // 如果端口被占用则失败，而不是自动尝试下一个端口
  },
});
