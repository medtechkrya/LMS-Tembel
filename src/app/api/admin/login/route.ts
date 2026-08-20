import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const validUser = process.env.ADMIN_USERNAME
  const validPass = process.env.ADMIN_PASSWORD

  if (!validUser || !validPass) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  })
  return res
}
