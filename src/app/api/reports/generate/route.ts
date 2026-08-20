import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDate()
  let start: Date, end: Date
  if (day >= 26) {
    start = new Date(now.getFullYear(), now.getMonth(), 26)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 25, 23, 59, 59)
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 26)
    end = new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59)
  }
  return { start, end }
}

export async function POST(req: NextRequest) {
  const { student_id } = await req.json()
  if (!student_id) {
    return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  }

  const student = await prisma.student.findUnique({ where: { id: student_id } })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const period = getCurrentPeriod()

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
