import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, name: true } },
      mentor: { select: { id: true, name: true } },
      days: true,
    },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(schedule)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { student_id, mentor_id, area, mode, jam, days } = await req.json()

  // Replace days: delete existing, create new ones
  await prisma.scheduleDay.deleteMany({ where: { schedule_id: params.id } })

  const schedule = await prisma.schedule.update({
    where: { id: params.id },
    data: {
      ...(student_id !== undefined && { student_id }),
      ...(mentor_id !== undefined && { mentor_id }),
      ...(area !== undefined && { area: area || null }),
      ...(mode !== undefined && { mode }),
      ...(jam !== undefined && { jam: jam || null }),
      ...(days !== undefined && {
        days: { create: (days as string[]).map((day: string) => ({ day })) },
      }),
    },
    include: {
      student: { select: { id: true, name: true } },
      mentor: { select: { id: true, name: true } },
      days: true,
    },
  })

  return NextResponse.json(schedule)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.scheduleDay.deleteMany({ where: { schedule_id: params.id } })
  await prisma.scheduleSession.deleteMany({ where: { schedule_id: params.id } })
  await prisma.schedule.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
