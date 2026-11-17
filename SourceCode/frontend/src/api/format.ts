const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** 300 -> "$300" */
export function formatUsd(value: number): string {
  return usd.format(value)
}

/** Current month name in Istanbul, e.g. "December". */
export function currentMonth(): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Europe/Istanbul' }).format(new Date())
}
