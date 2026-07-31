import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { Writable } from 'stream'
import { prisma } from '@/lib/prisma'

function collectZip(files: Array<{ name: string; data: Buffer }>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const sink = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) { chunks.push(chunk); cb() },
    })
    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.on('error', reject)
    sink.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.pipe(sink)
    for (const f of files) archive.append(f.data, { name: f.name })
    archive.finalize()
  })
}

export async function GET(req: NextRequest) {
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
    include: { student: { select: { name: true } } },
    orderBy: { date: 'asc' },
  })

  const files: Array<{ name: string; data: Buffer }> = []

  for (const session of sessions) {
    if (!session.photo_path) continue
    const filePath = path.join(process.cwd(), 'public', session.photo_path)
    try {
      await access(filePath)
      const data = await readFile(filePath)
      const ext = session.photo_path.split('.').pop() ?? 'jpg'
      const dateStr = new Date(session.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-')
      files.push({ name: `${dateStr}-${session.id.slice(0, 6)}.${ext}`, data })
    } catch {
      // file missing — skip
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No photos found for this period' }, { status: 404 })
  }

  const studentName = sessions[0]?.student.name.replace(/\s+/g, '') ?? 'Student'
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric',
  }).replace(' ', '')
  const zipFilename = `Photos-${studentName}-${monthLabel}.zip`

  const zipBuffer = await collectZip(files)

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`,
    },
  })
}
