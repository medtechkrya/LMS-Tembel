import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const reports = await prisma.report.findMany({
    include: { student: { select: { name: true } }, mentor: { select: { name: true } } },
    orderBy: { period_start: 'desc' },
  })
  return NextResponse.json(reports)
}
