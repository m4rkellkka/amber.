import { api } from './client'
import type { Product } from './types'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/api/products')
  return data
}

export async function fetchProduct(slug: string): Promise<Product> {
  const { data } = await api.get<Product>(`/api/products/${encodeURIComponent(slug)}`)
  return data
}
