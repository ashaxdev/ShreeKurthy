import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }, token },
    })

    res.cookies.set('token', token, { httpOnly: true, maxAge: 7 * 24 * 3600, path: '/', sameSite: 'lax' })
    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
