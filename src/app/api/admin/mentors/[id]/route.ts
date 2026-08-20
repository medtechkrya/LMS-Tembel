import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { name, status } = body

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (status !== undefined && status !== 'active' && status !== 'inactive') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const mentor = await prisma.mentor.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(status !== undefined && { status }),
    },
  })
  return NextResponse.json(mentor)
}
