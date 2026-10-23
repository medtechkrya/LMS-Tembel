import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()
    const cleanPin = String(pin || '').trim()

    if (!cleanPin) {
      return NextResponse.json({ error: 'PIN is required / PIN tidak boleh kosong' }, { status: 400 })
    }

    const mentor = await prisma.mentor.findFirst({
      where: {
        pin: cleanPin,
        status: { not: 'archived' },
      },
    })

    if (!mentor) {
      return NextResponse.json(
        { error: 'Incorrect PIN. Please try again / PIN Salah. Silakan coba lagi.' },
        { status: 401 }
      )
    }

    if (mentor.status !== 'active') {
      return NextResponse.json(
        { error: 'This mentor account is currently inactive / Akun mentor ini sedang tidak aktif.' },
        { status: 403 }
      )
    }

    const res = NextResponse.json({
      success: true,
      mentor: { id: mentor.id, name: mentor.name },
    })

    res.cookies.set({
      name: 'mentor_session',
      value: mentor.id,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60, // 1 day (24 hours) in seconds
      sameSite: 'lax',
    })

    return res
  } catch (err) {
    console.error('Mentor login error:', err)
    return NextResponse.json(
      { error: 'System error. Please try again later / Terjadi kesalahan sistem.' },
      { status: 500 }
    )
  }
}
