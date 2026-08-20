import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status, note, date } = await req.json()

  const session = await prisma.scheduleSession.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(note   !== undefined && { note: note || null }),
      ...(date   !== undefined && { date: new Date(date) }),
    },
  })

  return NextResponse.json(session)
}
