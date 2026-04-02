import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useQuiz } from "../useQuiz";

// Mock useMockStore 返回 isMock = true（使用 mock 模式测试）
vi.mock("@/stores/useMockStore", () => ({
  useMockStore: () => ({
    isMock: { value: true },
    setMock: vi.fn(),
  }),
}));

// mock useCategories（mock 模式下不使用，但需要满足 import）
vi.mock("@/composables/useCategories", () => ({
  useCategories: () => ({
    selectedIds: { value: [] },
  }),
}));

describe("useQuiz (mock mode)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function getCorrectOptionId() {
    return 1;
  }

  function getWrongOptionId() {
    return 2;
  }

  it("loadNext 应加载题目并重置 optionDescriptions", async () => {
    const { loadNext, question, optionDescriptions, status } = useQuiz();

    await loadNext();

    expect(question.value).not.toBeNull();
    expect(question.value!.options).toHaveLength(2);
    expect(question.value!.options.map((option) => option.id)).toEqual([2, 1]);
    expect(optionDescriptions.value).toEqual({});
    expect(status.value).toBe("idle");
  });

  it("答对后应填充 optionDescriptions 并 1 秒后自动跳转", async () => {
    const { loadNext, choose, optionDescriptions, status, question } = useQuiz();

    await loadNext();
    const correctId = getCorrectOptionId();
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
    const wrongId = getWrongOptionId();
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
    const wrongId = getWrongOptionId();
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

  it("choose 返回正确结果对象", async () => {
    const { loadNext, choose, question } = useQuiz();

    await loadNext();
    const correctId = getCorrectOptionId();
    const result = await choose(correctId);

    expect(result).toEqual({
      correct: true,
      correctOptionId: correctId,
      explanation: question.value!.explanation,
    });
  });

  it("choose 答错返回错误结果", async () => {
    const { loadNext, choose, question } = useQuiz();

    await loadNext();
    const wrongId = getWrongOptionId();
    const result = await choose(wrongId);

    expect(result).toEqual({
      correct: false,
      correctOptionId: getCorrectOptionId(),
      explanation: question.value!.explanation,
    });
  });

  it("choose 无题目时直接返回", async () => {
    const { choose, selected } = useQuiz();

    const result = await choose(1);

    expect(result).toBeUndefined();
    expect(selected.value).toBeNull();
  });

  it("loadNext 连续调用不会出错", async () => {
    const { loadNext, question } = useQuiz();

    // 连续调用两次 loadNext（mock 模式是同步的）
    await loadNext();
    const firstQuestion = question.value;

    await loadNext();
    // 两次都正常加载
    expect(question.value).not.toBeNull();
    expect(question.value).toEqual(firstQuestion);
  });

  it("explanation 计算属性", async () => {
    const { loadNext, explanation } = useQuiz();

    // 未加载时为 null
    expect(explanation.value).toBeNull();

    await loadNext();
    expect(explanation.value).toBe("200 表示请求成功");
  });

  it("loadNext 重置 selected、correctOptionId、error", async () => {
    const { loadNext, selected, correctOptionId, error, choose, question } = useQuiz();

    await loadNext();
    // 答题设置状态
    await choose(getWrongOptionId());
    expect(selected.value).not.toBeNull();
    expect(correctOptionId.value).not.toBeNull();

    // 重新加载后重置
    await loadNext();
    expect(selected.value).toBeNull();
    expect(correctOptionId.value).toBeNull();
    expect(error.value).toBeNull();
  });

  it("选项无 description 时 optionDescriptions 中不包含该选项", async () => {
    const { loadNext, choose, optionDescriptions, question } = useQuiz();

    await loadNext();
    // 手动移除第一个选项的 description
    const correctOption = question.value!.options.find((option) => option.id === getCorrectOptionId())!;
    correctOption.description = undefined;
    await choose(correctOption.id);

    // 第一个选项无 description，不应在 map 中
    expect(optionDescriptions.value[1]).toBeUndefined();
    // 第二个选项有 description
    expect(optionDescriptions.value[2]).toBeTruthy();
  });
});
