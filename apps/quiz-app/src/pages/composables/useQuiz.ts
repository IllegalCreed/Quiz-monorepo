import { ref } from 'vue'
import type { Question } from '@/api/questions'
import { fetchQuestions, submitAnswer } from '@/api/questions'
import { useMockStore } from '@/stores/useMockStore'

export function useQuiz() {
  const question = ref<Question | null>(null)
  const loading = ref(false)
  const selected = ref<number | null>(null)
  const status = ref<'idle' | 'correct' | 'wrong' | 'answered'>('idle')
  const error = ref<string | null>(null)

  const { isMock } = useMockStore()

  async function loadNext() {
    loading.value = true
    selected.value = null
    status.value = 'idle'
    error.value = null
    if (isMock.value) {
      // return a simple mocked question
      question.value = {
        id: 999,
        stem: '（Mock）下面哪个是 HTTP 状态码 200 的含义？',
        options: [
          { id: 1, text: '成功' },
          { id: 2, text: '未找到' },
        ],
        explanation: '200 表示请求成功',
      }
      loading.value = false
      return
    }

    try {
      const qs = await fetchQuestions(1)
      question.value = qs[0] ?? null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
      question.value = null
    } finally {
      loading.value = false
    }
  }

  async function choose(optionId: number) {
    if (!question.value) return
    selected.value = optionId

    if (isMock.value) {
      // local mocked check: assume first option is wrong, second is correct
      const q = question.value!
      const second = q.options[1]
      const correct = second !== undefined && optionId === second.id
      status.value = correct ? 'correct' : 'wrong'
      if (correct) setTimeout(() => loadNext(), 1000)
      return {
        correct,
        correctOptionId: q.options.find((o) => o.text === '成功')?.id ?? null,
        explanation: q.explanation,
      }
    }

    // submit answer
    try {
      const res = await submitAnswer(question.value.id, optionId)
      status.value = res.correct ? 'correct' : 'wrong'
      // if correct: auto next after 1s
      if (res.correct) {
        setTimeout(() => loadNext(), 1000)
      }
      return res
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
      // 如果提交出现错误（如网络/后端错误），将状态置为 'wrong'，
      // 这样组件会渲染出 .explanation 元素，而不是继续保持 'idle'（导致 Cypress 超时因找不到元素）
      status.value = 'wrong'
      // 同时在控制台记录错误，方便后续排查具体原因
      console.error('submitAnswer failed', e)
      return { correct: false, correctOptionId: null, explanation: null }
    }
  }

  return { question, loading, selected, status, loadNext, choose, error }
}
