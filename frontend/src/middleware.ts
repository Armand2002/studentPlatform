import { NextResponse, type NextRequest } from 'next/server'

// Protect dashboard routes on the edge using a simple access token cookie
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const access = req.cookies.get('access_token')?.value

  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  // If trying to access dashboard without token -> redirect to login
  if (isDashboard && !access) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If on auth pages but already authenticated -> go to dashboard
  if (isAuthPage && access) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}


