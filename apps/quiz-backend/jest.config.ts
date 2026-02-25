export default {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  // 只统计业务代码，排除测试文件、模块入口、类型声明
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/__tests__/**",
    "!**/*.spec.ts",
    "!**/main.ts",
    "!**/*.module.ts",
  ],
  coverageDirectory: "../coverage",
  // 同时输出终端摘要和 HTML 详情报告
  coverageReporters: ["text", "text-summary", "lcov"],
};
