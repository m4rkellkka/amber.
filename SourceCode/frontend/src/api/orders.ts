import { api } from './client'
import type { CreateOrderRequest, Order } from './types'

export async function placeOrder(request: CreateOrderRequest): Promise<Order> {
  const { data } = await api.post<Order>('/api/orders', request)
  return data
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/api/orders/my')
  return data
}
