import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Vercel deployment par request cookies se session check hota hai
  const userRole = request.cookies.get('userRole')?.value;

  // Agar user /admin wale kisi bhi route par ja raha hai
  if (url.pathname.startsWith('/admin')) {
    // Agar cookie mein role 'admin' nahi hai, to direct block karke home par redirect karo
    if (userRole !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// System ko batana ke middleware sirf /admin ke saare pages par trigger ho
export const config = {
  matcher: ['/admin/:path*'],
};