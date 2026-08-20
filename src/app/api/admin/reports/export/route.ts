import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePdfBuffer, getPdfFilename } from '@/lib/pdf'
import archiver from 'archiver'
import { Writable } from 'stream'

function collectZip(
  files: Array<{ name: string; data: Buffer }>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const sink = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) {
        chunks.push(chunk)
        cb()
      },
    })
    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.on('error', reject)
    sink.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.pipe(sink)
    for (const f of files) {
      archive.append(f.data, { name: f.name })
    }
    archive.finalize()
  })
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') // e.g. "2026-04"
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ error: 'period param required (YYYY-MM)' }, { status: 400 })
  }

  const [year, month] = period.split('-').map(Number)
  const periodStart = new Date(year, month - 1, 1)   // start of month
  const periodEnd = new Date(year, month, 0, 23, 59, 59) // last day of month

  const reports = await prisma.report.findMany({
    where: {
      status: { in: ['done', 'sent'] },
      period_end: { gte: periodStart, lte: periodEnd },
    },
    include: { student: true, mentor: true },
  })

  if (reports.length === 0) {
    return NextResponse.json({ error: 'No done/sent reports for this period' }, { status: 404 })
  }

  const files: Array<{ name: string; data: Buffer }> = []

  for (const report of reports) {
    const sessions = await prisma.session.findMany({
      where: {
        student_id: report.student_id,
        date: { gte: report.period_start, lte: report.period_end },
      },
      orderBy: { date: 'asc' },
    })

    const pdfBuffer = await generatePdfBuffer({ ...report, sessions })
    const filename = getPdfFilename(report.student.name, report.period_end)
    files.push({ name: filename, data: pdfBuffer })
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }).replace(' ', '')

  const zipBuffer = await collectZip(files)

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="TemanBelajar-Reports-${monthLabel}.zip"`,
    },
  })
}
