export type Role = 'USER' | 'ADMIN'

export interface Me {
  id: number
  email: string
  displayName: string | null
  role: Role
}

/** Error body returned by the back-end (RFC 9457 problem detail). */
export interface Problem {
  status: number
  title: string
  detail?: string
  fieldErrors?: Record<string, string>
}

export type ProductType = 'PACKAGE' | 'ADDON'

export interface Product {
  id: number
  name: string
  slug: string
  shortDescription: string
  description: string | null
  type: ProductType
  price: number
  deliveryDays: number | null
  features: string[]
  /** Open slots this month; null = unlimited. */
  stock: number | null
  allowMultiple: boolean
}

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface OrderItem {
  productId: number
  productName: string
  type: ProductType
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: number
  status: OrderStatus
  totalPrice: number
  brief: string | null
  createdAt: string
  items: OrderItem[]
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[]
  brief: string
}

export interface Question {
  id: number
  text: string
  /** First name only. */
  authorName: string
  createdAt: string
  answer: string | null
  answeredAt: string | null
  /** True when the viewer asked it. */
  mine: boolean
}
