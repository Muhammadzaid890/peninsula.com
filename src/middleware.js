import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Agar user /admin wale kisi bhi route par ja raha hai
  if (pathname.startsWith('/admin')) {
    const userRole = request.cookies.get('userRole')?.value;
    const authToken = request.cookies.get('auth_token')?.value;

    // Strict redirect ke bajaye allow check karein
    if (!userRole && !authToken) {
      // Agar cookie bilkul nahi hai tabhi login par bhejo
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};