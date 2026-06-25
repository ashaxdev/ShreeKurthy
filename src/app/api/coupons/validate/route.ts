import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Coupon } from '@/models/index'
import { getUserFromRequest } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const { code, orderAmount } = await req.json()
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

    if (!coupon) return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 400 })
    if (new Date() > coupon.expiresAt) return NextResponse.json({ success: false, message: 'Coupon expired' }, { status: 400 })
    if (coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 })
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        success: false,
        message: `Minimum order ₹${coupon.minOrderAmount} required`
      }, { status: 400 })
    }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.value
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount: Math.round(discount),
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      }
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
