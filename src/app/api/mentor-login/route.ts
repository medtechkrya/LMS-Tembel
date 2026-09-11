import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    if (!pin) {
      return NextResponse.json({ error: 'PIN tidak boleh kosong' }, { status: 400 })
    }

    const validPin = process.env.MENTOR_PIN

    if (pin === validPin) {
      // Set HttpOnly cookie for 30 days
      cookies().set({
        name: 'mentor_session',
        value: 'true',
        httpOnly: true,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        sameSite: 'lax',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'PIN Salah.' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 })
  }
}
