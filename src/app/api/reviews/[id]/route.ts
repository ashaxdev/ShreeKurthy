import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Review } from '@/models/index'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/jwt'

async function recalcProductRating(productId: string) {
  const reviews = await Review.find({ product: productId, isApproved: true })
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    const review = await Review.findByIdAndUpdate(
      params.id,
      { isApproved: body.isApproved },
      { new: true }
    )
    if (!review) return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 })

    await recalcProductRating(review.product.toString())

    return NextResponse.json({ success: true, data: review })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()

    const review = await Review.findById(params.id)
    if (!review) return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 })

    const productId = review.product.toString()
    await Review.findByIdAndDelete(params.id)
    await recalcProductRating(productId)

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
