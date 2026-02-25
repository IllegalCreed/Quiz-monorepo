import { fileURLToPath, URL } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import type { ViteUserConfig } from "vitest/config";
import viteConfig from "./vite.config";

// viteConfig 的推断类型是 Vite defineConfig 重载联合体，会使 mergeConfig 第一个参数退化为 never
// 转型为 ViteUserConfig（即已被 vitest 扩展了 test 字段的 UserConfig）可让重载正确解析
// 参见 https://github.com/vitejs/vite/issues/13950
export default mergeConfig(
  viteConfig as ViteUserConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      // 单元测试覆盖率配置（通过 --coverage 标志或 test:unit:coverage 脚本触发）
      coverage: {
        provider: "v8",
        reporter: ["html", "text"],
        // 输出到 coverage/unit，与未来的 E2E 覆盖率目录区分
        reportsDirectory: "./coverage/unit",
        include: ["src/**/*.{ts,vue}"],
        exclude: [
          "src/main.ts", // 入口文件，无业务逻辑
          "src/**/*.d.ts", // 自动生成的类型声明文件
          "src/**/__tests__/**", // 测试文件本身
          "src/types/**", // 纯 TypeScript 接口/类型声明，无运行时逻辑
        ],
      },
    },
  }),
);
