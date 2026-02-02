import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { VueUseComponentsResolver } from "unplugin-vue-components/resolvers";

// 手动加载环境变量
const mode = process.env.NODE_ENV || "development";
const env = loadEnv(mode, process.cwd(), "");

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 10000,
    proxy: {
      "/dev-api": {
        target: env.VITE_APP_API,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/dev-api/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const targetUrl = `${options.target}${req.url}`;
            console.log("Sending Request to the Target:", req.method, targetUrl);
          });
        },
      },
    },
  },
  preview: {
    port: 10010,
  },
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        "pinia", // 自定义导入
        {
          // 包导入
          axios: [
            // 默认别名导入
            ["default", "axios"], // import { default as axios } from 'axios',
          ],
          dayjs: [["default", "dayjs"]],
          "@vueuse/router": [
            ["useRouteHash", "useRouteHash"],
            ["useRouteParams", "useRouteParams"],
            ["useRouteQuery", "useRouteQuery"],
          ],
        },
      ],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dts: true,
      dtsTsx: false,
      resolvers: [VueUseComponentsResolver(), IconsResolver()],
    }),
    Icons({
      compiler: "vue3",
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
