import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sessions = await prisma.session.findMany({
    include: { student: { select: { name: true } }, mentor: { select: { name: true } } },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { student_id, mentor_id, date, attendance, activity, observation, photo_path, next_step } = body

  const cookieMentorId = cookies().get('mentor_session')?.value
  const finalMentorId = cookieMentorId && cookieMentorId !== 'true' ? cookieMentorId : mentor_id

  if (!student_id || !finalMentorId || !date || !attendance || !activity || !observation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!photo_path) {
    return NextResponse.json(
      { error: 'Session photo is required / Foto sesi wajib diunggah' },
      { status: 400 }
    )
  }

  const session = await prisma.session.create({
    data: {
      student_id,
      mentor_id: finalMentorId,
      date: new Date(date),
      attendance,
      activity,
      observation,
      photo_path,
      next_step: next_step || null,
    },
  })

  return NextResponse.json(session, { status: 201 })
}
