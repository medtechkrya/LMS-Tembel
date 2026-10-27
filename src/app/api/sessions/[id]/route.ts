import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, name: true, program: true } },
      mentor: { select: { id: true, name: true } },
    },
  })

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(session)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const cookieMentorId = cookieStore.get('mentor_session')?.value
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'

  if (!cookieMentorId && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized / Silakan login terlebih dahulu' }, { status: 401 })
  }

  const existing = await prisma.session.findUnique({
    where: { id: params.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Session not found / Sesi tidak ditemukan' }, { status: 404 })
  }

  // Authorization check: only the mentor who created the recap (or an admin) can edit
  if (!isAdmin && existing.mentor_id && existing.mentor_id !== cookieMentorId) {
    return NextResponse.json(
      { error: 'You can only edit your own session recaps / Hanya mentor pembuat rekap yang dapat mengubah sesi ini' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { student_id, date, attendance, activity, observation, photo_path, next_step } = body

  if (activity !== undefined && !activity.trim()) {
    return NextResponse.json({ error: 'Activity is required / Aktivitas wajib diisi' }, { status: 400 })
  }

  if (observation !== undefined && !observation.trim()) {
    return NextResponse.json({ error: 'Observation is required / Observasi wajib diisi' }, { status: 400 })
  }

  const updated = await prisma.session.update({
    where: { id: params.id },
    data: {
      ...(student_id ? { student_id } : {}),
      ...(date ? { date: new Date(date) } : {}),
      ...(attendance ? { attendance } : {}),
      ...(activity !== undefined ? { activity: activity.trim() } : {}),
      ...(observation !== undefined ? { observation: observation.trim() } : {}),
      ...(photo_path ? { photo_path } : {}),
      ...(next_step !== undefined ? { next_step: next_step ? next_step.trim() : null } : {}),
    },
    include: {
      student: { select: { id: true, name: true } },
      mentor: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(updated)
}
