import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { name, status, core_skill, country, language, photo_path } = body

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
      ...(core_skill !== undefined && { core_skill: core_skill?.trim() || null }),
      ...(country !== undefined && { country: country?.trim() || null }),
      ...(language !== undefined && { language: language?.trim() || null }),
      ...(photo_path !== undefined && { photo_path: photo_path?.trim() || null }),
    },
  })
  return NextResponse.json(mentor)
}
