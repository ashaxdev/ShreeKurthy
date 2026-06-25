import * as jose from 'jose'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET_STRING =
  process.env.JWT_SECRET || 'ssrk_secret_key_2024'

const JWT_SECRET = new TextEncoder().encode(SECRET_STRING)

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

// Sign token (Node.js runtime)
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET_STRING, {
    expiresIn: '7d',
  })
}

// Verify token (Edge runtime)
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      JWT_SECRET
    )

    return payload as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(
  req: NextRequest
): string | null {
  const authHeader = req.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return req.cookies.get('token')?.value || null
}

export async function getUserFromRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(req)

  if (!token) return null

  return await verifyToken(token)
}

export async function requireAuth(
  req: NextRequest
): Promise<JWTPayload> {
  const user = await getUserFromRequest(req)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireAdmin(
  req: NextRequest
): Promise<JWTPayload> {
  const user = await requireAuth(req)

  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return user
}