import { NextRequest, NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { Writable } from 'stream'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

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
  const usedNames = new Map<string, number>()

  for (const session of sessions) {
    if (!session.photo_path) continue
    try {
      let rawData: Buffer
      if (session.photo_path.startsWith('http://') || session.photo_path.startsWith('https://')) {
        const res = await fetch(session.photo_path)
        if (!res.ok) continue
        rawData = Buffer.from(await res.arrayBuffer())
      } else {
        const filePath = path.join(process.cwd(), 'public', session.photo_path)
        await access(filePath)
        rawData = await readFile(filePath)
      }

      // Convert to PNG for download
      let pngData: Buffer
      try {
        pngData = await sharp(rawData).png().toBuffer()
      } catch {
        pngData = rawData
      }

      const dateStr = new Date(session.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-')

      const cleanStudentName = (session.student?.name || 'Student').trim().replace(/[/\\?%*:|"<>]/g, '')
      const baseName = `${dateStr}-${cleanStudentName}`
      const count = (usedNames.get(baseName) || 0) + 1
      usedNames.set(baseName, count)
      const filename = count === 1 ? `${baseName}.png` : `${baseName}-${count}.png`

      files.push({ name: filename, data: pngData })
    } catch {
      // file missing or network error — skip
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

  return new Response(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`,
      'Content-Length': String(zipBuffer.length),
      'Accept-Ranges': 'none',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
