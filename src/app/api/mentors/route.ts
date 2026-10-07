import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const mentors = await prisma.mentor.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(mentors)
}

export async function POST(req: NextRequest) {
  const { name, core_skill, country, language, photo_path } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const mentor = await prisma.mentor.create({ 
    data: { 
      name: name.trim(),
      core_skill: core_skill?.trim() || null,
      country: country?.trim() || null,
      language: language?.trim() || null,
      photo_path: photo_path?.trim() || null,
    } 
  })
  return NextResponse.json(mentor, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  await prisma.mentor.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
