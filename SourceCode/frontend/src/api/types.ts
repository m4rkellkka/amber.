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
