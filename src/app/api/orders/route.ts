import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getUserFromRequest, requireAdmin } from '@/lib/jwt'

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SSRK-${timestamp}-${random}`
}

export async function GET(req: NextRequest) {
  try {
    const user =await  getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isAdmin = user.role === 'admin'

    const filter: Record<string, unknown> = {}
    if (!isAdmin) filter.user = user.userId
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate)
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user =await  getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const body = await req.json()
    const { items, shippingAddress, paymentMethod, couponCode, couponDiscount = 0, notes } = body

    // Validate items and calculate subtotal
    let subtotal = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) throw new Error(`Product not found: ${item.product}`)

      const colorVariant = product.colorVariants.find(
        (cv: { colorName: string }) => cv.colorName === item.colorName
      )
      const sizeVariant = colorVariant?.sizes.find(
        (s: { size: string; stock: number }) => s.size === item.size && s.stock >= item.quantity
      )

      if (!sizeVariant) throw new Error(`Size ${item.size} not available`)

      subtotal += sizeVariant.price * item.quantity
      validatedItems.push({
        product: item.product,
        name: product.name,
        image: colorVariant?.images?.[0] || product.images?.[0],
        colorName: item.colorName,
        colorHex: colorVariant?.colorHex || '#000',
        size: item.size,
        price: sizeVariant.price,
        mrp: sizeVariant.mrp,
        quantity: item.quantity,
        sku: sizeVariant.sku,
      })
    }

    const shippingCharge = subtotal >= 999 ? 0 : 60
    const tax = 0
    const total = subtotal - couponDiscount + shippingCharge + tax

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: user.userId,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      couponDiscount,
      subtotal,
      shippingCharge,
      tax,
      total,
      notes,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
    })

    // Update stock
    for (const item of validatedItems) {
      await Product.updateOne(
        { _id: item.product, 'colorVariants.colorName': item.colorName, 'colorVariants.sizes.size': item.size },
        {
          $inc: {
            'colorVariants.$[cv].sizes.$[sz].stock': -item.quantity,
            totalSold: item.quantity,
            totalStock: -item.quantity,
          },
        },
        {
          arrayFilters: [
            { 'cv.colorName': item.colorName },
            { 'sz.size': item.size },
          ],
        }
      )
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
