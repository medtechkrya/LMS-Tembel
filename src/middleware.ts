import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routing
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const adminCookie = request.cookies.get('admin_session')
    if (!adminCookie || adminCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Mentor routing
  if (pathname.startsWith('/sessions') || pathname.startsWith('/reports') || pathname.startsWith('/mentors')) {
    const mentorCookie = request.cookies.get('mentor_session')
    if (!mentorCookie || mentorCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/mentor-login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/sessions/:path*', '/reports/:path*', '/mentors/:path*'],
}
