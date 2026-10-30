import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { student: { select: { name: true } } },
  })

  if (!session || !session.photo_path) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let rawBuffer: Buffer
  try {
    if (session.photo_path.startsWith('http://') || session.photo_path.startsWith('https://')) {
      const res = await fetch(session.photo_path)
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch photo from storage' }, { status: 404 })
      }
      rawBuffer = Buffer.from(await res.arrayBuffer())
    } else {
      const filePath = path.join(process.cwd(), 'public', session.photo_path)
      rawBuffer = await readFile(filePath)
    }
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Convert to PNG on-the-fly
  let pngBuffer: Buffer
  try {
    pngBuffer = await sharp(rawBuffer).png().toBuffer()
  } catch {
    // Fallback to rawBuffer if sharp fails on corrupt format
    pngBuffer = rawBuffer
  }

  const studentName = (session.student?.name || 'Session').trim().replace(/[/\\?%*:|"<>]/g, '')
  const dateStr = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, '-')
  const filename = `${dateStr}-${studentName}.png`

  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pngBuffer.length),
      'Accept-Ranges': 'none',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
