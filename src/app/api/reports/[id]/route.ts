import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { student: true, mentor: true },
  })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sessions = await prisma.session.findMany({
    where: {
      student_id: report.student_id,
      date: { gte: report.period_start, lte: report.period_end },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ ...report, sessions })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { summary_achievements, summary_general, summary_parents, mentor_id, status } = body

    const report = await prisma.report.update({
      where: { id: params.id },
      data: {
        ...(summary_achievements !== undefined && { summary_achievements }),
        ...(summary_general !== undefined && { summary_general }),
        ...(summary_parents !== undefined && { summary_parents }),
        ...(mentor_id !== undefined && { mentor_id: mentor_id || null }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json(report)
  } catch (err) {
    console.error('[PATCH /api/reports/[id]]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
