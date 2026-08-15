import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isSchoolRoute = pathname.startsWith('/school');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isSchoolRoute || isAdminRoute) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'super-secret-random-32-character-key-here',
    });

    // Unauthenticated -> redirect to /login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based protection for /admin
    if (isAdminRoute && (token as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/school', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/school/:path*', '/admin/:path*'],
};
