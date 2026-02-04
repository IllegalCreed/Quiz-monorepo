/**
 * Storybook preview.ts 装饰器单元测试
 *
 * 测试目标：
 * - 验证主题切换装饰器正确设置/移除 dark class（与 VueUse useDark 一致）
 * - 验证 Story 返回值正确透传
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { decorators } from "../../.storybook/preview";

describe("Storybook 主题装饰器", () => {
  /**
   * 每个测试前重置 document.documentElement 状态，
   * 确保测试之间互不干扰
   */
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("深色主题：设置 dark class 并透传 Story 返回值", () => {
    // 准备：模拟 Story 函数
    const Story = vi.fn(() => "story-result");

    // 执行：调用装饰器并传入 theme=dark
    const result = decorators[0](Story as unknown as () => unknown, {
      globals: { theme: "dark" },
    });

    // 断言：dark class 被添加，Story 返回值透传
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(result).toBe("story-result");
  });

  it("浅色主题：移除 dark class", () => {
    // 准备：先设置为深色状态
    document.documentElement.classList.add("dark");
    const Story = vi.fn(() => 123);

    // 执行：调用装饰器并传入 theme=light
    const result = decorators[0](Story as unknown as () => unknown, {
      globals: { theme: "light" },
    });

    // 断言：dark class 被移除
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(result).toBe(123);
  });

  it("缺省主题：globals 缺失时默认使用浅色主题", () => {
    // 准备：先设置为深色状态
    document.documentElement.classList.add("dark");
    const Story = vi.fn(() => "default");

    // 执行：调用装饰器但不传 globals
    const emptyCtx = {} as { globals?: { theme?: "light" | "dark" } };
    const result = decorators[0](Story as unknown as () => unknown, emptyCtx);

    // 断言：默认为浅色主题（移除 dark class）
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(result).toBe("default");
  });
});
