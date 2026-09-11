export interface Period {
  key: string
  label: string
  start: Date
  end: Date
}

/**
 * Returns the standard format for a period, e.g., "Aug 26 - Sep 25, 2026"
 */
export function formatPeriod(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
}

/**
 * Returns the period key for a given date.
 */
export function getPeriodKeyFromDate(d: Date): string {
  let year = d.getFullYear()
  let month = d.getMonth() + 1
  if (d.getDate() >= 26) {
    month += 1
    if (month > 12) { month = 1; year++ }
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Returns a list of available periods. 
 * By default, goes back a certain number of months.
 */
export function getAvailablePeriods(monthsBack = 6): Period[] {
  const periods: Period[] = []
  const now = new Date()

  // Determine the current active period's starting month and year
  let currentStartMonth = now.getMonth()
  let currentStartYear = now.getFullYear()

  if (now.getDate() < 26) {
    currentStartMonth -= 1
    if (currentStartMonth < 0) {
      currentStartMonth = 11
      currentStartYear -= 1
    }
  }

  // Go back month by month
  for (let i = 0; i <= monthsBack; i++) {
    const start = new Date(currentStartYear, currentStartMonth - i, 26)
    
    // The end date is always the 25th of the next month relative to start
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 25, 23, 59, 59, 999)
    
    const key = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}`
    
    periods.push({
      key,
      label: formatPeriod(start, end),
      start,
      end
    })
  }

  return periods
}

/**
 * Returns the currently active period.
 */
export function getCurrentPeriod(): Period {
  return getAvailablePeriods(0)[0]
}
