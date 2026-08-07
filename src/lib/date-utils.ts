// Shared date utilities for UP ISHA
// Handles both '18-20 Oct 2026' (static format) and ISO date strings

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export interface ParsedDate {
  year: number
  month: number // 0-indexed
  days: number[]
}

export function parseEventDates(dateStr: string): ParsedDate[] {
  const results: ParsedDate[] = []
  if (!dateStr) return results

  // ISO format: YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    results.push({ year: +iso[1], month: +iso[2] - 1, days: [+iso[3]] })
    return results
  }

  // Range: "DD-DD Mon YYYY"
  const range = dateStr.match(/^(\d{1,2})-(\d{1,2})\s+(\w{3})\s+(\d{4})$/)
  if (range) {
    const m = MONTHS.indexOf(range[3])
    if (m !== -1) {
      const days: number[] = []
      for (let d = +range[1]; d <= +range[2]; d++) days.push(d)
      results.push({ year: +range[4], month: m, days })
    }
    return results
  }

  // Single: "DD Mon YYYY"
  const single = dateStr.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/)
  if (single) {
    const m = MONTHS.indexOf(single[2])
    if (m !== -1) results.push({ year: +single[3], month: m, days: [+single[1]] })
  }

  return results
}

export function formatEventDate(dateStr: string): string {
  const p = parseEventDates(dateStr)
  if (!p.length) return dateStr
  const { year, month, days } = p[0]
  const name = MONTHS_FULL[month]
  return days.length === 1 ? `${name} ${days[0]}, ${year}` : `${name} ${days[0]}-${days[days.length - 1]}, ${year}`
}

export function formatShortDate(dateStr: string): string {
  const p = parseEventDates(dateStr)
  if (!p.length) return dateStr
  const { month, days } = p[0]
  const name = MONTHS[month]
  return days.length === 1 ? `${days[0]} ${name}` : `${days[0]}-${days[days.length - 1]} ${name}`
}

export function isEventLive(dateStr: string): boolean {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  const p = parseEventDates(dateStr)
  if (!p.length) return false
  const { year, month, days } = p[0]
  return days.some((d) => {
    const dt = new Date(year, month, d)
    return dt >= start && dt <= end
  })
}

export function getEventDate(dateStr: string): Date | null {
  const p = parseEventDates(dateStr)
  if (!p.length) return null
  return new Date(p[0].year, p[0].month, p[0].days[0])
}

export function formatFullDate(dateStr: string): string {
  return formatEventDate(dateStr)
}