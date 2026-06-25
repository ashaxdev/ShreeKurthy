import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { amount, currency = 'INR', receipt } = await req.json()

    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json({ success: true, data: order })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
