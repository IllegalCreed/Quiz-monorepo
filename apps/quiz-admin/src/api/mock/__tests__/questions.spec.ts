/**
 * questions mock API 单元测试
 * 每个测试通过 vi.resetModules() 获得独立的 mockQuestions 状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("questions mock API", () => {
  // 每次测试前重置模块，获得全新的 mockQuestions 数组和 nextId
  let getQuestions: (typeof import("../questions"))["getQuestions"];
  let getQuestion: (typeof import("../questions"))["getQuestion"];
  let createQuestion: (typeof import("../questions"))["createQuestion"];
  let updateQuestion: (typeof import("../questions"))["updateQuestion"];
  let deleteQuestion: (typeof import("../questions"))["deleteQuestion"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../questions");
    getQuestions = module.getQuestions;
    getQuestion = module.getQuestion;
    createQuestion = module.createQuestion;
    updateQuestion = module.updateQuestion;
    deleteQuestion = module.deleteQuestion;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getQuestions ──────────────────────────────────────────────────────────

  describe("getQuestions", () => {
    it("无参数时返回所有题目", async () => {
      const p = getQuestions();
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(5);
    });

    it("每道题包含必要字段", async () => {
      const p = getQuestions();
      await vi.runAllTimersAsync();
      const { items } = await p;
      for (const item of items) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("stem");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("options");
        expect(item).toHaveProperty("deletedAt");
      }
    });

    it("关键词过滤：匹配题干", async () => {
      const p = getQuestions({ keyword: "null" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((q) => q.stem.includes("null"))).toBe(true);
    });

    it("关键词过滤：无匹配时返回空", async () => {
      const p = getQuestions({ keyword: "这是绝对不存在的关键词XYZABC" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it("标签过滤：按标签匹配", async () => {
      // 初始题目中有"Vue"标签
      const p = getQuestions({ tag: "Vue" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((q) => q.tags?.includes("Vue"))).toBe(true);
    });

    it("标签过滤：不存在的标签返回空", async () => {
      const p = getQuestions({ tag: "不存在的标签" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(0);
    });

    it("分页：page=2, pageSize=2 返回第 3-4 题", async () => {
      const p = getQuestions({ page: 2, pageSize: 2 });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(5);
    });

    it("软删除的题目不出现在列表中", async () => {
      // 先删除 id=1 的题目
      const dp = deleteQuestion(1);
      await vi.runAllTimersAsync();
      await dp;

      const lp = getQuestions();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.total).toBe(4);
      expect(result.items.find((q) => q.id === 1)).toBeUndefined();
    });
  });

  // ── getQuestion ───────────────────────────────────────────────────────────

  describe("getQuestion", () => {
    it("返回指定 id 的题目详情", async () => {
      const p = getQuestion(1);
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.id).toBe(1);
      expect(question.options).toBeDefined();
      expect(question.options.length).toBeGreaterThan(0);
    });

    it("返回副本，修改不影响内部状态", async () => {
      const p1 = getQuestion(1);
      await vi.runAllTimersAsync();
      const q = await p1;
      const originalStem = q.stem;
      q.stem = "被修改了";

      const p2 = getQuestion(1);
      await vi.runAllTimersAsync();
      const q2 = await p2;
      expect(q2.stem).toBe(originalStem);
    });

    it("id 不存在时抛出错误", async () => {
      await Promise.all([
        expect(getQuestion(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("已软删除的题目无法获取", async () => {
      // 先删除题目
      const dp = deleteQuestion(1);
      await vi.runAllTimersAsync();
      await dp;

      await Promise.all([expect(getQuestion(1)).rejects.toThrow("不存在"), vi.runAllTimersAsync()]);
    });
  });

  // ── createQuestion ────────────────────────────────────────────────────────

  describe("createQuestion", () => {
    /** 合法的最小创建表单 */
    const validForm = {
      stem: "新题目：什么是 TypeScript？",
      type: "single_choice" as const,
      explanation: "",
      tags: [],
      categoryIds: [] as number[],
      options: [
        { text: "JavaScript 的超集", isCorrect: true, description: "" },
        { text: "CSS 框架", isCorrect: false, description: "" },
      ],
    };

    it("成功创建题目并返回完整题目数据", async () => {
      const p = createQuestion(validForm);
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.stem).toBe("新题目：什么是 TypeScript？");
      expect(question.id).toBeGreaterThan(0);
      expect(question.options).toHaveLength(2);
    });

    it("创建后题目出现在列表中", async () => {
      const cp = createQuestion(validForm);
      await vi.runAllTimersAsync();
      const newQ = await cp;

      const lp = getQuestions();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.items.find((q) => q.id === newQ.id)).toBeDefined();
    });

    it("没有正确答案时抛出错误", async () => {
      const form = {
        ...validForm,
        options: [
          { text: "选项A", isCorrect: false, description: "" },
          { text: "选项B", isCorrect: false, description: "" },
        ],
      };
      await Promise.all([
        expect(createQuestion(form)).rejects.toThrow("1 个正确答案"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("超过 1 个正确答案时抛出错误", async () => {
      const form = {
        ...validForm,
        options: [
          { text: "选项A", isCorrect: true, description: "" },
          { text: "选项B", isCorrect: true, description: "" },
        ],
      };
      await Promise.all([
        expect(createQuestion(form)).rejects.toThrow("1 个正确答案"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("tags 为空数组时存储为 null", async () => {
      const p = createQuestion({ ...validForm, tags: [] });
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.tags).toBeNull();
    });

    it("tags 非空时正常存储", async () => {
      const p = createQuestion({ ...validForm, tags: ["TypeScript", "后端"] });
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.tags).toContain("TypeScript");
    });
  });

  // ── updateQuestion ────────────────────────────────────────────────────────

  describe("updateQuestion", () => {
    it("成功更新题干", async () => {
      const p = updateQuestion(1, { stem: "修改后的题干" });
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.stem).toBe("修改后的题干");
    });

    it("更新选项时全量替换", async () => {
      const newOptions = [
        { text: "新选项A", isCorrect: true, description: "" },
        { text: "新选项B", isCorrect: false, description: "" },
      ];
      const p = updateQuestion(1, { options: newOptions });
      await vi.runAllTimersAsync();
      const question = await p;
      expect(question.options).toHaveLength(2);
      expect(question.options[0]!.text).toBe("新选项A");
    });

    it("更新选项时正确答案数量不为 1 时抛出错误", async () => {
      await Promise.all([
        expect(
          updateQuestion(1, {
            options: [
              { text: "A", isCorrect: false, description: "" },
              { text: "B", isCorrect: false, description: "" },
            ],
          }),
        ).rejects.toThrow("1 个正确答案"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("题目不存在时抛出错误", async () => {
      await Promise.all([
        expect(updateQuestion(9999, { stem: "不存在" })).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("不传 options 时只更新指定字段", async () => {
      // 先获取原始选项
      const gp = getQuestion(1);
      await vi.runAllTimersAsync();
      const original = await gp;
      const originalOptionsCount = original.options.length;

      // 只更新题干
      const up = updateQuestion(1, { stem: "只改题干" });
      await vi.runAllTimersAsync();
      const updated = await up;
      expect(updated.stem).toBe("只改题干");
      expect(updated.options).toHaveLength(originalOptionsCount);
    });
  });

  // ── deleteQuestion ────────────────────────────────────────────────────────

  describe("deleteQuestion", () => {
    it("软删除题目，返回成功消息", async () => {
      const p = deleteQuestion(1);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toMatchObject({ message: "题目删除成功" });
    });

    it("删除后题目不出现在列表中", async () => {
      const dp = deleteQuestion(1);
      await vi.runAllTimersAsync();
      await dp;

      const lp = getQuestions();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.items.find((q) => q.id === 1)).toBeUndefined();
    });

    it("删除不存在的题目时抛出错误", async () => {
      await Promise.all([
        expect(deleteQuestion(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("已删除的题目再次删除时抛出错误", async () => {
      const dp1 = deleteQuestion(1);
      await vi.runAllTimersAsync();
      await dp1;

      await Promise.all([
        expect(deleteQuestion(1)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
