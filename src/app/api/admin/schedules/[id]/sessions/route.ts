import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url)
  const periodStart = searchParams.get('period_start')
  const periodEnd   = searchParams.get('period_end')

  const where: Parameters<typeof prisma.scheduleSession.findMany>[0]['where'] = {
    schedule_id: params.id,
  }

  if (periodStart && periodEnd) {
    where.date = {
      gte: new Date(periodStart),
      lte: new Date(periodEnd),
    }
  }

  const sessions = await prisma.scheduleSession.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(sessions)
}
