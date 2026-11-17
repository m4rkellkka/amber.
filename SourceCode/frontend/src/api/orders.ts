import { api } from './client'
import type { CreateOrderRequest, Order } from './types'

export async function placeOrder(request: CreateOrderRequest): Promise<Order> {
  const { data } = await api.post<Order>('/api/orders', request)
  return data
}
