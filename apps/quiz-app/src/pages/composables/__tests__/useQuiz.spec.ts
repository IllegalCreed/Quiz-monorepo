import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useQuiz } from "../useQuiz";

// Mock useMockStore 返回 isMock = true（使用 mock 模式测试）
vi.mock("@/stores/useMockStore", () => ({
  useMockStore: () => ({
    isMock: { value: true },
    setMock: vi.fn(),
  }),
}));

describe("useQuiz (mock mode)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loadNext 应加载题目并重置 optionDescriptions", async () => {
    const { loadNext, question, optionDescriptions, status } = useQuiz();

    await loadNext();

    expect(question.value).not.toBeNull();
    expect(question.value!.options).toHaveLength(2);
    expect(optionDescriptions.value).toEqual({});
    expect(status.value).toBe("idle");
  });

  it("答对后应填充 optionDescriptions 并 1 秒后自动跳转", async () => {
    const { loadNext, choose, optionDescriptions, status, question } = useQuiz();

    await loadNext();
    // Mock 模式下第一个选项 (id=1) 是正确答案
    const correctId = question.value!.options[0]!.id;
    await choose(correctId);

    expect(status.value).toBe("correct");
    // 验证 optionDescriptions 被填充
    expect(Object.keys(optionDescriptions.value).length).toBeGreaterThan(0);
    expect(optionDescriptions.value[1]).toBeTruthy();
    expect(optionDescriptions.value[2]).toBeTruthy();

    // 验证 1 秒后自动调用 loadNext（status 重置为 idle）
    vi.advanceTimersByTime(1000);
    // loadNext 是异步的，需要等待微任务完成
    await vi.runAllTimersAsync();
    expect(status.value).toBe("idle");
    expect(optionDescriptions.value).toEqual({});
  });

  it("答错后应填充 optionDescriptions 且不自动跳转", async () => {
    const { loadNext, choose, optionDescriptions, status, question } = useQuiz();

    await loadNext();
    // Mock 模式下第二个选项 (id=2) 是错误答案
    const wrongId = question.value!.options[1]!.id;
    await choose(wrongId);

    expect(status.value).toBe("wrong");
    // 验证 optionDescriptions 被填充
    expect(Object.keys(optionDescriptions.value).length).toBeGreaterThan(0);

    // 验证不会自动跳转（等待 2 秒后 status 仍为 wrong）
    vi.advanceTimersByTime(2000);
    expect(status.value).toBe("wrong");
  });

  it("loadNext 应重置 optionDescriptions", async () => {
    const { loadNext, choose, optionDescriptions, question } = useQuiz();

    await loadNext();
    // 先答题填充 descriptions
    const wrongId = question.value!.options[1]!.id;
    await choose(wrongId);
    expect(Object.keys(optionDescriptions.value).length).toBeGreaterThan(0);

    // 再次 loadNext 应重置
    await loadNext();
    expect(optionDescriptions.value).toEqual({});
  });

  it("Mock 模式的选项应包含 description", async () => {
    const { loadNext, question } = useQuiz();

    await loadNext();
    // 验证每个选项都有 description
    for (const opt of question.value!.options) {
      expect(opt.description).toBeTruthy();
    }
  });
});
