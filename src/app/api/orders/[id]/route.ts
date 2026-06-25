import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import { getUserFromRequest } from '@/lib/jwt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const order = await Order.findById(params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug')

    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    if (user.role !== 'admin' && order.user._id.toString() !== user.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    if (user.role === 'admin') {
      if (body.status) updates.status = body.status
      if (body.paymentStatus) updates.paymentStatus = body.paymentStatus
      if (body.trackingNumber) updates.trackingNumber = body.trackingNumber
      if (body.courierName) updates.courierName = body.courierName
      if (body.courierBill) updates.courierBill = body.courierBill
      if (body.estimatedDelivery) updates.estimatedDelivery = body.estimatedDelivery
      if (body.razorpayPaymentId) updates.razorpayPaymentId = body.razorpayPaymentId
      if (body.razorpayOrderId) updates.razorpayOrderId = body.razorpayOrderId
      if (body.status === 'delivered') updates.deliveredAt = new Date()
      if (body.status === 'cancelled') {
        updates.cancelledAt = new Date()
        updates.cancelReason = body.cancelReason
      }
    } else {
      // User can only cancel pending orders
      if (body.status === 'cancelled') {
        const order = await Order.findById(params.id)
        if (!order || order.status !== 'pending') {
          return NextResponse.json({ success: false, message: 'Cannot cancel this order' }, { status: 400 })
        }
        updates.status = 'cancelled'
        updates.cancelledAt = new Date()
        updates.cancelReason = body.cancelReason || 'Cancelled by user'
      }
    }

    const order = await Order.findByIdAndUpdate(params.id, updates, { new: true })
    return NextResponse.json({ success: true, data: order })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
