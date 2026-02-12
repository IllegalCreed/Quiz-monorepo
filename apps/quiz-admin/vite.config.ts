import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import UnoCSS from "unocss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 10050,
  },
  preview: {
    port: 10060,
  },
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "pinia"],
      dts: true,
      eslintrc: { enabled: true, filepath: "./.eslintrc-auto-import.json" },
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
    Components({
      dts: true,
      resolvers: [IconsResolver({ prefix: "i" }), ElementPlusResolver({ importStyle: "sass" })],
    }),
    Icons({ compiler: "vue3", autoInstall: true }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
});
