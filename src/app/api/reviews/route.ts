import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Review } from '@/models/index'
import Product from '@/models/Product'
import Order from '@/models/Order'
import { getUserFromRequest } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product')
    const isAdmin = searchParams.get('admin') === 'true'

    const filter: Record<string, unknown> = {}
    if (productId) filter.product = productId
    if (!isAdmin) filter.isApproved = true

    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: reviews })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const body = await req.json()
    const isAdmin = user.role === 'admin'

    // Admin can create reviews on behalf of customers (with custom name, images, auto-approved)
    const reviewData: Record<string, unknown> = {
      product: body.product,
      userName: body.userName,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      images: body.images || [],
    }

    if (isAdmin && body.isAdminCreated) {
      reviewData.isAdminCreated = true
      reviewData.isApproved = true
      reviewData.isVerified = false
    } else {
      reviewData.user = user.userId
      reviewData.isApproved = false
      // Mark as verified purchase if the user has a delivered order containing this product
      const purchased = await Order.exists({
        user: user.userId,
        status: 'delivered',
        'items.product': body.product,
      })
      reviewData.isVerified = !!purchased
    }

    const review = await Review.create(reviewData)

    // Update product rating based on approved reviews only
    const reviews = await Review.find({ product: body.product, isApproved: true })
    const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    await Product.findByIdAndUpdate(body.product, {
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
