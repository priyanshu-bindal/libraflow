import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Ultra-lightweight edge middleware — only checks that a session cookie
 * exists. No NextAuth, no Prisma, no zod imported here.
 * Real session validation + role checks happen in Server Components via auth().
 */
export function middleware(request: NextRequest) {
  // Auth.js v5 sets one of these cookie names depending on environment
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token');

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
