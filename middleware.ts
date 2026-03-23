import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((request) => {
  const { nextUrl } = request
  const isAuthenticated = Boolean(request.auth)
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isLoginRoute = nextUrl.pathname === '/login'

  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
