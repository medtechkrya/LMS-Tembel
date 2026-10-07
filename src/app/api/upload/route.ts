import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP allowed' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
    });
    return NextResponse.json({ path: blob.url })
  } catch (err: any) {
    console.error("Vercel Blob Upload Error:", err)
    return NextResponse.json({ error: err.message || 'Failed to upload to Vercel Blob. Make sure BLOB_READ_WRITE_TOKEN is set.' }, { status: 500 })
  }
}