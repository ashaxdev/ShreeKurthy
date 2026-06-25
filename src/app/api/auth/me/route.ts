import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getUserFromRequest } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    // /api/auth/me
   const payload = await getUserFromRequest(req)
    if (!payload) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out' })
  res.cookies.delete('token')
  return res
}
