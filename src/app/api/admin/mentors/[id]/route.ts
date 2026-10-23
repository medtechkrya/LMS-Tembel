import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { name, pin, status, core_skill, country, language, photo_path } = body

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (status !== undefined && status !== 'active' && status !== 'inactive') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  let cleanPin: string | undefined = undefined
  if (pin !== undefined) {
    cleanPin = String(pin).trim()
    if (!/^\d{4,6}$/.test(cleanPin)) {
      return NextResponse.json({ error: 'PIN must be 4 to 6 digits (numbers only)' }, { status: 400 })
    }
    const existing = await prisma.mentor.findFirst({
      where: {
        pin: cleanPin,
        NOT: { id: params.id },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: `PIN "${cleanPin}" is already used by mentor "${existing.name}". Please use a different PIN.` },
        { status: 400 }
      )
    }
  }

  const mentor = await prisma.mentor.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(cleanPin !== undefined && { pin: cleanPin }),
      ...(status !== undefined && { status }),
      ...(core_skill !== undefined && { core_skill: core_skill?.trim() || null }),
      ...(country !== undefined && { country: country?.trim() || null }),
      ...(language !== undefined && { language: language?.trim() || null }),
      ...(photo_path !== undefined && { photo_path: photo_path?.trim() || null }),
    },
  })
  return NextResponse.json(mentor)
}
