export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
};
