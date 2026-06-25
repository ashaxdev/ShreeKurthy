import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const filter: Record<string, unknown> = { role: 'user' }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ]
    }

    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ])

    // Attach order count + total spent per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ user: u._id, status: { $ne: 'cancelled' } }).select('total')
        return {
          ...u,
          orderCount: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
