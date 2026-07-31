import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Map Indonesian day names to JS getDay() values (0=Sun)
const DAY_MAP: Record<string, number> = {
  Minggu: 0, Senin: 1, Selasa: 2, Rabu: 3,
  Kamis: 4, Jumat: 5, Sabtu: 6,
}

function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDate()
  if (day >= 26) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 26),
      end:   new Date(now.getFullYear(), now.getMonth() + 1, 25, 23, 59, 59, 999),
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 26),
    end:   new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59, 999),
  }
}

async function fetchHolidays(month: number, year: number): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  try {
    const mm = String(month).padStart(2, '0')
    const res = await fetch(`https://api-harilibur.vercel.app/api?month=${mm}&year=${year}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return map
    const data = await res.json() as Array<{ holiday_date: string; holiday_name: string; is_national_holiday: boolean }>
    for (const h of data) {
      if (h.is_national_holiday) {
        // holiday_date is "YYYY-MM-DD"
        map.set(h.holiday_date, h.holiday_name)
      }
    }
  } catch {
    // If holiday API is down, continue without holiday data
  }
  return map
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.id },
    include: { days: true },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { start, end } = getCurrentPeriod()

  // Fetch holidays for both months in the period
  const startYear  = start.getFullYear()
  const startMonth = start.getMonth() + 1 // 1-indexed
  const endYear    = end.getFullYear()
  const endMonth   = end.getMonth() + 1

  const [holMap1, holMap2] = await Promise.all([
    fetchHolidays(startMonth, startYear),
    startMonth !== endMonth ? fetchHolidays(endMonth, endYear) : Promise.resolve(new Map<string, string>()),
  ])
  const holidays = new Map([...holMap1, ...holMap2])

  // Fetch already-generated sessions for this schedule in this period
  const existing = await prisma.scheduleSession.findMany({
    where: {
      schedule_id: params.id,
      date: { gte: start, lte: end },
    },
    select: { date: true },
  })
  const existingDates = new Set(
    existing.map(s => s.date.toISOString().slice(0, 10))
  )

  // Collect target weekdays
  const targetDays = new Set(schedule.days.map(d => DAY_MAP[d.day]))

  // Walk every date in the period
  const toCreate: Array<{ schedule_id: string; date: Date; status: string; note: string | null }> = []
  const cursor = new Date(start)
  while (cursor <= end) {
    if (targetDays.has(cursor.getDay())) {
      const iso = cursor.toISOString().slice(0, 10) // YYYY-MM-DD
      if (!existingDates.has(iso)) {
        const holidayName = holidays.get(iso)
        toCreate.push({
          schedule_id: params.id,
          date:        new Date(cursor),
          status:      holidayName ? 'holiday' : 'scheduled',
          note:        holidayName ?? null,
        })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  if (toCreate.length > 0) {
    await prisma.scheduleSession.createMany({ data: toCreate })
  }

  const generated = toCreate.filter(s => s.status === 'scheduled').length
  const holidayCount = toCreate.filter(s => s.status === 'holiday').length

  return NextResponse.json({ generated, holidays: holidayCount, total: toCreate.length })
}
