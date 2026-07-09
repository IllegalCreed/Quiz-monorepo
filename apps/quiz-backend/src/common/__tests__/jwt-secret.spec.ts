import { getJwtSecret } from "../jwt-secret";

describe("getJwtSecret", () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("返回去掉首尾空白后的 JWT_SECRET", () => {
    process.env.JWT_SECRET = "  test-secret  ";

    expect(getJwtSecret()).toBe("test-secret");
  });

  it("缺少 JWT_SECRET 时快速失败", () => {
    delete process.env.JWT_SECRET;

    expect(() => getJwtSecret()).toThrow("JWT_SECRET is required");
  });
});
