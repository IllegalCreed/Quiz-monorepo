/**
 * Jest 单元测试不会经过 dotenv-cli 启动脚本，这里只补齐测试必需环境变量。
 * 生产与开发启动仍必须显式配置 JWT_SECRET。
 */
process.env.JWT_SECRET ??= "unit-test-jwt-secret";
