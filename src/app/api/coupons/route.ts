import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Coupon } from '@/models/index'
import { requireAdmin, getUserFromRequest } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    if (user.role === 'admin') {
      const coupons = await Coupon.find().sort({ createdAt: -1 })
      return NextResponse.json({ success: true, data: coupons })
    }

    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const coupon = await Coupon.create(body)
    return NextResponse.json({ success: true, data: coupon }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
