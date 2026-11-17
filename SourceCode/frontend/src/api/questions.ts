import { api } from './client'
import type { Question } from './types'

export async function fetchQuestions(productId: number): Promise<Question[]> {
  const { data } = await api.get<Question[]>(`/api/products/${productId}/questions`)
  return data
}

export async function askQuestion(productId: number, text: string): Promise<Question> {
  const { data } = await api.post<Question>(`/api/products/${productId}/questions`, { text })
  return data
}
