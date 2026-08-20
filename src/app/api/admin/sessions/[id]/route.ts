import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({ where: { id: params.id } })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.session.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
