import { NextRequest, NextResponse } from 'next/server'
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

  // Return existing report if one already exists for this student+period
  const existing = await prisma.report.findFirst({
    where: { student_id, period_start: period.start },
  })
  if (existing) {
    return NextResponse.json(existing)
  }

  const report = await prisma.report.create({
    data: {
      student_id,
      period_start: period.start,
      period_end: period.end,
      status: 'draft',
    },
  })

  return NextResponse.json(report, { status: 201 })
}
