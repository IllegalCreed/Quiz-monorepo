export type Option = { id: number; text: string }
export type Question = { id: number; stem: string; options: Option[]; explanation?: string; tags?: string[] }

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export async function fetchQuestions(limit = 1): Promise<Question[]> {
  const res = await fetch(`${BASE}/questions?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch questions')
  return res.json()
}

export async function submitAnswer(questionId: number, selectedOptionId: number, elapsedMs?: number) {
  const res = await fetch(`${BASE}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, selectedOptionId, elapsedMs }),
  })
  if (!res.ok) throw new Error('Failed to submit answer')
  return res.json()
}
