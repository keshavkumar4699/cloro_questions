// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import config from '@/config';

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(
      new URL(`/auth?mode=login&callbackUrl=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  return NextResponse.next();
}