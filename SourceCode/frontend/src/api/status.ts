import type { OrderStatus } from './types'

/** Client-facing names of order statuses. */
export const statusLabel: Record<OrderStatus, string> = {
  NEW: 'Received',
  IN_PROGRESS: 'In progress',
  DONE: 'Launched',
  CANCELLED: 'Cancelled',
}
