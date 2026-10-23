import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function generateUniquePin(): Promise<string> {
  const mentors = await prisma.mentor.findMany({ select: { pin: true } })
  const used = new Set(mentors.map(m => m.pin).filter(Boolean))
  let pin = ''
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000))
  } while (used.has(pin))
  return pin
}

export async function GET() {
  const mentors = await prisma.mentor.findMany({
    where: { status: { not: 'archived' } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(mentors)
}

export async function POST(req: NextRequest) {
  const { name, pin, core_skill, country, language, photo_path } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  let finalPin = pin ? String(pin).trim() : ''
  if (finalPin) {
    if (!/^\d{4,6}$/.test(finalPin)) {
      return NextResponse.json({ error: 'PIN must be 4 to 6 digits (numbers only)' }, { status: 400 })
    }
    const existing = await prisma.mentor.findFirst({
      where: { pin: finalPin },
    })
    if (existing) {
      return NextResponse.json(
        { error: `PIN "${finalPin}" is already used by mentor "${existing.name}". Please use a different PIN.` },
        { status: 400 }
      )
    }
  } else {
    finalPin = await generateUniquePin()
  }

  const mentor = await prisma.mentor.create({
    data: {
      name: name.trim(),
      pin: finalPin,
      core_skill: core_skill?.trim() || null,
      country: country?.trim() || null,
      language: language?.trim() || null,
      photo_path: photo_path?.trim() || null,
    },
  })
  return NextResponse.json(mentor, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  await prisma.mentor.update({
    where: { id },
    data: { status: 'archived', pin: null },
  })
  return NextResponse.json({ ok: true })
}
