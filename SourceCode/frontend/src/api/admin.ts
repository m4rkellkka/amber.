import { api } from './client'
import type { Order, OrderStatus, ProductType } from './types'

export interface AdminSummary {
  ordersByStatus: Record<OrderStatus, number>
  totalOrders: number
  revenue: number
  pipeline: number
  openSlots: number
  unansweredQuestions: number
  activeProducts: number
}

export interface AdminProduct {
  id: number
  name: string
  slug: string
  type: ProductType
  price: number
  deliveryDays: number | null
  stock: number | null
  allowMultiple: boolean
  active: boolean
}

export interface ProductForm {
  type: ProductType
  name: string
  slug: string
  shortDescription: string
  description: string
  price: number | null
  deliveryDays: number | null
  features: string[]
  stock: number | null
  allowMultiple: boolean
}

export interface AdminQuestion {
  id: number
  productId: number
  productName: string
  productSlug: string
  text: string
  authorName: string | null
  authorEmail: string
  createdAt: string
  answer: string | null
  answeredAt: string | null
}

export interface AdminOrder {
  order: Order
  customerName: string | null
  customerEmail: string
}

export const adminApi = {
  summary: () => api.get<AdminSummary>('/api/admin/summary').then((r) => r.data),

  products: () => api.get<AdminProduct[]>('/api/admin/products').then((r) => r.data),
  createProduct: (form: ProductForm) => api.post<AdminProduct>('/api/admin/products', form).then((r) => r.data),
  updateStock: (id: number, stock: number | null) =>
    api.put<AdminProduct>(`/api/admin/products/${id}/stock`, { stock }).then((r) => r.data),
  setActive: (id: number, active: boolean) =>
    api.put<AdminProduct>(`/api/admin/products/${id}/active`, { active }).then((r) => r.data),

  questions: (unanswered: boolean) =>
    api.get<AdminQuestion[]>('/api/admin/questions', { params: { unanswered } }).then((r) => r.data),
  answer: (id: number, answer: string) =>
    api.put<AdminQuestion>(`/api/admin/questions/${id}/answer`, { answer }).then((r) => r.data),

  orders: () => api.get<AdminOrder[]>('/api/admin/orders').then((r) => r.data),
  changeStatus: (id: number, status: OrderStatus) =>
    api.put<AdminOrder>(`/api/admin/orders/${id}/status`, { status }).then((r) => r.data),
}
