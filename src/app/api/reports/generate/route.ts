import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getAvailablePeriods } from '@/lib/period'

export async function POST(req: NextRequest) {
  const { student_id, period_key } = await req.json()
  if (!student_id) {
    return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  }

  const student = await prisma.student.findUnique({ where: { id: student_id } })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const periods = getAvailablePeriods()
  const period = period_key 
    ? periods.find(p => p.key === period_key) 
    : periods[0]

  if (!period) {
    return NextResponse.json({ error: 'Invalid period_key' }, { status: 400 })
  }

  // Return existing report if one already exists for this student+period (with ±3 day tolerance for timezone offsets)
  const windowStart = new Date(period.start.getTime() - 3 * 24 * 60 * 60 * 1000)
  const windowEnd = new Date(period.start.getTime() + 3 * 24 * 60 * 60 * 1000)

  const existing = await prisma.report.findFirst({
    where: {
      student_id,
      period_start: { gte: windowStart, lte: windowEnd },
    },
  })
  if (existing) {
    return NextResponse.json(existing)
  }

  const cookieMentorId = cookies().get('mentor_session')?.value
  const mentorId = cookieMentorId && cookieMentorId !== 'true' ? cookieMentorId : null

  const report = await prisma.report.create({
    data: {
      student_id,
      mentor_id: mentorId,
      period_start: period.start,
      period_end: period.end,
      status: 'draft',
    },
  })

  return NextResponse.json(report, { status: 201 })
}
