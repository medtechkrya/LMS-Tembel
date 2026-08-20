import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const student_id = searchParams.get('student_id')
  const period = searchParams.get('period') // YYYY-MM = period_end month

  const where: Record<string, unknown> = {}

  if (student_id) {
    where.student_id = student_id
  }

  if (period) {
    const [year, month] = period.split('-').map(Number)
    // period_start = 26th of previous month
    const periodStart = new Date(year, month - 2, 26)
    // period_end = 25th of this month, end of day
    const periodEnd = new Date(year, month - 1, 25, 23, 59, 59, 999)
    where.date = { gte: periodStart, lte: periodEnd }
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      student: { select: { name: true } },
      mentor: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(sessions)
}
