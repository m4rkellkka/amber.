const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** 300 -> "$300" */
export function formatUsd(value: number): string {
  return usd.format(value)
}

/** Current month name in Istanbul, e.g. "December". */
export function currentMonth(): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Europe/Istanbul' }).format(new Date())
}

const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Istanbul' })

/** "2026-11-17T14:02:00Z" -> "17 Nov 2026" */
export function formatDate(iso: string): string {
  return date.format(new Date(iso))
}
