import { NextResponse } from 'next/server'

// Optimistic auth check: redirect signed-out visitors away from
// account-only pages. Real authorization still happens server-side in each
// page and API route — this only improves UX and keeps crawlers out.
export function proxy(request) {
  const hasSessionCookie =
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('authjs.session-token')

  if (!hasSessionCookie) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/orders/:path*', '/checkout/:path*', '/admin/:path*'],
}
