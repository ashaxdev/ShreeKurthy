import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, password, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields required' }, { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 })
    }

    const user = await User.create({ name, email, password, phone })
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const res = NextResponse.json({
      success: true,
      message: 'Account created',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
    }, { status: 201 })

    res.cookies.set('token', token, { httpOnly: true, maxAge: 7 * 24 * 3600, path: '/' })
    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
