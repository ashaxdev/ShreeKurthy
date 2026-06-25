import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'

// Public endpoint - lookup orders by phone number (and optionally order number)
// No auth required since guests/customers may want to track without logging in,
// but we require the exact phone number used at checkout for privacy.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { phone, orderNumber } = await req.json()

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit phone number' }, { status: 400 })
    }

    const filter: Record<string, unknown> = { 'shippingAddress.phone': phone }
    if (orderNumber) filter.orderNumber = new RegExp(orderNumber.trim(), 'i')

    const orders = await Order.find(filter)
      .select('orderNumber status paymentStatus paymentMethod total items shippingAddress trackingNumber courierName createdAt estimatedDelivery deliveredAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: 'No orders found for this phone number' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: orders })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
