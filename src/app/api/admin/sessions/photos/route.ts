import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const student_id = searchParams.get('student_id')
  const period = searchParams.get('period') // YYYY-MM = period_end month

  if (!student_id || !period || !/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ error: 'student_id and period required' }, { status: 400 })
  }

  const [year, month] = period.split('-').map(Number)
  const periodStart = new Date(year, month - 2, 26)
  const periodEnd = new Date(year, month - 1, 25, 23, 59, 59, 999)

  const sessions = await prisma.session.findMany({
    where: {
      student_id,
      date: { gte: periodStart, lte: periodEnd },
      photo_path: { not: null },
    },
  })

  let deleted = 0

  for (const session of sessions) {
    if (!session.photo_path) continue
    const filePath = path.join(process.cwd(), 'public', session.photo_path)
    try {
      await unlink(filePath)
    } catch {
      // file already missing — continue
    }
    await prisma.session.update({
      where: { id: session.id },
      data: { photo_path: null },
    })
    deleted++
  }

  return NextResponse.json({ ok: true, deleted })
}
