import { ref, computed } from "vue";
import type { Question, AnswerResult } from "@/types/question";
import { fetchQuestions, submitAnswer } from "@/api/questions";
import { useMockStore } from "@/stores/useMockStore";
import { useCategories } from "@/composables/useCategories";

export function useQuiz() {
  const question = ref<Question | null>(null);
  const loading = ref(false);
  const selected = ref<number | null>(null);
  const status = ref<"idle" | "correct" | "wrong" | "answered">("idle");
  const correctOptionId = ref<number | null>(null);
  const error = ref<string | null>(null);
  /** 答题后每个选项的解析描述（optionId -> description） */
  const optionDescriptions = ref<Record<number, string>>({});

  const { isMock } = useMockStore();
  const { selectedIds: categoryIds } = useCategories();

  async function loadNext() {
    // 防止并发请求：如果正在加载，直接返回
    if (loading.value) {
      return;
    }

    loading.value = true;
    selected.value = null;
    correctOptionId.value = null;
    error.value = null;
    optionDescriptions.value = {};

    if (isMock.value) {
      // return a simple mocked question
      question.value = {
        id: 999,
        stem: "（Mock）下面哪个是 HTTP 状态码 200 的含义？",
        options: [
          { id: 1, text: "成功", description: "200 表示请求成功，服务器正常返回了数据。" },
          { id: 2, text: "未找到", description: "「未找到」对应 404 状态码，不是 200。" },
        ],
        explanation: "200 表示请求成功",
      };
      status.value = "idle";
      loading.value = false;
      return;
    }

    try {
      const ids = categoryIds.value.length ? categoryIds.value : undefined;
      const qs = await fetchQuestions(1, ids);
      question.value = qs[0] ?? null;
      status.value = "idle";
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
      question.value = null;
      status.value = "idle";
    } finally {
      loading.value = false;
    }
  }

  /**
   * 从 API 返回的选项数组中提取 description 映射
   */
  function _extractDescriptions(options: AnswerResult["options"]) {
    const map: Record<number, string> = {};
    for (const o of options) {
      if (o.description) {
        map[o.id] = o.description;
      }
    }
    return map;
  }

  async function choose(optionId: number) {
    if (!question.value) return;
    selected.value = optionId;

    if (isMock.value) {
      const q = question.value!;
      const first = q.options[0];
      const correct = first !== undefined && optionId === first.id;
      const correctId = first?.id ?? null;
      correctOptionId.value = correctId;
      status.value = correct ? "correct" : "wrong";
      // Mock 模式下从题目选项中提取描述
      const map: Record<number, string> = {};
      for (const o of q.options) {
        if (o.description) map[o.id] = o.description;
      }
      optionDescriptions.value = map;
      if (correct) setTimeout(() => loadNext(), 1000);
      return {
        correct,
        correctOptionId: correctId,
        explanation: q.explanation,
      };
    }

    // submit answer
    try {
      const res = await submitAnswer(question.value.id, optionId);
      correctOptionId.value = res.correctOptionId ?? null;
      status.value = res.correct ? "correct" : "wrong";
      // 从返回结果中提取选项解析
      if (res.options) {
        optionDescriptions.value = _extractDescriptions(res.options);
      }
      // 答对：1 秒后自动跳转下一题
      if (res.correct) {
        setTimeout(() => loadNext(), 1000);
      }
      return res;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e);
      // 如果提交出现错误（如网络/后端错误），将状态置为 'wrong'，
      // 这样组件会渲染出解析区域，而不是继续保持 'idle'（导致 Cypress 超时因找不到元素）
      status.value = "wrong";
      correctOptionId.value = null;
      // 同时在控制台记录错误，方便后续排查具体原因
      console.error("submitAnswer failed", e);
      return { correct: false, correctOptionId: null, explanation: null, options: [] };
    }
  }

  /** 当前题目的整体解析（答题后展示） */
  const explanation = computed(() => question.value?.explanation ?? null);

  return {
    question,
    loading,
    selected,
    status,
    loadNext,
    choose,
    error,
    correctOptionId,
    optionDescriptions,
    explanation,
  };
}
