import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import User from '@/models/User'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/jwt'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'dashboard'
    const period = searchParams.get('period') || 'monthly'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const now = new Date()
    let start: Date, end: Date

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      switch (period) {
        case 'daily':
          start = startOfDay(now)
          end = endOfDay(now)
          break
        case 'weekly':
          start = startOfWeek(now, { weekStartsOn: 1 })
          end = endOfWeek(now, { weekStartsOn: 1 })
          break
        default:
          start = startOfMonth(now)
          end = endOfMonth(now)
      }
    }

    if (type === 'dashboard') {
      const [totalRevenue, totalOrders, totalUsers, totalProducts, recentOrders, topProducts] = await Promise.all([
        Order.aggregate([
          { $match: { status: { $nin: ['cancelled'] }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Product.countDocuments({ isActive: true }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
        Order.aggregate([
          { $unwind: '$items' },
          { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
          { $sort: { totalSold: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
        ]),
      ])

      // Last 30 days chart
      const last30Days = []
      for (let i = 29; i >= 0; i--) {
        const day = subDays(now, i)
        last30Days.push({ date: format(day, 'MMM dd'), start: startOfDay(day), end: endOfDay(day) })
      }

      const chartData = await Promise.all(
        last30Days.map(async ({ date, start: s, end: e }) => {
          const result = await Order.aggregate([
            { $match: { createdAt: { $gte: s, $lte: e }, status: { $nin: ['cancelled'] } } },
            { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
          ])
          return { date, revenue: result[0]?.revenue || 0, orders: result[0]?.orders || 0 }
        })
      )

      const ordersByStatus = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalUsers,
            totalProducts,
          },
          recentOrders,
          topProducts,
          chartData,
          ordersByStatus,
        },
      })
    }

    if (type === 'sales') {
      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled'] },
      }).populate('user', 'name email').lean()

      const summary = orders.reduce(
        (acc, o) => ({
          totalRevenue: acc.totalRevenue + o.total,
          totalOrders: acc.totalOrders + 1,
          totalItems: acc.totalItems + o.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
          avgOrderValue: 0,
        }),
        { totalRevenue: 0, totalOrders: 0, totalItems: 0, avgOrderValue: 0 }
      )
      summary.avgOrderValue = summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0

      return NextResponse.json({ success: true, data: { orders, summary, period, start, end } })
    }

    if (type === 'inventory') {
      const products = await Product.find({ isActive: true })
        .populate('category', 'name')
        .select('name totalStock totalSold averageRating colorVariants')
        .lean()

      const lowStock = products.filter(p => p.totalStock <= 10)
      const outOfStock = products.filter(p => p.totalStock === 0)

      return NextResponse.json({ success: true, data: { products, lowStock, outOfStock } })
    }

    return NextResponse.json({ success: false, message: 'Invalid report type' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
