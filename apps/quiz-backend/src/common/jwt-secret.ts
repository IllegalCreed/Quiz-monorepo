/**
 * 读取并校验 JWT 签名密钥。
 *
 * JWT_SECRET 属于启动必需配置，不能在运行时使用硬编码兜底值；
 * 否则生产环境漏配时会退回公开字符串，导致所有 token 都可被预测。
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "JWT_SECRET is required. Please configure it in the current environment before starting quiz-backend.",
    );
  }

  return secret;
}
