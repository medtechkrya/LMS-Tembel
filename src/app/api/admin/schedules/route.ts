import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const schedules = await prisma.schedule.findMany({
    include: {
      student: { select: { id: true, name: true } },
      mentor: { select: { id: true, name: true } },
      days: true,
    },
    orderBy: { student: { name: 'asc' } },
  })
  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const { student_id, mentor_id, area, mode, jam, days } = await req.json()

  if (!student_id || !mentor_id) {
    return NextResponse.json({ error: 'student_id and mentor_id are required' }, { status: 400 })
  }

  const schedule = await prisma.schedule.create({
    data: {
      student_id,
      mentor_id,
      area: area || null,
      mode: mode || 'online',
      jam: jam || null,
      days: {
        create: (days as string[]).map((day: string) => ({ day })),
      },
    },
    include: {
      student: { select: { id: true, name: true } },
      mentor: { select: { id: true, name: true } },
      days: true,
    },
  })

  return NextResponse.json(schedule, { status: 201 })
}
