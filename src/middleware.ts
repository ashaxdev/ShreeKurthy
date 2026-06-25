import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ssrk_secret_key_2024'
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}