export interface Period {
  key: string
  label: string
  start: Date
  end: Date
}

/**
 * Returns the standard format for a period, e.g., "Aug 26 - Sep 25, 2026"
 */
export function formatPeriod(start: Date | string, end: Date | string): string {
  const s = new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const e = new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${s} – ${e}`
}

/**
 * Returns the period key for a given date.
 */
export function getPeriodKeyFromDate(d: Date): string {
  let year = d.getUTCFullYear()
  let month = d.getUTCMonth() + 1
  if (d.getUTCDate() >= 26) {
    month += 1
    if (month > 12) { month = 1; year++ }
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Checks whether two period_start dates belong to the same monthly period
 * (tolerant of local vs UTC timezone offsets).
 */
export function isSamePeriodStart(a: Date | string, b: Date | string): boolean {
  const t1 = new Date(a).getTime()
  const t2 = new Date(b).getTime()
  return Math.abs(t1 - t2) <= 3 * 24 * 60 * 60 * 1000
}

/**
 * Returns a list of available periods. 
 * Uses UTC timestamps so localhost and Vercel always produce the exact same dates.
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
    const start = new Date(Date.UTC(currentStartYear, currentStartMonth - i, 26, 0, 0, 0, 0))
    
    // The end date is always the 25th of the next month relative to start
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 25, 23, 59, 59, 999))
    
    const key = `${end.getUTCFullYear()}-${(end.getUTCMonth() + 1).toString().padStart(2, '0')}`
    
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

/**
 * Returns the default period for Monthly Reports.
 * Mentors write monthly reports for a learning cycle (e.g. Sep 26 – Oct 25).
 *
 * Switching rule:
 * Default berganti setiap tanggal 1 awal bulan:
 * - Selama bulan Oktober (1–31 Okt): default adalah periode Sep 26 – Oct 25
 * - Selama bulan November (1–30 Nov): default adalah periode Oct 26 – Nov 25
 * - Selama bulan Desember (1–31 Des): default adalah periode Nov 26 – Dec 25
 *
 * Dengan begitu, mentor yang sesinya selesai sebelum tanggal 25 tidak perlu menunggu,
 * dan di tanggal 26–31 sistem tetap default di periode bulan tersebut tanpa loncat duluan.
 */
export function getDefaultReportPeriod(now = new Date()): Period {
  const d = new Date(now)
  const endYear = d.getFullYear()
  const endMonth = d.getMonth() // 0-indexed: 0 = Jan, 9 = Oct, 10 = Nov

  const start = new Date(Date.UTC(endYear, endMonth - 1, 26, 0, 0, 0, 0))
  const end = new Date(Date.UTC(endYear, endMonth, 25, 23, 59, 59, 999))
  const key = `${end.getUTCFullYear()}-${(end.getUTCMonth() + 1).toString().padStart(2, '0')}`

  return {
    key,
    label: formatPeriod(start, end),
    start,
    end,
  }
}

