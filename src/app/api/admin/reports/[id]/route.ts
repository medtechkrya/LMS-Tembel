import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = await prisma.report.findUnique({ where: { id: params.id } })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.report.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
