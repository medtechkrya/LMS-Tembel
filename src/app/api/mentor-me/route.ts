import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const mentorId = cookies().get('mentor_session')?.value
  if (!mentorId || mentorId === 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    select: { id: true, name: true, status: true, photo_path: true },
  })

  if (!mentor || mentor.status !== 'active') {
    cookies().delete('mentor_session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(mentor)
}
