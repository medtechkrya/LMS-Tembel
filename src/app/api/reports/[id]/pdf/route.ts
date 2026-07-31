import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePdfBuffer, getPdfFilename } from '@/lib/pdf'

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

  const pdfBuffer = await generatePdfBuffer({ ...report, sessions })
  const filename = getPdfFilename(report.student.name, report.period_end)

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
